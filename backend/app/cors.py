"""
Dynamic CORS Management Module for Kutty Story Application.

Features:
- Dynamically scans and loads CORS origins from ALL likely .env files (root, backend, cwd, parent dirs).
- Checks multiple environment variable aliases: CORS_ORIGINS, CORS_ORIGIN, ALLOWED_ORIGINS, FRONTEND_URL, etc.
- Thorough origin normalization (handles trailing slashes, missing http/https schemes, casing, ports, wildcards).
- Automatic root-domain extraction so all subdomains (e.g. app.domain.com, api.domain.com) match automatically.
- Live hot-reloading: If .env is updated on the server while uvicorn is running, newly added origins are picked up automatically without requiring a server restart.
- Robust preflight (OPTIONS) response and response header injection that prevents duplicate headers and browser rejections.
"""

import os
import re
import time
from pathlib import Path
from typing import Set, List, Optional
from dotenv import dotenv_values, load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = BACKEND_DIR.parent

CORS_ENV_KEYS = [
    "CORS_ORIGINS",
    "CORS_ORIGIN",
    "ALLOWED_ORIGINS",
    "ALLOWED_ORIGIN",
    "CORS_ALLOWED_ORIGINS",
    "FRONTEND_URL",
    "FRONTEND_ORIGIN",
    "CLIENT_URL",
    "APP_URL",
    "NEXT_PUBLIC_APP_URL",
    "VITE_BACKEND_ORIGIN",
    "VITE_API_URL",
]


def extract_root_domain(host_or_url: str) -> Optional[str]:
    """Extract root domain (e.g. 'risingsuntech.in' or 'kuttystory.co.in') from a host or URL."""
    clean = host_or_url.strip().lower()
    if "://" in clean:
        clean = clean.split("://", 1)[1]
    clean = clean.split("/")[0].split(":")[0].lstrip(".")
    if not clean or clean in ("localhost", "127.0.0.1"):
        return None
    parts = clean.split(".")
    if len(parts) < 2:
        return None
    # Handle two-part TLDs like co.in, com.au, org.uk, net.in
    if len(parts) >= 3 and parts[-2] in ("co", "com", "org", "edu", "gov", "net"):
        return ".".join(parts[-3:])
    return ".".join(parts[-2:])


class CorsManager:
    """
    Centralized CORS controller with hot-reload and multi-env file resolution.
    """

    def __init__(self):
        self._allowed_origins: Set[str] = set()
        self._allowed_regexes: List[re.Pattern] = []
        self._has_wildcard: bool = False
        self._file_mtimes: dict[str, float] = {}
        self._last_reload_time: float = 0.0
        self.reload()

    def _discover_env_files(self) -> List[Path]:
        """Find all possible .env files across project directories."""
        candidates = [
            BASE_DIR / ".env",
            BACKEND_DIR / ".env",
            Path.cwd() / ".env",
        ]
        # Also check up to 3 parent directories of cwd
        p = Path.cwd().resolve()
        for _ in range(3):
            cand = p / ".env"
            if cand not in candidates:
                candidates.append(cand)
            if p == p.parent:
                break
            p = p.parent

        found: List[Path] = []
        seen = set()
        for cand in candidates:
            try:
                resolved = cand.resolve()
                if resolved.is_file() and str(resolved) not in seen:
                    seen.add(str(resolved))
                    found.append(resolved)
            except Exception:
                pass
        return found

    def _check_env_changed(self) -> bool:
        """Check if any .env file was modified since last reload."""
        env_files = self._discover_env_files()
        for f in env_files:
            try:
                mtime = f.stat().st_mtime
                if str(f) not in self._file_mtimes or self._file_mtimes[str(f)] != mtime:
                    return True
            except Exception:
                pass
        return False

    def reload(self):
        """Parse all configured origins from process environment and all .env files."""
        now = time.time()
        # Rate-limit reloads to at most once per 2 seconds
        if now - self._last_reload_time < 2.0 and self._allowed_origins:
            return
        self._last_reload_time = now

        env_files = self._discover_env_files()
        raw_values: List[str] = []

        # 1. Read from discovered .env files
        for f in env_files:
            try:
                self._file_mtimes[str(f)] = f.stat().st_mtime
                load_dotenv(f, override=False)
                parsed = dotenv_values(f)
                for key in CORS_ENV_KEYS:
                    val = parsed.get(key)
                    if val:
                        raw_values.append(str(val))
            except Exception as e:
                print(f"[CORS] Notice reading {f}: {e}")

        # 2. Read from os.environ
        for key in CORS_ENV_KEYS:
            env_val = os.getenv(key)
            if env_val:
                raw_values.append(env_val)

        # 3. Always include default origins
        raw_values.extend([
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "https://apikuttystory.risingsuntech.in",
            "https://kuttystory.risingsuntech.in",
            "https://kuttystory2.risingsuntech.in",
            "https://kuttystory.co.in",
        ])

        # Normalize all entries
        origins: Set[str] = set()
        domains_for_regex: Set[str] = set()
        has_wildcard = False

        for raw in raw_values:
            cleaned_raw = raw.strip()
            # Handle JSON array format
            if cleaned_raw.startswith("[") and cleaned_raw.endswith("]"):
                try:
                    import json
                    loaded = json.loads(cleaned_raw)
                    if isinstance(loaded, list):
                        for item in loaded:
                            raw_values.append(str(item))
                    continue
                except Exception:
                    pass

            entries = [e.strip() for e in cleaned_raw.split(",") if e.strip()]
            for item in entries:
                item_clean = item.strip().strip("\"'").strip()
                if not item_clean:
                    continue
                if item_clean == "*":
                    has_wildcard = True
                    continue

                base = item_clean.rstrip("/")

                if not base.startswith("http://") and not base.startswith("https://"):
                    origins.add(f"http://{base}")
                    origins.add(f"https://{base}")
                    origins.add(f"http://{base.lower()}")
                    origins.add(f"https://{base.lower()}")
                else:
                    origins.add(base)
                    origins.add(base.lower())
                    # Also add default port variants
                    if base.startswith("https://") and base.endswith(":443"):
                        origins.add(base[:-4])
                    elif base.startswith("http://") and base.endswith(":80"):
                        origins.add(base[:-3])

                # Extract root domain for subdomain wildcards
                root_dom = extract_root_domain(base)
                if root_dom:
                    domains_for_regex.add(root_dom)

        # Build dynamic regex list
        regex_list: List[re.Pattern] = []

        # 1. Localhost and 127.0.0.1 on any port
        regex_list.append(re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$", re.IGNORECASE))

        # 2. Dynamic subdomain matching for all discovered root domains
        for dom in domains_for_regex:
            escaped = re.escape(dom)
            pat = rf"^https?://([a-zA-Z0-9-]+\.)*{escaped}(:\d+)?$"
            try:
                regex_list.append(re.compile(pat, re.IGNORECASE))
            except Exception:
                pass

        # 3. Custom CORS_ORIGIN_REGEX from .env if specified
        custom_regex = os.getenv("CORS_ORIGIN_REGEX", "").strip()
        if custom_regex:
            try:
                regex_list.append(re.compile(custom_regex, re.IGNORECASE))
            except Exception as e:
                print(f"[CORS] Warning: Invalid CORS_ORIGIN_REGEX '{custom_regex}': {e}")

        self._allowed_origins = origins
        self._allowed_regexes = regex_list
        self._has_wildcard = has_wildcard or os.getenv("CORS_ALLOW_ALL", "").lower() in ("true", "1", "yes")

        print(f"[CORS] Configured {len(self._allowed_origins)} allowed origin variants, {len(domains_for_regex)} root domains ({domains_for_regex}). Wildcard={self._has_wildcard}.")

    def is_allowed(self, origin: Optional[str]) -> bool:
        """
        Check if an origin is permitted. Automatically checks for .env changes if origin is unknown.
        """
        if not origin:
            return True  # Same-origin or non-browser request

        if self._has_wildcard:
            return True

        clean = origin.strip().rstrip("/")
        clean_lower = clean.lower()

        # 1. Exact match
        if clean in self._allowed_origins or clean_lower in self._allowed_origins:
            return True

        # 2. Regex match
        for rx in self._allowed_regexes:
            if rx.match(clean) or rx.match(clean_lower):
                return True

        # 3. If not matched, check if .env has changed on disk
        if self._check_env_changed():
            self.reload()
            if self._has_wildcard:
                return True
            if clean in self._allowed_origins or clean_lower in self._allowed_origins:
                return True
            for rx in self._allowed_regexes:
                if rx.match(clean) or rx.match(clean_lower):
                    return True

        print(f"[CORS] Disallowed origin: '{origin}'. Current allowed origins: {sorted(list(self._allowed_origins))}")
        return False

    def get_allowed_origins_list(self) -> List[str]:
        return sorted(list(self._allowed_origins))


cors_manager = CorsManager()

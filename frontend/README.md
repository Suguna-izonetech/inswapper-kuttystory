# 🦄 Storybook Studio — Frontend Application

Modern **React + TypeScript (Vite & React Router)** Single Page Application for the Personalized AI Children's Storybook platform, styled with a soft editorial luxury aesthetic inspired by **KuttyStory** and **Diffrun**.

For the complete end-to-end architecture, backend details, and workflow sequence diagram, see the main [README.md](file:///c:/izone%20projects/Baby%20story/README.md) in the project root.

---

## 🎨 Soft Editorial Luxury Design Tokens

- **Warm Ivory Background**: `#FAF7F2` (Base page surface)
- **Dusty Rose Accent**: `#C98A84` & `#FAEEED` (Primary CTAs and highlight pills)
- **Soft Lavender Accent**: `#B8A9C9` & `#F2EEF7` (Magical details & secondary tags)
- **Muted Sage Green**: `#8F9E8B` & `#EEF4ED` (Trust badges & success indicators)
- **Deep Plum Typography**: `#2D222A` & `#695B64` (Editorial serif headlines & readable body text)
- **Typography Hierarchy**: *Cormorant Garamond* (Editorial Serif) paired with *Plus Jakarta Sans* (Clean Body Sans).

---

## 🧭 Page Routes & Workflow

| URL Route | Purpose | Features |
| :--- | :--- | :--- |
| **`/`** | **Customer Homepage** | Editorial hero, curated story catalog, 3-step atelier process, privacy & child safety charter. |
| **`/personalize/:slug`** | **Personalization Wizard & Viewer** | Child name entry, photo upload with drag-and-drop, guardian consent confirmation, live generation progress tracking, and interactive book viewer with single-page retry. |
| **`/poc`** | **3-Image Character Consistency POC** | Side-by-side comparison of three representative story scenes (Portrait Page 7, Action Page 10, Rescue Page 13) with latency, cost, and admin approval controls. |
| **`/admin`** | **Administrative Atelier** | KPI metrics overview, page editor with thumbnail navigation, story narrative text editor, prompt tuner, and AI provider switcher. |

---

## ⚙️ Running the Frontend

```powershell
# 1. Install dependencies (if not already installed)
npm install

# 2. Start Vite development server on port 5173
npm run dev

# 3. Build for production (TypeScript check + Vite bundle)
npm run build
```

The application runs on `http://localhost:5173` by default.

*Note: All requests to `/api/v1/*` are automatically proxied to the FastAPI backend running at `http://127.0.0.1:8000` via [`vite.config.ts`](file:///c:/izone%20projects/Baby%20story/frontend/vite.config.ts).*

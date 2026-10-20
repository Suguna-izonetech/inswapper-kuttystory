import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Maximize2,
  Minimize2,
  Globe,
  Languages
} from "lucide-react";
import { GeneratedAsset } from "@/lib/api";

export const SUPPORTED_LANGUAGES = [
  { id: "english", label: "English", native: "English", flag: "🇬🇧" },
  { id: "tamil", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { id: "malayalam", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { id: "hindi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { id: "marathi", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
  { id: "telugu", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { id: "kannada", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
];

interface RealisticBookFlipViewerProps {
  assets: GeneratedAsset[];
  currentPageIdx: number;
  onPageChange: (index: number) => void;
  childPhotoUrl?: string | null;
  childName?: string;
  storyTitle?: string;
  onRetryPage?: (assetId: string) => void;
  isRetrying?: boolean;
  selectedLanguage?: string;
  onLanguageChange?: (languageId: string) => void;
  translatedTexts?: Record<string, string>;
  isTranslating?: boolean;
}

export default function RealisticBookFlipViewer({
  assets,
  currentPageIdx,
  onPageChange,
  childPhotoUrl,
  childName = "Your Child",
  storyTitle = "Storybook",
  onRetryPage,
  isRetrying = false,
  selectedLanguage = "english",
  onLanguageChange,
  translatedTexts = {},
  isTranslating = false,
}: RealisticBookFlipViewerProps) {
  // Animation & Playback states
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [fromPageIdx, setFromPageIdx] = useState(currentPageIdx);
  const [toPageIdx, setToPageIdx] = useState(currentPageIdx);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [flipProgress, setFlipProgress] = useState(0); // 0 to 100 for physics styling

  const containerRef = useRef<HTMLDivElement>(null);
  const flipDurationMs = 800;


  // Handle page turn with realistic 3D paper curl physics
  const triggerFlip = useCallback(
    (targetIdx: number) => {
      if (isFlipping || targetIdx === currentPageIdx || targetIdx < 0 || targetIdx >= assets.length) {
        return;
      }

      const dir = targetIdx > currentPageIdx ? "next" : "prev";
      setFlipDirection(dir);
      setFromPageIdx(currentPageIdx);
      setToPageIdx(targetIdx);
      setIsFlipping(true);
      setFlipProgress(0);

      // Animate progress smoothly for dynamic light/shadow rendering
      const startTime = performance.now();
      const duration = flipDurationMs;

      const updateProgress = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(100, Math.round((elapsed / duration) * 100));
        setFlipProgress(progress);
        if (progress < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          onPageChange(targetIdx);
          setIsFlipping(false);
          setFlipProgress(0);
        }
      };

      requestAnimationFrame(updateProgress);
    },
    [isFlipping, currentPageIdx, assets.length, onPageChange, flipDurationMs]
  );

  const handleNext = useCallback(() => {
    if (assets.length === 0) return;
    if (currentPageIdx < assets.length - 1) {
      triggerFlip(currentPageIdx + 1);
    } else {
      // Loop back to page 1 for continuous story presentation
      triggerFlip(0);
    }
  }, [currentPageIdx, assets.length, triggerFlip]);

  const handlePrev = useCallback(() => {
    if (currentPageIdx > 0) {
      triggerFlip(currentPageIdx - 1);
    } else {
      triggerFlip(assets.length - 1);
    }
  }, [currentPageIdx, assets.length, triggerFlip]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  const currentAsset = assets[currentPageIdx];
  const fromAsset = assets[fromPageIdx];
  const toAsset = assets[toPageIdx];

  const getAssetNarrative = useCallback(
    (asset?: GeneratedAsset | null) => {
      if (!asset) return "";
      if (translatedTexts && translatedTexts[asset.id]) {
        return translatedTexts[asset.id];
      }
      let text = asset.story_text || asset.prompt_used || "";
      const cleanChild = childName && childName.trim() ? childName.trim() : "Your Child";
      ["[Name]", "[name]", "{name}", "[child_name]", "{child_name}"].forEach((tag) => {
        text = text.split(tag).join(cleanChild);
      });
      return text;
    },
    [translatedTexts, childName]
  );

  const activeAsset = isFlipping ? toAsset : currentAsset;
  const activeNarrative = getAssetNarrative(activeAsset);
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage);

  return (
    <div
      ref={containerRef}
      className={`space-y-6 ${isFullscreen
          ? "fixed inset-0 z-50 bg-[#F5EEDB] overflow-y-auto p-4 flex flex-col justify-center items-center"
          : ""
        }`}
    >
      {/* 1. Realistic Storybook Table Canvas (Spacious & Cleanly Framed) */}
      <div
        className="relative rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden border border-[#DDD6C0] shadow-sm select-none transition-all duration-300"
        style={{
          backgroundColor: "#EDE4CE",
          backgroundImage: `
            linear-gradient(#E2D8BF 1px, transparent 1px),
            linear-gradient(90deg, #E2D8BF 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px"
        }}
      >
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-[#E5DCBF]/25 to-[#D5CBAE]/50 pointer-events-none" />

        {/* Top Control Bar: Page counter & Fullscreen */}
        <div className="relative z-20 flex items-center justify-between pb-3 sm:pb-5">
          {/* Page Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#DDD5C0] text-xs font-semibold text-[#5B4F3A] shadow-xs">
              Page {currentPageIdx + 1} of {assets.length}
            </span>
          </div>

          {/* Fullscreen control */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
              className="p-1.5 sm:p-2 rounded-full bg-white/80 hover:bg-white text-[#5B4F3A] border border-[#DDD5C0] shadow-xs transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. REALISTIC HARDCOVER STORYBOOK MOCKUP (INCREASED PROMINENT SIZE) */}
        <div className="relative max-w-4xl mx-auto flex items-center justify-center my-2 sm:my-5">
          {/* Outer Book Perspective Wrapper: Large, immersive landscape aspect ratio */}
          <div
            className="relative w-full max-w-[580px] sm:max-w-[680px] md:max-w-[760px] lg:max-w-[820px] aspect-[1.28/1]"
            style={{ perspective: "2000px" }}
          >
            {/* 3D Hardcover Book Body */}
            <div
              className="relative w-full h-full rounded-r-xl rounded-l-sm overflow-visible transition-all duration-300"
              style={{
                boxShadow: `
                  2px 2px 0px #DDD5C2,
                  4px 4px 0px #D5CCB6,
                  6px 7px 0px #CCC2AA,
                  8px 10px 0px #C2B89F,
                  0 20px 35px -8px rgba(45, 34, 42, 0.35),
                  0 8px 16px -4px rgba(0, 0, 0, 0.15)
                `
              }}
            >
              {/* Stacked Paper Page Edges (Right and Bottom Thickness) */}
              <div
                className="absolute -right-2.5 top-1.5 bottom-1.5 w-2.5 rounded-r-sm pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(to right, #FAF7EE, #FAF7EE 1px, #E5DCB8 2px, #FAF7EE 3px)",
                  boxShadow: "inset 2px 0 2px rgba(0,0,0,0.12)"
                }}
              />
              <div
                className="absolute -bottom-2.5 left-2.5 right-0 h-2.5 rounded-b-sm pointer-events-none"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, #FAF7EE, #FAF7EE 1px, #E5DCB8 2px, #FAF7EE 3px)",
                  boxShadow: "inset 0 2px 2px rgba(0,0,0,0.12)"
                }}
              />

              {/* Hardcover Spine on Left (True bound spine fold with crease & highlight) */}
              <div
                className="absolute top-0 bottom-0 left-0 w-7 sm:w-8 z-40 rounded-l-sm pointer-events-none"
                style={{
                  background: `
                    linear-gradient(to right,
                      rgba(0, 0, 0, 0.5) 0%,
                      rgba(255, 255, 255, 0.25) 12%,
                      rgba(0, 0, 0, 0.3) 40%,
                      rgba(0, 0, 0, 0.12) 75%,
                      transparent 100%
                    )
                  `,
                  boxShadow: "inset 2px 0 4px rgba(0, 0, 0, 0.25)"
                }}
              />
              {/* Embossed Spine Hinge Crease */}
              <div
                className="absolute top-0 bottom-0 left-6 sm:left-7 w-[1.5px] z-40 pointer-events-none"
                style={{
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(255,255,255,0.25), rgba(0,0,0,0.3))",
                  boxShadow: "1px 0 1px rgba(255,255,255,0.4)"
                }}
              />

              {/* BOOK SPREAD CONTAINER */}
              <div className="relative w-full h-full rounded-r-xl rounded-l-sm overflow-hidden bg-[#FAF7EE]">
                {/* 1. Underlying Destination Page */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={isFlipping ? toAsset?.image_url : currentAsset?.image_url}
                    alt="Book Page"
                    className="w-full h-full object-cover select-none"
                    draggable={false}
                  />

                  {/* Dynamic shadow sweeping across underlying page during flip */}
                  {isFlipping && (
                    <div
                      className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                      style={{
                        background:
                          flipDirection === "next"
                            ? `linear-gradient(to right, rgba(0,0,0,${Math.sin((flipProgress / 100) * Math.PI) * 0.45}) 0%, transparent 60%)`
                            : `linear-gradient(to left, rgba(0,0,0,${Math.sin((flipProgress / 100) * Math.PI) * 0.45}) 0%, transparent 60%)`
                      }}
                    />
                  )}

                  {/* Top-Right Cover Sheen */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.04) 25%, transparent 60%)"
                    }}
                  />

                  {/* Spine Gutter Shadow */}
                  <div
                    className="absolute top-0 bottom-0 left-0 w-12 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(to right, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.06) 60%, transparent 100%)"
                    }}
                  />

                  {/* KuttyStory Atelier Logo Badge */}
                  <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-[#EBE3D9] flex items-center gap-1.5 select-none">
                    <img src="/logo.jpg" alt="KuttyStory" className="w-4 h-4 rounded-full object-cover" />
                    <span className="font-editorial-serif font-bold text-xs text-[#2D222A] tracking-tight">KuttyStory</span>
                  </div>

                </div>

                {/* 2. REALISTIC 3D PEELING & BENDING PAGE FLIP SHEET */}
                {isFlipping && (
                  <div
                    className="absolute top-0 bottom-0 right-0 w-full z-30"
                    style={{
                      transformOrigin: "left center",
                      transformStyle: "preserve-3d",
                      animation:
                        flipDirection === "next"
                          ? `realPageCurlForward ${flipDurationMs}ms cubic-bezier(0.35, 0.05, 0.15, 1.0) forwards`
                          : `realPageCurlBackward ${flipDurationMs}ms cubic-bezier(0.35, 0.05, 0.15, 1.0) forwards`
                    }}
                  >
                    {/* Front Face: The turning page image with specular curl highlight & shadow */}
                    <div
                      className="absolute inset-0 w-full h-full overflow-hidden rounded-r-xl bg-[#FAF7EE]"
                      style={{
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden"
                      }}
                    >
                      <img
                        src={flipDirection === "next" ? fromAsset?.image_url : toAsset?.image_url}
                        alt="Flipping Front"
                        className="w-full h-full object-cover select-none"
                        draggable={false}
                      />

                      {/* Moving Specular Highlight Streak across the paper curve */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `
                            linear-gradient(to right,
                              rgba(0, 0, 0, 0.45) 0%,
                              rgba(0, 0, 0, 0.1) 18%,
                              rgba(255, 255, 255, 0.5) 48%,
                              rgba(255, 255, 255, 0.1) 56%,
                              rgba(0, 0, 0, 0.25) 85%,
                              transparent 100%
                            )
                          `
                        }}
                      />

                    </div>

                    {/* Back Face: Realistic paper parchment reverse side with watermark */}
                    <div
                      className="absolute inset-0 w-full h-full overflow-hidden rounded-l-xl bg-[#F5EEDB]"
                      style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        backgroundImage: `
                          radial-gradient(#E5DAC0 15%, transparent 16%),
                          radial-gradient(#E5DAC0 15%, transparent 16%)
                        `,
                        backgroundSize: "14px 14px",
                        backgroundPosition: "0 0, 7px 7px"
                      }}
                    >
                      {/* Realistic paper grain & spine fold shadow on reverse */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "linear-gradient(to left, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 25%, transparent 60%)"
                        }}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center opacity-40">
                        <span className="font-editorial-serif text-xl font-bold text-[#6D5D44] tracking-wide">
                          {storyTitle}
                        </span>
                        <span className="text-[11px] text-[#8F8165] mt-1">
                          Page #{fromAsset?.page_number || currentPageIdx + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clickable regions (Left half = Prev, Right half = Next) */}
                <div
                  onClick={handlePrev}
                  className="absolute top-0 bottom-0 left-0 w-1/3 z-20 cursor-w-resize"
                  title="Click to flip to previous page"
                />
                <div
                  onClick={handleNext}
                  className="absolute top-0 bottom-0 right-0 w-1/3 z-20 cursor-e-resize"
                  title="Click to flip to next page"
                />
              </div>

              {/* 3. FLOATING CHILD PHOTO BADGE WITH CURVING WHITE ARROW (EXACT MATCH TO REFERENCE IMAGE 2) */}
              {childPhotoUrl && (
                <div className="absolute -bottom-6 -left-6 sm:-bottom-7 sm:-left-7 z-40 flex items-center select-none pointer-events-auto">
                  {/* Circular Child Photo Avatar (Scaled to harmonious size) */}
                  <div
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white overflow-hidden shadow-xl bg-[#FAF7F2] transform hover:scale-105 transition-transform duration-300"
                    style={{
                      boxShadow: "0 10px 22px -3px rgba(45, 34, 42, 0.4), 0 4px 8px -2px rgba(0, 0, 0, 0.15)"
                    }}
                  >
                    <img
                      src={childPhotoUrl}
                      alt={childName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
                  </div>

                  {/* Playful Curving Hand-Drawn White Arrow */}
                  <svg
                    className="absolute pointer-events-none"
                    style={{
                      bottom: "26px",
                      left: "48px",
                      width: "115px",
                      height: "125px",
                      zIndex: 35
                    }}
                    viewBox="0 0 115 125"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <filter id="white-arrow-shadow-compact" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="1" dy="2.5" stdDeviation="3" floodColor="rgba(0, 0, 0, 0.35)" />
                      </filter>
                      <marker
                        id="arrowhead-white-compact"
                        markerWidth="10"
                        markerHeight="10"
                        refX="6"
                        refY="4"
                        orient="auto"
                      >
                        <path d="M1,1 L1,7 L8,4 z" fill="#ffffff" />
                      </marker>
                    </defs>

                    {/* Smooth Hand-Drawn Arc from Child Avatar into Storybook Character */}
                    <path
                      d="M 16 112 C 28 65, 68 38, 90 16"
                      stroke="#ffffff"
                      strokeWidth="4.2"
                      strokeLinecap="round"
                      fill="none"
                      filter="url(#white-arrow-shadow-compact)"
                      markerEnd="url(#arrowhead-white-compact)"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Left & Right Floating Navigation Arrow Buttons */}
            <button
              onClick={handlePrev}
              disabled={isFlipping}
              className="absolute -left-3 sm:-left-6 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/95 hover:bg-white text-[#2D222A] shadow-lg border border-[#DDD5C0] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={isFlipping}
              className="absolute -right-3 sm:-right-6 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-white/95 hover:bg-white text-[#2D222A] shadow-lg border border-[#DDD5C0] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 active:scale-95 transition cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* 3. PAGINATION DOTS (MATCHING REFERENCE IMAGE 2) */}
        <div className="relative z-20 flex items-center justify-center gap-2 pt-6 sm:pt-8 pb-1">
          {assets.map((_, idx) => {
            const isActive = currentPageIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => triggerFlip(idx)}
                disabled={isFlipping}
                className={`transition-all duration-300 rounded-full cursor-pointer ${isActive
                    ? "w-2.5 h-2.5 bg-[#0275FF] shadow-xs scale-125 ring-2 ring-[#0275FF]/30"
                    : "w-2 h-2 bg-[#B8AF98] hover:bg-[#8F8367] opacity-60 hover:opacity-100"
                  }`}
                title={`Go to Page ${idx + 1}`}
                aria-label={`Page ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* 3.5. STORY LANGUAGE SELECTOR (Tamil, Malayalam, Hindi, Marathi, Telugu, Kannada, English) */}
      {onLanguageChange && (
        <div className="editorial-card p-3.5 bg-gradient-to-r from-[#FAF7F2] via-white to-[#FAF7F2] border border-[#EBE3D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D222A]">
            <Languages className="w-4 h-4 text-[#C98A84]" />
            <span>Story Language:</span>
            {isTranslating && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#C98A84] animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Translating story...</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  disabled={isTranslating}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                    isSelected
                      ? "bg-[#C98A84] text-white border-[#C98A84] shadow-xs"
                      : "bg-white hover:bg-[#FAEEED] text-[#5B4F3A] border-[#EBE3D9]"
                  }`}
                >
                  <span>{lang.native}</span>
                  {lang.id !== "english" && (
                    <span className={`text-[10px] ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                      ({lang.label})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. STORY NARRATIVE SECTION (Clean, Authentic Published Story Layout) */}
      {currentAsset && (
        <div className="editorial-card p-5 sm:p-6 bg-white shadow-xs">
          {/* Narrative Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#C98A84] font-bold">
                Story Narrative • Page #{currentAsset.page_number}
              </span>
              {selectedLanguage !== "english" && (
                <span className="px-2 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] text-[10px] font-bold border border-[#C98A84]/20 flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" />
                  <span>{SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage)?.native || selectedLanguage}</span>
                </span>
              )}
            </div>
            {isTranslating ? (
              <div className="flex items-center gap-2 py-3 text-sm text-[#C98A84] font-medium animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Translating narrative into {SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage)?.native || selectedLanguage}...</span>
              </div>
            ) : (
              <p className="font-editorial-serif text-base sm:text-lg text-[#2D222A] leading-relaxed italic">
                "{getAssetNarrative(currentAsset)}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* 5. JUMP TO PAGE THUMBNAILS */}
      <div className="editorial-card p-3.5 sm:p-4 bg-white space-y-2">
        <div className="text-[11px] font-semibold text-[#695B64] uppercase tracking-wider">
          Jump to Page
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {assets.map((ast, idx) => (
            <button
              key={ast.id}
              onClick={() => triggerFlip(idx)}
              disabled={isFlipping}
              className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition cursor-pointer ${currentPageIdx === idx
                  ? "border-[#0275FF] shadow-sm scale-105 ring-2 ring-[#0275FF]/20"
                  : "border-[#EBE3D9] opacity-70 hover:opacity-100"
                }`}
            >
              <img src={ast.image_url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 py-0.2 rounded font-mono">
                #{ast.page_number}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CSS KEYFRAMES FOR REALISTIC 3D PAGE CURL & TURN */}
      <style>{`
        @keyframes realPageCurlForward {
          0% {
            transform: rotateY(0deg) skewY(0deg) scaleX(1);
            filter: drop-shadow(-1px 0 3px rgba(0, 0, 0, 0.15));
          }
          20% {
            transform: rotateY(-30deg) skewY(-1.2deg) scaleX(0.985);
            filter: drop-shadow(-5px 0 10px rgba(0, 0, 0, 0.22));
          }
          45% {
            transform: rotateY(-80deg) skewY(-2.2deg) scaleX(0.96);
            filter: drop-shadow(-14px 0 24px rgba(0, 0, 0, 0.38));
          }
          55% {
            transform: rotateY(-100deg) skewY(-1.8deg) scaleX(0.96);
            filter: drop-shadow(-12px 0 20px rgba(0, 0, 0, 0.35));
          }
          80% {
            transform: rotateY(-155deg) skewY(1.2deg) scaleX(0.985);
            filter: drop-shadow(-6px 0 12px rgba(0, 0, 0, 0.24));
          }
          100% {
            transform: rotateY(-180deg) skewY(0deg) scaleX(1);
            filter: drop-shadow(1px 0 3px rgba(0, 0, 0, 0.15));
          }
        }

        @keyframes realPageCurlBackward {
          0% {
            transform: rotateY(-180deg) skewY(0deg) scaleX(1);
            filter: drop-shadow(1px 0 3px rgba(0, 0, 0, 0.15));
          }
          20% {
            transform: rotateY(-155deg) skewY(1.2deg) scaleX(0.985);
            filter: drop-shadow(-6px 0 12px rgba(0, 0, 0, 0.24));
          }
          45% {
            transform: rotateY(-100deg) skewY(-1.8deg) scaleX(0.96);
            filter: drop-shadow(-12px 0 20px rgba(0, 0, 0, 0.35));
          }
          55% {
            transform: rotateY(-80deg) skewY(-2.2deg) scaleX(0.96);
            filter: drop-shadow(-14px 0 24px rgba(0, 0, 0, 0.38));
          }
          80% {
            transform: rotateY(-30deg) skewY(-1.2deg) scaleX(0.985);
            filter: drop-shadow(-5px 0 10px rgba(0, 0, 0, 0.22));
          }
          100% {
            transform: rotateY(0deg) skewY(0deg) scaleX(1);
            filter: drop-shadow(-1px 0 3px rgba(0, 0, 0, 0.15));
          }
        }
      `}</style>
    </div>
  );
}

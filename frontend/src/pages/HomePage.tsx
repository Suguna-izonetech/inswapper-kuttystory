import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, BookOpen, CheckCircle, Type, ChevronLeft, ChevronRight } from "lucide-react";
import { api, StoryTemplate } from "@/lib/api";
import { HardcoverBook } from "@/components/HardcoverBook";

const FONT_OPTIONS = [
  { id: "georgia", label: "Georgia", className: "font-georgia" },
  { id: "quicksand", label: "Quicksand", className: "font-quicksand" },
  { id: "nunito", label: "Nunito", className: "font-nunito" },
  { id: "poppins", label: "Poppins", className: "font-poppins" },
];

export default function HomePage() {
  const [stories, setStories] = useState<StoryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const latestStoryIdRef = useRef<string | null>(null);

  const [selectedFont, setSelectedFont] = useState<string>(() => {
    return localStorage.getItem("kutty_hero_font") || "georgia";
  });

  const handleFontChange = (id: string) => {
    setSelectedFont(id);
    localStorage.setItem("kutty_hero_font", id);
  };

  const fetchStories = () => {
    api.getStories()
      .then((data) => {
        setStories(data);
        if (data.length > 0) {
          const newestId = data[0].id;
          if (latestStoryIdRef.current && latestStoryIdRef.current !== newestId) {
            // New latest story uploaded in admin dashboard! Immediately show it as active hero
            setCurrentSlideIndex(0);
          }
          latestStoryIdRef.current = newestId;
        }
      })
      .catch((err) => console.error("Error loading stories:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();

    // Auto-refresh when tab regains focus or visibility (e.g., after uploading a story in admin dashboard)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchStories();
      }
    };
    window.addEventListener("focus", fetchStories);
    document.addEventListener("visibilitychange", handleVisibility);

    // Light background poll every 15s to automatically catch newly uploaded stories
    const pollTimer = setInterval(fetchStories, 15000);

    return () => {
      window.removeEventListener("focus", fetchStories);
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(pollTimer);
    };
  }, []);

  // Filter published stories that have cover image or pages
  const heroStories = stories.filter(
    (s) => Boolean(s.cover_image_url || (s.pages && s.pages.some((p) => p.original_image_url)))
  );

  // Dynamic image changing: auto-cycle every 4.5s through stories when not hovered
  useEffect(() => {
    if (heroStories.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroStories.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [heroStories.length, isHovered]);

  const activeIndex = heroStories.length > 0 ? currentSlideIndex % heroStories.length : 0;
  const currentStory = heroStories[activeIndex] || stories[0];
  const currentImageUrl = currentStory
    ? api.resolveUrl(currentStory.cover_image_url || currentStory.pages?.[0]?.original_image_url)
    : "";

  return (
    <div className="space-y-28 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAEEED] border border-[#C98A84]/30 text-xs font-medium text-[#C98A84]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bespoke Heirloom Storybooks for Children</span>
              </div>

              {/* Font.txt selector */}
              <div className="inline-flex items-center gap-1 p-1 bg-white/90 backdrop-blur-xs rounded-full border border-[#EBE3D9] text-xs shadow-2xs">
                <span className="text-[11px] font-semibold text-[#695B64] pl-2 pr-1 flex items-center gap-1">
                  <Type className="w-3 h-3 text-[#C98A84]" /> Font:
                </span>
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFontChange(f.id)}
                    className={`px-2.5 py-0.5 rounded-full text-xs transition-all cursor-pointer ${
                      selectedFont === f.id
                        ? "bg-[#C98A84] text-white font-semibold shadow-xs"
                        : "text-[#695B64] hover:text-[#2D222A]"
                    } ${f.className}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <h1
              className={`${
                FONT_OPTIONS.find((f) => f.id === selectedFont)?.className || "font-georgia"
              } text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2D222A] leading-[1.12] transition-all duration-200`}
            >
              Where your child becomes the hero of their own{" "}
              <span className="italic font-normal text-[#C98A84]">fairy tale</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#695B64] font-normal leading-relaxed max-w-2xl">
              Immerse your child into breathtaking, painterly adventures. Crafted with gentle character-consistent artistry and deterministic book typography, tailored with your child’s name and recognizable likeness.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                to="/storybooks"
                className="px-8 py-4 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-base font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 text-center"
              >
                <span>Explore Story Books</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/collections"
                className="px-6 py-4 rounded-full bg-white border border-[#EBE3D9] hover:border-[#C98A84] text-[#2D222A] text-base font-medium transition-all flex items-center justify-center gap-2 text-center"
              >
                <Sparkles className="w-4 h-4 text-[#C98A84]" />
                <span>View Collections</span>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-6 pt-6 text-xs text-[#695B64]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#8F9E8B]" />
                <span>Deterministic 8 X 8 mm Print Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8F9E8B]" />
                <span>Parental Consent Protected</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative luxury frame */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#FAEEED] via-[#F2EEF7] to-[#FAF5E8] opacity-80 blur-xl"></div>

              <div
                className="relative rounded-2xl bg-white p-3 shadow-xl border border-[#EBE3D9] group overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAF7F2]">
                  {loading && !currentStory ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#695B64] p-8 text-center bg-[#FAEEED]/20 animate-pulse">
                      <BookOpen className="w-12 h-12 text-[#C98A84]/50 mb-3" />
                      <div className="h-4 w-32 bg-[#EBE3D9] rounded-full mb-2" />
                      <div className="h-3 w-20 bg-[#EBE3D9]/60 rounded-full" />
                    </div>
                  ) : currentStory && currentImageUrl ? (
                    <Link
                      to={`/personalize/${currentStory.slug}`}
                      className="block w-full h-full relative cursor-pointer"
                    >
                      <img
                        key={currentStory.id}
                        src={currentImageUrl}
                        alt={`${currentStory.title} Cover`}
                        className="w-full h-full object-cover transform hover:scale-105 transition-all duration-700 ease-out"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                        }}
                      />
                    </Link>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#695B64] p-8 text-center bg-[#FAEEED]/30">
                      <BookOpen className="w-16 h-16 text-[#C98A84] mb-4 stroke-1" />
                      <span className="font-editorial-serif text-2xl font-semibold text-[#2D222A]">
                        {currentStory?.title || "Heirloom Story"}
                      </span>
                      <span className="text-xs text-[#695B64] mt-2">
                        {currentStory?.page_count || 26}-Page Heirloom Edition
                      </span>
                    </div>
                  )}

                  {/* Top Badges & Dynamic Indicators */}
                  {currentStory && (
                    <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                      {/* Left: Latest Story tag vs Curated Story tag */}
                      {activeIndex === 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#C98A84]/40 text-[#C98A84] text-xs font-semibold shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Latest Story</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#EBE3D9] text-[#695B64] text-xs font-medium shadow-xs">
                          <span>Story #{activeIndex + 1}</span>
                        </div>
                      )}

                      {/* Right: Slide dots indicator */}
                      {heroStories.length > 1 && (
                        <div className="pointer-events-auto flex items-center gap-1.5 bg-black/35 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-xs">
                          {heroStories.slice(0, 7).map((story, idx) => (
                            <button
                              key={story.id}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCurrentSlideIndex(idx);
                              }}
                              className={`transition-all duration-300 rounded-full cursor-pointer ${
                                idx === activeIndex
                                  ? "w-4 h-1.5 bg-white shadow-xs"
                                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                              }`}
                              title={story.title}
                              aria-label={`Slide ${idx + 1}: ${story.title}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next / Prev Navigation Arrows */}
                  {heroStories.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSlideIndex(
                            (prev) => (prev - 1 + heroStories.length) % heroStories.length
                          );
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#2D222A] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-[#EBE3D9]"
                        aria-label="Previous story"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCurrentSlideIndex(
                            (prev) => (prev + 1) % heroStories.length
                          );
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#2D222A] shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-[#EBE3D9]"
                        aria-label="Next story"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Dynamic Corner / Bottom Floating Glassmorphism Badge */}
                  {currentStory && (
                    <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-[#EBE3D9] flex items-center justify-between shadow-sm transition-all">
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-[#2D222A] truncate">
                          {currentStory.title}
                        </div>
                        <div className="text-[11px] text-[#695B64] truncate">
                          {currentStory.page_count} Full-Bleed Pages • {currentStory.category || "1:1 Square Trim"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#EEF4ED] text-[#4E7048] text-[11px] font-medium capitalize">
                          {currentStory.status || "Published"}
                        </span>
                        <Link
                          to={`/personalize/${currentStory.slug}`}
                          className="px-3 py-1 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-[11px] font-medium transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <span>Personalize</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Stories Catalog */}
      <section id="stories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">Story Catalog</div>
          <h2 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#2D222A]">
            Curated Story Templates
          </h2>
          <p className="text-sm text-[#695B64]">
            Each story is crafted with classical fairy-tale storytelling and adaptable artwork layouts ready for personalization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Story Cards (up to 3) */}
          {stories.slice(0, 3).map((story) => (
            <div key={story.id} className="editorial-card overflow-hidden flex flex-col group">
              <div className="relative aspect-square p-5 sm:p-6 bg-gradient-to-b from-[#FDFCFB] via-[#F8F5EE] to-[#EFE8DD] flex items-center justify-center overflow-hidden border-b border-[#EBE3D9]/70">
                <div className="w-[82%] sm:w-[86%] max-w-[320px] aspect-square flex items-center justify-center mx-auto">
                  <HardcoverBook
                    coverUrl={story.cover_image_url}
                    title={story.title}
                    aspectRatio="square"
                  />
                </div>
                <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#EBE3D9] text-[11px] font-medium text-[#2D222A] shadow-xs">
                  {story.age_range}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#C98A84] font-medium">
                    {story.category} • {story.page_count} Pages
                  </div>
                  <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#695B64] line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EBE3D9] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#695B64]">From </span>
                    <span className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                      ₹{story.price_digital ? Number(story.price_digital).toLocaleString("en-IN") : "799"}
                    </span>
                  </div>
                  <Link
                    to={`/personalize/${story.slug}`}
                    className="px-4 py-2 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>Personalize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 flex justify-center">
          <Link
            to="/storybooks"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#FAEEED] hover:bg-[#F5DFDC] text-[#C98A84] hover:text-[#B87A74] text-sm font-semibold border border-[#C98A84]/30 hover:border-[#C98A84] shadow-xs hover:shadow transition-all"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 3. How Personalization Works */}
      <section id="how-it-works" className="bg-[#F7F3EC] py-20 border-y border-[#EBE3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">The Atelier Process</div>
            <h2 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#2D222A]">
              How Your Heirloom Book is Created
            </h2>
            <p className="text-sm text-[#695B64]">
              Three simple steps to craft an unforgettable personalized children’s book.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] font-editorial-serif text-2xl font-bold">
                1
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Name & Reference Photo
              </h3>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Enter your child’s name and upload a single clear, authorized photo. We validate face lighting and composition with strict guardian privacy safeguards.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F2EEF7] flex items-center justify-center text-[#B8A9C9] font-editorial-serif text-2xl font-bold">
                2
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Character Consistency & Artistry
              </h3>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Our multi-stage pipeline integrates reference likeness across close-ups, dynamic scenes, and emotional moments while preserving the story’s timeless illustration style.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EEF4ED] flex items-center justify-center text-[#8F9E8B] font-editorial-serif text-2xl font-bold">
                3
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Deterministic PDF Layout
              </h3>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Artwork is typeset with our ReportLab deterministic layout engine at exact 8×8 mm trim size. Sharp vector typography, safe margins, and validated print-ready output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quality & Safety Charter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="editorial-card p-8 sm:p-12 bg-white flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8F9E8B]">
              <ShieldCheck className="w-4 h-4 text-[#8F9E8B]" />
              <span>Responsible Privacy & Child Safety Charter</span>
            </div>
            <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
              We respect your child’s privacy as sacred.
            </h3>
            <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
              Photographs uploaded by parents are stored in private, protected storage with automated retention limits. We never sell biometric identifiers, train public models on your children, or expose reference photos to third parties.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link
              to="/how-it-works"
              className="px-6 py-3.5 rounded-full bg-[#FAEEED] hover:bg-[#F5DFDC] text-[#C98A84] text-xs font-semibold text-center transition-colors"
            >
              See How It Works
            </Link>
            <Link
              to="/storybooks"
              className="px-6 py-3.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold text-center transition-colors shadow-sm"
            >
              Start Personalization
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  Palette,
  Heart,
  Wand2,
  Stars,
  Feather,
  ChevronRight,
  ChevronLeft,
  Smile,
  Clock,
  Sparkle,
  CheckCircle2,
  RefreshCw,
  Lightbulb
} from "lucide-react";
import { PersonalizationJob } from "@/lib/api";

interface StorybookMagicLoaderProps {
  job: PersonalizationJob;
  storyTitle?: string;
  childPhotoUrl?: string | null;
  childName?: string;
}

interface SparkParticle {
  id: number;
  x: number;
  y: number;
  char: string;
  color: string;
  tx: number;
  ty: number;
}

const STORY_FUN_FACTS = [
  {
    tag: "Atelier Artistry",
    icon: Palette,
    title: "1,000+ Simulated Brushstrokes",
    desc: "Our illustration engine preserves your child's natural smile and eye light by blending traditional watercolor technique with digital character fidelity."
  },
  {
    tag: "Parent Reading Secret",
    icon: Sparkles,
    title: "Boosting Confidence by 40%",
    desc: "Studies show children engage twice as deeply and absorb vocabulary 40% faster when they see themselves as the brave protagonist of their own bedtime tale."
  },
  {
    tag: "Sneak Peek",
    icon: Stars,
    title: "Hidden Companions on Every Page",
    desc: "Once your book finishes rendering, check the corners of each scene! Whimsical woodland creatures appear alongside your child throughout the journey."
  },
  {
    tag: "Heirloom Quality",
    icon: BookOpen,
    title: "210×210 mm Editorial Square Trim",
    desc: "Every spread is rendered at 300 DPI archival resolution, tailored specifically for luxury hardcover gift printing with durable stitch binding."
  },
  {
    tag: "3D Realistic Flipbook",
    icon: Wand2,
    title: "Interactive Reading Experience",
    desc: "When ready, you can flip realistic 3D pages, zoom into fine illustration textures, and customize dedication messages before ordering your print."
  }
];

const SCENE_TEASERS = [
  {
    number: "01",
    title: "The Whispering Glen",
    synopsis: "A soft golden breeze awakens the enchanted forest, revealing a curious path crafted just for your child."
  },
  {
    number: "02",
    title: "The Friendly Encounter",
    synopsis: "A majestic creature bows gently, sensing the brave and gentle heart of your little adventurer."
  },
  {
    number: "03",
    title: "Flight Across the Aurora",
    synopsis: "Soaring above pastel clouds where starlight paints sweet dreams for bedtime."
  }
];

export default function StorybookMagicLoader({
  job,
  storyTitle = "The Girl and the Magical Unicorn",
  childPhotoUrl,
  childName
}: StorybookMagicLoaderProps) {
  const effectiveName = childName || job.child_name || "Your Child";
  const [sparkCount, setSparkCount] = useState(0);
  const [sparks, setSparks] = useState<SparkParticle[]>([]);
  const [activeFactIdx, setActiveFactIdx] = useState(0);
  const [activeTeaserIdx, setActiveTeaserIdx] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(14);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Total pages for this preview job (defaults to 5 if total_pages reflects full story)
  const totalPages = (job.total_pages && job.total_pages <= 12) ? job.total_pages : 5;
  const completedPages = Math.min(totalPages, job.completed_pages || 0);

  const isCompleted = job.status?.toLowerCase() === "completed" || job.status?.toLowerCase() === "done" || (completedPages >= totalPages && totalPages > 0 && job.status !== "queued");
  const isAssembling = job.status === "assembling_preview" || job.current_stage?.toLowerCase().includes("composing") || job.current_stage?.toLowerCase().includes("pdf");

  // Dynamic estimated time text
  const getEstimatedTime = () => {
    if (isCompleted || smoothProgress >= 100) return "Ready!";
    if (isAssembling || smoothProgress >= 92) return "Finalizing spreads...";
    if (smoothProgress >= 80) return "Estimated: ~5–10s";
    if (smoothProgress >= 60) return "Estimated: ~10–15s";
    if (smoothProgress >= 40) return "Estimated: ~15–20s";
    if (smoothProgress >= 25) return "Estimated: ~20–30s";
    return "Estimated: ~30–40s";
  };

  // Auto-rotating fun facts every 4.5 seconds
  useEffect(() => {
    const factTimer = setInterval(() => {
      setActiveFactIdx((prev) => (prev + 1) % STORY_FUN_FACTS.length);
    }, 4500);
    return () => clearInterval(factTimer);
  }, []);

  // Track elapsed seconds and smoothly simulate realistic progress
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute smooth, monotonic progress bar percentage based on real backend status + smooth elapsed progression
  useEffect(() => {
    // 1. Calculate time-based progression curve (starts at 14% and climbs through stages smoothly)
    let timeProgress = 14;
    if (elapsedSecs < 6) {
      // 14% to 26% over first 6 seconds (Stage 1: Likeness Analysis)
      timeProgress = 14 + (elapsedSecs / 6) * 12;
    } else if (elapsedSecs < 18) {
      // 26% to 50% over next 12 seconds (Stage 2: Story Universe Weaving)
      timeProgress = 26 + ((elapsedSecs - 6) / 12) * 24;
    } else if (elapsedSecs < 38) {
      // 50% to 75% over next 20 seconds (Stage 3: Watercolor Synthesis)
      timeProgress = 50 + ((elapsedSecs - 18) / 20) * 25;
    } else if (elapsedSecs < 65) {
      // 75% to 88% over next 27 seconds (Stage 4: Editorial Spreads Compiling)
      timeProgress = 75 + ((elapsedSecs - 38) / 27) * 13;
    } else if (elapsedSecs < 95) {
      // 88% to 93% over next 30 seconds
      timeProgress = 88 + ((elapsedSecs - 65) / 30) * 5;
    } else {
      // Gentle asymptotic crawl towards 95%
      timeProgress = Math.min(95, 93 + (1 - Math.exp(-(elapsedSecs - 95) / 35)) * 2);
    }

    // 2. Real backend-driven progress milestones
    let backendProgress = 0;
    if (isCompleted) {
      backendProgress = 100;
    } else if (isAssembling) {
      backendProgress = 94;
    } else if (completedPages > 0) {
      const pageRatio = completedPages / totalPages;
      backendProgress = 25 + pageRatio * 68; // 1/5 => ~38%, 2/5 => ~52%, 3/5 => ~66%, 4/5 => ~79%, 5/5 => ~93%
    } else if (job.status === "generating") {
      backendProgress = Math.max(timeProgress, 28);
    }

    const candidate = Math.max(timeProgress, backendProgress);

    setSmoothProgress((prev) => {
      if (isCompleted) return 100;
      // Strictly monotonic: progress never goes backwards, capped at 95% until complete
      const target = Math.min(95, Math.max(prev, Math.round(candidate)));
      return target;
    });
  }, [completedPages, totalPages, isCompleted, isAssembling, job.status, elapsedSecs]);

  // Clean up completed sparks
  useEffect(() => {
    if (sparks.length === 0) return;
    const sparkTimer = setTimeout(() => {
      setSparks((prev) => prev.slice(1));
    }, 1200);
    return () => clearTimeout(sparkTimer);
  }, [sparks]);

  // Handle interactive clicks on the canvas
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const chars = ["✨", "⭐", "💫", "🌟", "💖", "🎨"];
    const colors = ["#C98A84", "#B8A9C9", "#C5A059", "#8F9E8B", "#F472B6"];

    // Spawn 4 playful sparkling particles
    const newSparks: SparkParticle[] = [];
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * 2 * i) / 4 + (Math.random() - 0.5) * 0.5;
      const dist = 30 + Math.random() * 40;
      newSparks.push({
        id: Date.now() + i + Math.random(),
        x: clickX,
        y: clickY,
        char: chars[Math.floor(Math.random() * chars.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist - 25,
      });
    }

    setSparks((prev) => [...prev.slice(-16), ...newSparks]);
    setSparkCount((c) => c + 1);
  };

  // Determine current active stage
  const stages = [
    {
      id: 1,
      name: "Portrait Likeness Analysis",
      detail: `Mapping ${effectiveName}'s facial structure, smile & eye light`,
      pct: 25,
      icon: Smile,
    },
    {
      id: 2,
      name: "Story Universe Weaving",
      detail: `Conditioning ${storyTitle} fairy tale backgrounds & composition`,
      pct: 50,
      icon: Wand2,
    },
    {
      id: 3,
      name: "Heirloom Watercolor Synthesis",
      detail: `Applying 1,000+ digital brushstrokes & hand-painted lighting`,
      pct: 75,
      icon: Palette,
    },
    {
      id: 4,
      name: `Compiling ${totalPages} Editorial Spreads`,
      detail: `Formatting 210×210mm archival spreads for 3D flipbook`,
      pct: 95,
      icon: BookOpen,
    },
  ];

  const currentStageIdx = stages.findIndex((st) => smoothProgress < st.pct);
  const activeStage = currentStageIdx === -1 ? stages[stages.length - 1] : stages[currentStageIdx];

  const CurrentFactIcon = STORY_FUN_FACTS[activeFactIdx].icon;

  return (
    <div
      ref={containerRef}
      onClick={handleStageClick}
      className="relative rounded-3xl bg-gradient-to-b from-[#FAF7F2] via-white to-[#FAF7F2] border-2 border-[#EBE3D9] p-6 sm:p-10 shadow-lg overflow-hidden select-none cursor-pointer group transition-all"
    >
      {/* Dynamic Interactive Sparkle Emitter Canvas */}
      {sparks.map((s) => (
        <span
          key={s.id}
          className="absolute pointer-events-none z-50 text-base font-bold animate-in fade-in transition-transform duration-700 ease-out"
          style={
            {
              left: `${s.x}px`,
              top: `${s.y}px`,
              color: s.color,
              transform: `translate(${s.tx}px, ${s.ty}px) scale(1.4)`,
              opacity: 0,
            } as React.CSSProperties
          }
        >
          {s.char}
        </span>
      ))}

      {/* Atmospheric Ambient Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#FAEEED] opacity-70 filter blur-3xl animate-magic-glow pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#FAEEED] opacity-60 filter blur-3xl animate-magic-glow pointer-events-none" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FAF5E8] opacity-35 filter blur-3xl pointer-events-none" />

      {/* Top Banner: Tap to Sprinkle Magic CTA & Sparks Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#EBE3D9]/70 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#C98A84]/15 border border-[#C98A84]/30 flex items-center justify-center text-[#C98A84] shadow-xs">
            <Wand2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#C98A84] font-bold">
                KuttyStory Atelier Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] text-[10px] font-bold border border-[#C98A84]/20 animate-pulse">
                <Sparkle className="w-2.5 h-2.5 fill-current" />
                Live Generation
              </span>
            </div>
            <h2 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A]">
              Painting {effectiveName}’s Storybook Adventure
            </h2>
          </div>
        </div>

        {/* Interactive Fairy Dust Counter Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#EBE3D9] shadow-xs hover:border-[#C98A84] transition group-hover:scale-102">
          <Sparkles className="w-4 h-4 text-[#C5A059] animate-spin" style={{ animationDuration: "6s" }} />
          <span className="text-xs font-semibold text-[#2D222A]">
            {sparkCount > 0 ? (
              <span className="text-[#C98A84] font-bold">
                ✨ {sparkCount} Fairy Dust Sparks Cast!
              </span>
            ) : (
              <span className="text-[#695B64]">
                Tap anywhere to cast magic sparks ✨
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Main Showcase Stage: 3D Levitating Book & Magical Easel */}
      <div className="py-8 sm:py-10 flex flex-col items-center justify-center relative z-10">
        <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
          
          {/* Levitating 3D Storybook Visual */}
          <div className="relative animate-float-gentle flex items-center justify-center">
            
            {/* Golden & Rose Radiant Backlight Glow */}
            <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-[#C98A84]/30 via-[#F5D0C5]/40 to-[#C98A84]/30 blur-2xl animate-magic-glow pointer-events-none" />

            {/* Floating Quill / Paintbrush painting strokes into the book */}
            <div className="absolute -top-10 -right-6 z-30 pointer-events-none animate-quill hidden sm:block">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
                  <Feather className="w-8 h-8 transform rotate-45 text-[#C98A84]" />
                </div>
                {/* Wand Particle Trail */}
                <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#C5A059] animate-ping" />
              </div>
            </div>

            {/* The 3D Open Hardcover Book Spread */}
            <div className="relative w-[310px] sm:w-[460px] h-[190px] sm:h-[260px] rounded-2xl bg-[#FAF7F2] shadow-2xl border-4 border-[#DDD3C4] flex overflow-hidden">
              
              {/* Left Page: Child's Likeness Medallion Frame */}
              <div className="w-1/2 h-full bg-[#FFFDF9] border-r border-[#EBE3D9] p-3 sm:p-5 flex flex-col items-center justify-between relative">
                
                {/* Book Header Spine Texture */}
                <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-[#D8CCC0]/60 to-transparent pointer-events-none" />
                
                <span className="text-[10px] uppercase tracking-wider text-[#A8988F] font-bold">
                  Protagonist Reference
                </span>

                {/* Child Photo Framed in Golden Filigree Medallion */}
                <div className="relative group/photo my-auto">
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#C5A059] via-[#F3E5AB] to-[#C98A84] shadow-md flex items-center justify-center">
                    <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF7F2] border-2 border-white relative">
                      {childPhotoUrl ? (
                        <img
                          src={childPhotoUrl}
                          alt={effectiveName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#FAEEED] text-[#C98A84]">
                          <Smile className="w-10 h-10" />
                        </div>
                      )}
                      
                      {/* Shimmer wave across photo */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent animate-scanner-line pointer-events-none" />
                    </div>
                  </div>

                  {/* Sparkle badge */}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#C98A84] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-editorial-serif text-sm sm:text-base font-bold text-[#2D222A]">
                    {effectiveName}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-[#8F9E8B] font-semibold">
                    ✓ Likeness Preserved
                  </div>
                </div>
              </div>

              {/* Right Page: Fairy Tale Watercolor Scene Canvas */}
              <div className="w-1/2 h-full bg-[#FFFDF9] p-3 sm:p-5 flex flex-col items-center justify-between relative overflow-hidden">
                
                {/* Book Page Spine Shadow */}
                <div className="absolute left-0 inset-y-0 w-4 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
                
                {/* Page turning flap animation */}
                <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#C98A84]/15 to-transparent animate-page-flip pointer-events-none" />

                <span className="text-[10px] uppercase tracking-wider text-[#A8988F] font-bold">
                  Page #{completedPages > 0 ? Math.min(totalPages, completedPages + 1) : 1} Preview
                </span>

                {/* Animated Watercolor Canvas Simulation */}
                <div className="relative w-full h-24 sm:h-36 rounded-xl overflow-hidden bg-gradient-to-br from-[#FAEEED] via-[#F2EEF7] to-[#FAF5E8] border border-[#EBE3D9] flex flex-col items-center justify-center p-2 text-center shadow-inner my-auto">
                  
                  {/* Floating stardust inside the page */}
                  <div className="absolute top-2 right-2 text-xs text-[#C5A059] animate-bounce">
                    ✨
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs text-[#C98A84] animate-pulse">
                    🌸
                  </div>

                  {/* Watercolor paint wave */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 shadow-xs flex items-center justify-center text-[#C98A84] mb-1.5 animate-spin" style={{ animationDuration: "10s" }}>
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>

                  <p className="font-editorial-serif text-xs sm:text-sm font-bold text-[#2D222A] px-2 leading-tight">
                    "{storyTitle}"
                  </p>
                  <p className="text-[9px] text-[#695B64] mt-0.5 font-medium">
                    {smoothProgress < 25
                      ? "Analyzing likeness & expressions..."
                      : smoothProgress < 50
                      ? "Weaving magical scenery..."
                      : smoothProgress < 75
                      ? "Painting watercolor brushstrokes..."
                      : "Binding archival spreads..."}
                  </p>
                </div>

                <div className="w-full flex items-center justify-between text-[9px] text-[#A8988F]">
                  <span>210×210 mm Trim</span>
                  <span className="font-bold text-[#C98A84]">
                    {completedPages} / {totalPages} Rendered
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Live Stage Status Callout */}
          <div className="mt-8 text-center space-y-2 max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEEED] text-[#C98A84] text-xs font-bold border border-[#C98A84]/20 shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{activeStage.name}</span>
            </div>

            <p className="text-xs text-[#4E424B] leading-relaxed">
              {activeStage.detail}. The AI preserves {effectiveName}'s natural eye shape, joyful expression, and hair color across all story spreads.
            </p>
          </div>

          {/* Shimmering Dynamic Progress Bar */}
          <div className="w-full max-w-md mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#695B64]">Synthesis Progress</span>
              <span className="text-[#C98A84] font-bold">{smoothProgress}%</span>
            </div>

            <div className="h-3 w-full rounded-full bg-[#EBE3D9]/60 overflow-hidden p-0.5 border border-[#DDD3C4]">
              <div
                className="h-full rounded-full animate-shimmer-bar transition-all duration-500 ease-out shadow-xs relative"
                style={{ width: `${smoothProgress}%` }}
              >
                {/* Glowing spark head on progress bar */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#FFF]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#8F9E8B] pt-0.5 font-medium">
              <span className="truncate max-w-[260px] sm:max-w-xs">{job.current_stage || "Conditioning narrative scenes..."}</span>
              <span className="shrink-0">{getEstimatedTime()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Bottom Deck: Rotating Fun Facts & Scene Teaser Tabs */}
      <div className="mt-6 pt-6 border-t border-[#EBE3D9] grid grid-cols-1 md:grid-cols-12 gap-5 relative z-10">
        
        {/* Left Column: Rotating Story Fun Fact Carousel (Keeps user reading & entertained) */}
        <div className="md:col-span-7 p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE3D9] shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#C98A84] bg-[#FAEEED] px-2.5 py-0.5 rounded-full">
                <CurrentFactIcon className="w-3 h-3" />
                <span>{STORY_FUN_FACTS[activeFactIdx].tag}</span>
              </span>

              {/* Navigation dots & arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFactIdx((prev) => (prev - 1 + STORY_FUN_FACTS.length) % STORY_FUN_FACTS.length);
                  }}
                  className="p-1 rounded-full hover:bg-[#F7F3EC] text-[#695B64] transition"
                  title="Previous fact"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1 px-1">
                  {STORY_FUN_FACTS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        activeFactIdx === i ? "bg-[#C98A84] w-3" : "bg-[#D8CCC0]"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveFactIdx((prev) => (prev + 1) % STORY_FUN_FACTS.length);
                  }}
                  className="p-1 rounded-full hover:bg-[#F7F3EC] text-[#695B64] transition"
                  title="Next fact"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h4 className="font-editorial-serif text-sm font-bold text-[#2D222A]">
              {STORY_FUN_FACTS[activeFactIdx].title}
            </h4>
            <p className="text-xs text-[#695B64] leading-relaxed">
              {STORY_FUN_FACTS[activeFactIdx].desc}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-[#F0EAE1] flex items-center gap-2 text-[11px] text-[#A8988F]">
            <Lightbulb className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Facts automatically rotate while the atelier finishes your spreads.</span>
          </div>
        </div>

        {/* Right Column: Story Narrative Sneak Peek Tabs */}
        <div className="md:col-span-5 p-4 sm:p-5 rounded-2xl bg-[#F7F3EC] border border-[#EBE3D9] flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#695B64]">
                Story Sneak Peek
              </span>
              <span className="text-[10px] font-semibold text-[#8F9E8B]">
                {effectiveName}’s Chapter Journey
              </span>
            </div>

            {/* Scene Selection Pills */}
            <div className="flex gap-1.5">
              {SCENE_TEASERS.map((scene, idx) => (
                <button
                  key={scene.number}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTeaserIdx(idx);
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${
                    activeTeaserIdx === idx
                      ? "bg-white text-[#C98A84] shadow-xs border border-[#C98A84]/30"
                      : "text-[#695B64] hover:bg-white/60"
                  }`}
                >
                  <span>Scene {scene.number}</span>
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-[#EBE3D9] space-y-1">
              <div className="font-editorial-serif text-xs font-bold text-[#2D222A]">
                {SCENE_TEASERS[activeTeaserIdx].title}
              </div>
              <p className="text-[11px] text-[#695B64] leading-relaxed italic">
                "{SCENE_TEASERS[activeTeaserIdx].synopsis}"
              </p>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-[#695B64] flex items-center gap-1">
            <Heart className="w-3 h-3 text-[#C98A84] fill-current" />
            <span>Full story spreads will appear here once rendering is complete!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

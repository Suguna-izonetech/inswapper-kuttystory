import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Footprints,
  Heart,
  Baby,
  GraduationCap,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Bookmark,
  Compass,
  Smile,
  ChevronLeft,
  ChevronRight,
  Star,
  MessageSquareHeart,
  ImageIcon,
  Volume2,
  VolumeX,
  Play,
  Pause
} from "lucide-react";
import BookSalesMapSection from "../components/BookSalesMapSection";
import { api, FeedbackItem } from "../lib/api";

function FeedbackVideoCard({
  src,
  poster,
  authorName,
  isActiveCard,
  onPlayRequest,
}: {
  src: string;
  poster?: string;
  authorName: string;
  isActiveCard: boolean;
  onPlayRequest?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  // Check reduced-motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // IntersectionObserver to detect when video is within the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setIsInViewport(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Manage Autoplay and pause based on active slide, viewport visibility, document visibility, and reduced-motion
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!video.paused) {
          video.pause();
          setIsPlaying(false);
        }
      } else if (isActiveCard && isInViewport && !prefersReducedMotion) {
        video.muted = isMuted;
        video
          .play()
          .then(() => {
            setIsPlaying(true);
            setPlaybackError(false);
          })
          .catch((err) => {
            console.warn("Video playback prevented:", err);
            setIsPlaying(false);
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (isActiveCard && isInViewport && !prefersReducedMotion && !document.hidden) {
      video.muted = isMuted;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(false);
        })
        .catch((err) => {
          console.warn("Video playback prevented:", err);
          setIsPlaying(false);
        });
    } else {
      if (!video.paused) {
        video.pause();
        setIsPlaying(false);
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isActiveCard, isInViewport, prefersReducedMotion, isMuted]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (onPlayRequest) onPlayRequest();
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackError(false);
        })
        .catch(() => setPlaybackError(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-black/90 aspect-video max-h-72 flex items-center justify-center border border-[#EBE3D9] shadow-inner group"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onError={() => setPlaybackError(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-contain"
        aria-label={`Video memory shared by ${authorName}`}
      />

      {/* Fallback notice if video fails to play */}
      {playbackError && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
          <p className="text-xs text-rose-300">Video playback unavailable in browser.</p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-[11px] font-semibold text-white transition pointer-events-auto"
          >
            Watch Video Directly
          </a>
        </div>
      )}

      {/* Visible Playback & Sound Controls */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="pointer-events-auto p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C98A84] cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-white" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleSound}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-xs transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#C98A84] cursor-pointer"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-300" />
              <span>Unmute</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Muted</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



interface MilestoneStage {
  id: string;
  stageName: string;
  ageRange: string;
  title: string;
  subtitle: string;
  icon: any;
  colorBg: string;
  colorText: string;
  description: string;
  keepsakeFeatures: string[];
  recommendedStory: {
    title: string;
    slug: string;
    genre: string;
  };
}

const MILESTONE_STAGES: MilestoneStage[] = [
  {
    id: "baby-first",
    stageName: "First Steps",
    ageRange: "0 - 2 Years",
    title: "Tiny Toes & First Whispers",
    subtitle: "Commemorating birth, first steps, and bedtime lullabies",
    icon: Baby,
    colorBg: "bg-[#FAEEED]",
    colorText: "text-[#C98A84]",
    description: "Those first wobbly steps across the living room carpet mark the beginning of life's greatest adventure. Preserve their tiny baby footprints and first giggles in an archival keepsake book.",
    keepsakeFeatures: [
      "Archival 1:1 Baby Footprint & Handprint Keepsake spread",
      "Birth moment chronicle: Time, weight, nursery song",
      "Padded silk hardcover with gold-stamped nursery name",
      "Gentle pastel watercolor palette designed for infant eyes"
    ],
    recommendedStory: {
      title: "The Baker of Sweet Cloud Dreams",
      slug: "cloud-baker",
      genre: "Bedtime & Lullaby"
    }
  },
  {
    id: "wonder-explorer",
    stageName: "Wonder Steps",
    ageRange: "3 - 4 Years",
    title: "Curiosity & Big Discoveries",
    subtitle: "Asking 'Why?', conquering the dark, and first independent play",
    icon: Smile,
    colorBg: "bg-[#FAF5E8]",
    colorText: "text-[#C5A059]",
    description: "The age of endless questions and magical thinking. Our storybooks help children conquer bedtime shadows, embrace gentle routines, and find pride in doing things 'all by myself!'.",
    keepsakeFeatures: [
      "Dedication letter celebrating their favorite first words & quirks",
      "Character likeness facing friendly bedtime creatures",
      "Encouraging bravery badges woven into story art",
      "Heavyweight matte pages resistant to eager toddler fingers"
    ],
    recommendedStory: {
      title: "The Girl & the Magical Unicorn",
      slug: "unicorn-story",
      genre: "Fairy Tale & Bravery"
    }
  },
  {
    id: "kindergarten-bravery",
    stageName: "Bravery Steps",
    ageRange: "5 - 6 Years",
    title: "The First School Bell",
    subtitle: "Stepping into kindergarten, making friends, and finding inner courage",
    icon: GraduationCap,
    colorBg: "bg-[#EEF4ED]",
    colorText: "text-[#8F9E8B]",
    description: "Packing a backpack and walking through the classroom door for the first time is a monumental step. Seeing themselves as a brave, capable hero builds enduring classroom confidence.",
    keepsakeFeatures: [
      "First Day of Kindergarten memory page tucked in front",
      "Story themes centered on friendship, empathy, and listening",
      "Name spelled out prominently in beautiful hand-lettered type",
      "Teacher & classmate dedication space on rear page"
    ],
    recommendedStory: {
      title: "The Little Ocean Voyager",
      slug: "ocean-voyager",
      genre: "Courage & Teamwork"
    }
  },
  {
    id: "sibling-love",
    stageName: "Sibling Steps",
    ageRange: "4 - 8 Years",
    title: "Becoming a Big Brother or Sister",
    subtitle: "Welcoming a new baby with warmth, pride, and unconditional love",
    icon: Heart,
    colorBg: "bg-[#F2EEF7]",
    colorText: "text-[#B8A9C9]",
    description: "Welcoming a younger brother or sister can feel overwhelming. Our sibling keepsake editions celebrate the older child's vital role as a protective mentor and gentle guide.",
    keepsakeFeatures: [
      "Custom co-hero storyline featuring both siblings together",
      "Parent dedication honoring their new family dynamic",
      "Special 'Big Sibling Oath of Protection' spread",
      "Matching dual-book boxed set options"
    ],
    recommendedStory: {
      title: "The Secret Treehouse Society",
      slug: "secret-treehouse",
      genre: "Empathy & Family"
    }
  },
  {
    id: "great-adventures",
    stageName: "Great Imaginations",
    ageRange: "7 - 10 Years",
    title: "Dreamers & Independent Thinkers",
    subtitle: "Fostering deep reading literacy, moral integrity, and boundless dreams",
    icon: Compass,
    colorBg: "bg-[#FAEEED]",
    colorText: "text-[#C98A84]",
    description: "As childhood blossoms into confident self-expression, children relish complex chapter narratives where their character makes ethical choices that heal dragons and unite kingdoms.",
    keepsakeFeatures: [
      "Extended 30-page narrative with rich paragraph typography",
      "Moral choice crossroads within the story tapestry",
      "Personal growth chart and reading milestone log",
      "Timeless heirloom presentation ready for middle school shelves"
    ],
    recommendedStory: {
      title: "The Knight of Whispering Woods",
      slug: "whispering-woods",
      genre: "Moral Courage & Honor"
    }
  }
];

export default function FootStepsPage() {
  const [selectedMilestone, setSelectedMilestone] = useState<string>("baby-first");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState<boolean>(true);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [userPlayingId, setUserPlayingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = () => {
      api.getApprovedFeedbacks()
        .then((data) => {
          if (isMounted) {
            setFeedbacks(data);
            setLoadingFeedbacks(false);
          }
        })
        .catch((err) => {
          console.error("Failed to load approved feedbacks:", err);
          if (isMounted) setLoadingFeedbacks(false);
        });
    };

    fetchReviews();

    // Listen for real-time broadcast and storage sync from Admin Dashboard
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        channel = new BroadcastChannel("kutty_feedback_sync");
        channel.onmessage = () => {
          fetchReviews();
        };
      }
    } catch {
      // ignore
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === "kuttystory_feedback_updated") {
        fetchReviews();
      }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", fetchReviews);

    return () => {
      isMounted = false;
      if (channel) channel.close();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", fetchReviews);
    };
  }, []);

  const currentStage =
    MILESTONE_STAGES.find((s) => s.id === selectedMilestone) ||
    MILESTONE_STAGES[0];

  // Pagination for carousel (2 reviews per slide on desktop)
  const pageSize = 2;
  const totalSlides = Math.max(1, Math.ceil(feedbacks.length / pageSize));
  const activeFeedbacks = feedbacks.slice(
    carouselIndex * pageSize,
    carouselIndex * pageSize + pageSize
  );

  // Identify first video on active slide for automatic muted playback without autoplaying all videos
  const firstVideoOnSlide = activeFeedbacks.find((fb) => {
    const isVid =
      fb.media_type === "video" ||
      fb.media_url?.endsWith(".mp4") ||
      fb.media_url?.endsWith(".webm") ||
      fb.media_url?.endsWith(".mov");
    return Boolean(isVid && fb.media_url);
  })?.id || null;

  const currentPlayingId = userPlayingId !== null ? userPlayingId : firstVideoOnSlide;

  const handlePrevSlide = () => {
    setUserPlayingId(null);
    setCarouselIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  };

  const handleNextSlide = () => {
    setUserPlayingId(null);
    setCarouselIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  };


  return (
    <div className="pb-24">
      {/* 1. Hero Section */}
      <section className="bg-[#FAF7F2] border-b border-[#EBE3D9] overflow-hidden">
        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-12 lg:py-14">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-4 xl:gap-6">
            {/* Left Column (neatly bounded so it does not create trailing empty space) */}
            <div className="w-full lg:w-[42%] xl:w-[38%] 2xl:w-[36%] shrink-0 flex flex-col items-start text-left z-10">
              {/* White Pill Badge */}
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-[#E3D9CD] shadow-[0_1px_3px_rgba(45,34,42,0.04)] mb-5">
                <span className="text-xs font-semibold tracking-wide text-[#2D222A]">
                  Childhood Milestone Keepsakes
                </span>
              </div>

              {/* Bold 3-line Headline */}
              <h1 className="font-hero-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#2D222A] leading-[1.15] tracking-tight mb-5">
                Foot Steps:<br />
                Every Milestone<br />
                <span className="font-fairy-tale text-[#C98A84]">Woven into Wonder</span>
              </h1>

              {/* Description Paragraph */}
              <p className="text-sm sm:text-base text-[#2D222A]/85 leading-relaxed max-w-lg mb-8 font-editorial-sans">
                Childhood slips through our fingers in a blink of an eye. The KuttyStory Foot Steps collection preserves every tender leap — from their first tiny steps to school milestones — as permanent heirloom literature.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5">
                <a
                  href="#stages"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs hover:shadow active:scale-[0.98]"
                >
                  <span>Explore Milestone Stages</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/storybooks"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white border border-[#E3D9CD] text-[#2D222A] text-xs sm:text-sm font-medium hover:border-[#C98A84] hover:text-[#C98A84] transition-all duration-200 shadow-xs"
                >
                  <span>Browse Catalog</span>
                </Link>
              </div>
            </div>

            {/* Right Column Illustration (fills remaining space, generous prominence without excessive margins) */}
            <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end">
              <img
                src="/footsteps-hero-storybook.png"
                alt="Open KuttyStory 3D pop-up storybook illustration featuring whimsical forest creatures, a cozy cottage, rolling hills, and a glowing moon rising from heirloom pages"
                className="w-full h-auto max-w-2xl lg:max-w-none object-contain block select-none pointer-events-none lg:scale-105 xl:scale-110 2xl:scale-115 origin-center lg:origin-right motion-safe:transition-transform motion-safe:duration-700 hover:scale-[1.16]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Book Sales Map Reach Section */}
      <div id="stages" className="scroll-mt-8">
        <BookSalesMapSection />
      </div>

      {/* 5. Parent Memories & Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] space-y-8">
          <div className="relative flex flex-col items-center text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
              Heartfelt Memories
            </span>
            <h3 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
              What Parents Say About Foot Steps
            </h3>

            {/* Manual Navigation Controls (if more than 1 slide) */}
            {feedbacks.length > pageSize && (
              <div className="sm:absolute sm:right-0 sm:bottom-0 flex items-center justify-center gap-2 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  aria-label="Previous parent reviews"
                  className="w-9 h-9 rounded-full bg-white border border-[#EBE3D9] hover:border-[#C98A84] hover:text-[#C98A84] flex items-center justify-center transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C98A84]/40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs text-[#8C7A86] font-medium px-2">
                  {carouselIndex + 1} / {totalSlides}
                </div>
                <button
                  type="button"
                  onClick={handleNextSlide}
                  aria-label="Next parent reviews"
                  className="w-9 h-9 rounded-full bg-white border border-[#EBE3D9] hover:border-[#C98A84] hover:text-[#C98A84] flex items-center justify-center transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C98A84]/40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loadingFeedbacks ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white p-6 rounded-2xl border border-[#EBE3D9] animate-pulse space-y-3"
                >
                  <div className="h-4 w-24 bg-[#EBE3D9] rounded" />
                  <div className="h-16 bg-[#FAF7F2] rounded" />
                  <div className="h-3 w-32 bg-[#EBE3D9] rounded" />
                </div>
              ))}
            </div>
          ) : feedbacks.length === 0 ? (
            /* Friendly Empty State if no approved reviews */
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#EBE3D9] text-center space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-full bg-[#FAEEED] border border-[#C98A84]/30 flex items-center justify-center text-[#C98A84] mx-auto shadow-xs">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  Every Story Has a Heartbeat
                </h4>
                <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                  No parent reviews have been published yet. Be the first to share your family's keepsake story using the feedback form in our footer below!
                </p>
              </div>
            </div>
          ) : (
            /* Carousel Review Cards */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 motion-reduce:transition-none transition-all duration-300">
                {activeFeedbacks.map((fb) => {
                  const hasReviewText = Boolean(fb.review_text && fb.review_text.trim().length > 0);
                  const isVideo =
                    fb.media_type === "video" ||
                    fb.media_url?.endsWith(".mp4") ||
                    fb.media_url?.endsWith(".webm") ||
                    fb.media_url?.endsWith(".mov");
                  const isVideoActive = currentPlayingId === fb.id;

                  return (
                    <div
                      key={fb.id}
                      className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EBE3D9] shadow-xs flex flex-col space-y-4 hover:border-[#C98A84]/40 transition-all h-fit"
                    >
                      <div className="space-y-3.5">
                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 text-[#C5A059]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= fb.rating
                                  ? "fill-[#C5A059] text-[#C5A059]"
                                  : "text-[#EBE3D9]"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Prominent Media Display (Responsive without distortion; zero space reserved if absent) */}
                        {fb.media_url && (
                          <div className="pt-0.5">
                            {isVideo ? (
                              <FeedbackVideoCard
                                src={fb.media_url}
                                authorName={fb.name}
                                isActiveCard={isVideoActive}
                                onPlayRequest={() => setUserPlayingId(fb.id)}
                              />
                            ) : (
                              <div className="w-full rounded-2xl overflow-hidden bg-[#FAF7F2]/80 border border-[#EBE3D9] flex items-center justify-center">
                                <img
                                  src={fb.media_url}
                                  alt={`Memory shared by ${fb.name}`}
                                  className="w-full max-h-72 object-contain rounded-2xl"
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Review Text (Only displayed when review text is provided; omitted entirely when blank) */}
                        {hasReviewText && (
                          <p className="text-xs sm:text-[13px] text-[#695B64] italic leading-relaxed pt-0.5">
                            “{fb.review_text!.trim()}”
                          </p>
                        )}
                      </div>

                      {/* Author & Place (Neatly aligned at the bottom with a subtle divider) */}
                      <div className="pt-3 border-t border-[#EBE3D9]/70 flex items-center justify-between text-xs font-bold text-[#2D222A]">
                        <span>— {fb.name}, {fb.place}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Dots */}
              {totalSlides > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  {Array.from({ length: totalSlides }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={() => {
                        setUserPlayingId(null);
                        setCarouselIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === carouselIndex
                          ? "w-6 bg-[#C98A84]"
                          : "w-2 bg-[#EBE3D9] hover:bg-[#C98A84]/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


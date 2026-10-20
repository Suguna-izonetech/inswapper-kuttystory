import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Clock,
  ArrowRight,
  Heart,
  Send,
  CheckCircle2,
  X,
  PenTool,
  Star,
  MapPin,
  GraduationCap,
  Feather,
  Smile,
  Compass,
  Rocket,
  Flame,
  Award
} from "lucide-react";
import { api, ChildStory, SubmitChildStoryPayload } from "@/lib/api";

interface JournalArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  readingTime: string;
  date: string;
  author: string;
  authorRole: string;
  excerpt: string;
  coverImage: string;
  content: string[];
  pullQuote?: string;
}

const ARTICLES: JournalArticle[] = [
  {
    id: "psychology-hero",
    title: "The Psychology of Seeing Yourself as the Hero: How Personalized Stories Build Resilience",
    slug: "psychology-of-hero",
    category: "Child Psychology",
    readingTime: "6 min read",
    date: "October 14, 2026",
    author: "Dr. Ananya Lakshmi",
    authorRole: "Child Development Advisor",
    excerpt: "When young children see their own likeness and name navigating challenges in literature, their brain encodes courage not as an abstract fairy tale concept, but as an intrinsic personal trait.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    pullQuote: "A child who sees themselves conquer a dragon in a book goes to bed believing they have the courage to conquer anything tomorrow.",
    content: [
      "In early childhood development, narrative identity begins forming around the age of three. When children listen to stories, they actively project themselves into the protagonists.",
      "Personalized literature bridges this gap instantaneously. Cognitive neuroscientists have observed that hearing one's own name activates the medial prefrontal cortex — the neurological seat of self-reflection and emotional memory.",
      "When a child sees their own painted likeness stepping onto a misty bridge of stars or comforting a lost unicorn, the emotional takeaway is profound: 'I am someone who helps. I am someone who doesn't give up when things look difficult.'"
    ]
  },
  {
    id: "bedtime-ritual",
    title: "The 15-Minute Bedtime Ritual That Calms Evening Anxiety in Young Children",
    slug: "bedtime-ritual-calms-anxiety",
    category: "Bedtime Rituals",
    readingTime: "4 min read",
    date: "October 08, 2026",
    author: "Kavitha Sundaram",
    authorRole: "Founder & Story Architect",
    excerpt: "Transitioning from the stimulating energy of the day into restful sleep can be daunting for young minds. Here is our gentle 3-step evening rhythm.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
    pullQuote: "Bedtime isn't just about sleep; it is the sacred threshold where children feel most securely held by the power of stories.",
    content: [
      "Step 1: The Golden Dimmer (Minutes 0–5). Lower bedroom lighting 30 minutes before bed.",
      "Step 2: The Physical Grounding (Minutes 5–10). A warm blanket tuck-in combined with asking: 'What was the bravest thing you did today?'",
      "Step 3: The Slow-Cadence Story (Minutes 10–15). Read aloud at 60 words per minute — roughly matching a resting heartbeat."
    ]
  }
];

const CATEGORIES = [
  "All Stories",
  "Fantasy & Magic",
  "Adventure",
  "Animal Tales",
  "Space & Sci-Fi",
  "Parenting & Articles"
];

const COLOR_PALETTES = [
  { name: "Rose Blossom", hex: "#C98A84", bgClass: "from-[#FBF1EF] to-[#F5DFDC]" },
  { name: "Royal Amethyst", hex: "#8B3DFF", bgClass: "from-[#F3EBFF] to-[#E5D4FF]" },
  { name: "Emerald Grove", hex: "#2E7D32", bgClass: "from-[#EDF7EE] to-[#DCEDDD]" },
  { name: "Ocean Sapphire", hex: "#0288D1", bgClass: "from-[#E6F4FA] to-[#CEE9F7]" },
  { name: "Sunset Amber", hex: "#E65100", bgClass: "from-[#FFF3E8] to-[#FDE1CD]" }
];

const STORY_STARTERS = [
  "Once upon a time in a secret mango grove...",
  "The golden key in my pocket began to glow warmly...",
  "My pet puppy suddenly sneezed and started to speak human words...",
  "A tiny spaceship shaped like an acorn landed on my windowsill...",
  "Deep beneath the roaring blue waves of the ocean..."
];

export default function JournalPage() {
  const [selectedCat, setSelectedCat] = useState("All Stories");
  const [childStories, setChildStories] = useState<ChildStory[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [selectedStory, setSelectedStory] = useState<ChildStory | null>(null);
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);
  const [likedStories, setLikedStories] = useState<Record<string, boolean>>({});

  // Submission Form State
  const [childName, setChildName] = useState("");
  const [standard, setStandard] = useState("");
  const [place, setPlace] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [category, setCategory] = useState("Adventure");
  const [coverColor, setCoverColor] = useState("#C98A84");
  const [storyText, setStoryText] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<ChildStory | null>(null);
  const [formError, setFormError] = useState("");

  const writeDeskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStories();
  }, [selectedCat]);

  const fetchStories = async () => {
    setLoadingStories(true);
    try {
      const catParam = selectedCat === "Parenting & Articles" || selectedCat === "All Stories" ? undefined : selectedCat;
      const data = await api.getChildStories(catParam);
      setChildStories(data);
    } catch (err) {
      console.error("Failed to load child stories:", err);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, storyId: string) => {
    e.stopPropagation();
    if (likedStories[storyId]) return;
    try {
      const res = await api.likeChildStory(storyId);
      setLikedStories((prev) => ({ ...prev, [storyId]: true }));
      setChildStories((prev) =>
        prev.map((s) => (s.id === storyId ? { ...s, likes_count: res.likes_count } : s))
      );
    } catch (err) {
      console.error("Failed to like story:", err);
    }
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!childName.trim()) {
      setFormError("Please enter the young author's name!");
      return;
    }
    if (!standard.trim()) {
      setFormError("Please enter standard / grade (e.g. 3rd Standard)!");
      return;
    }
    if (!place.trim()) {
      setFormError("Please enter your city / place (e.g. Chennai)!");
      return;
    }
    if (!storyTitle.trim()) {
      setFormError("Please give your story a wonderful title!");
      return;
    }
    if (!storyText.trim() || storyText.trim().length < 30) {
      setFormError("Your story is a bit too short! Write at least 2 or 3 sentences.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: SubmitChildStoryPayload = {
        child_name: childName.trim(),
        standard: standard.trim(),
        place: place.trim(),
        title: storyTitle.trim(),
        category,
        cover_color: coverColor,
        story_text: storyText.trim(),
        parent_email: parentEmail.trim() || undefined
      };

      const res = await api.submitChildStory(payload);
      setSubmissionSuccess(res.story);
      // NOTE: story is pending — NOT added to live list until admin publishes

      // Reset form
      setChildName("");
      setStandard("");
      setPlace("");
      setStoryTitle("");
      setStoryText("");
      setParentEmail("");
    } catch (err: any) {
      setFormError(err.message || "Failed to submit story. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToWritingDesk = () => {
    writeDeskRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const wordCount = storyText.trim() ? storyText.trim().split(/\s+/).length : 0;

  return (
    <div className="pb-28 bg-[#FAF7F2] min-h-screen">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAEEED] via-[#FAF7F2] to-[#FAF7F2] pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        {/* Subtle decorative background elements */}
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-[#C98A84]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#8B3DFF]/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#C98A84]/40 text-xs font-bold text-[#C98A84] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#C98A84] animate-pulse" />
            <span>Little Authors Atelier • Where Young Minds Create Magic</span>
          </div>

          <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight leading-[1.15]">
            Stories Written by <span className="italic font-normal text-[#C98A84]">Children</span>, Loved by All
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            Every child is a born storyteller! Read enchanting tales penned by little authors from across the country, 
            or let your child write their own adventure to be proudly published in our community library.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
            <button
              onClick={scrollToWritingDesk}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#C98A84] to-[#B87A74] hover:from-[#B87A74] hover:to-[#A76963] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#C98A84]/25 flex items-center gap-2.5 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Pen Your Child's Story</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#stories-grid"
              className="px-6 py-3.5 rounded-full bg-white border border-[#EBE3D9] hover:bg-[#F8F5EE] text-[#2D222A] text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#C98A84]" />
              <span>Explore Stories ({childStories.length})</span>
            </a>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-8 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCat === cat
                    ? "bg-[#C98A84] text-white shadow-xs scale-105"
                    : "bg-white border border-[#EBE3D9] text-[#695B64] hover:bg-[#FAF7F2] hover:text-[#2D222A]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. MAIN CONTENT AREA */}
      <div id="stories-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">
        {selectedCat !== "Parenting & Articles" && (
          <section className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EBE3D9] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                  <Award className="w-4 h-4 text-[#C98A84]" />
                  <span>The Young Storytellers Showcase</span>
                </div>
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] mt-1">
                  Tales Penned by Little Authors
                </h2>
              </div>
              <p className="text-xs text-[#695B64]">
                Tap any book to read the full story in our storybook reader
              </p>
            </div>

            {loadingStories ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-[#C98A84] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[#695B64] font-medium">Opening the little storybooks...</p>
              </div>
            ) : childStories.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-[#EBE3D9] p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] mx-auto">
                  <Feather className="w-8 h-8" />
                </div>
                <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  No stories in this genre yet!
                </h3>
                <p className="text-xs text-[#695B64] max-w-md mx-auto">
                  Be the very first little author to submit a story in this category. Your imagination can inspire kids everywhere!
                </p>
                <button
                  onClick={scrollToWritingDesk}
                  className="px-5 py-2.5 rounded-full bg-[#C98A84] text-white text-xs font-semibold cursor-pointer"
                >
                  Write the First Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {childStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => setSelectedStory(story)}
                    className="editorial-card group relative flex flex-col bg-white rounded-2xl border border-[#EBE3D9] hover:border-[#C98A84]/60 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
                  >
                    {/* Hardcover Book Spine Mockup Header */}
                    <div
                      className="relative p-6 sm:p-7 flex flex-col justify-between overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${story.cover_color || "#C98A84"}18 0%, ${story.cover_color || "#C98A84"}35 100%)`,
                        borderBottom: `2px solid ${story.cover_color || "#C98A84"}40`
                      }}
                    >
                      {/* Spine Crease / French joint overlay */}
                      <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
                      <div className="absolute top-0 bottom-0 left-3 w-px bg-white/40 pointer-events-none" />

                      <div className="flex items-center justify-between z-10">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase shadow-2xs"
                          style={{
                            backgroundColor: story.cover_color || "#C98A84",
                            color: "#FFFFFF"
                          }}
                        >
                          {story.category || "Adventure"}
                        </span>

                        {story.status === "featured" && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-800">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      <div className="mt-6 mb-2 z-10">
                        <h3 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A] group-hover:text-[#C98A84] transition leading-snug line-clamp-2">
                          {story.title}
                        </h3>
                      </div>

                      {/* Author Tagline */}
                      <div className="pt-2 flex items-center gap-2 text-xs text-[#2D222A] font-semibold z-10">
                        <Feather className="w-3.5 h-3.5 text-[#C98A84]" />
                        <span>By {story.child_name}</span>
                      </div>
                    </div>

                    {/* Book Details Body */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      {/* Author badge: Standard & Place */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#695B64] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EBE3D9]">
                        <span className="flex items-center gap-1 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-[#C98A84]" />
                          {story.standard}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#C98A84]" />
                          {story.place}
                        </span>
                      </div>

                      {/* Excerpt */}
                      <p className="text-xs sm:text-[13px] text-[#695B64] line-clamp-3 leading-relaxed italic">
                        "{story.story_text}"
                      </p>

                      {/* Card Footer: Read & Like */}
                      <div className="pt-3 border-t border-[#EBE3D9] flex items-center justify-between">
                        <button
                          type="button"
                          className="text-xs font-bold text-[#C98A84] group-hover:text-[#A76963] flex items-center gap-1 transition"
                        >
                          <span>Open Storybook</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleLike(e, story.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            likedStories[story.id]
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 border border-gray-200"
                          }`}
                          title="Heart this story"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              likedStories[story.id] ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                          <span>{story.likes_count || 0}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 3. ATELIER ARTICLES (PRESERVED) */}
        {(selectedCat === "All Stories" || selectedCat === "Parenting & Articles") && (
          <section className="space-y-6 pt-6 border-t border-[#EBE3D9]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                  Atelier Insights & Research
                </span>
                <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] mt-1">
                  Bedtime Rituals & Child Psychology
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ARTICLES.map((art) => (
                <div
                  key={art.id}
                  onClick={() => setActiveArticle(art)}
                  className="bg-white rounded-3xl border border-[#EBE3D9] overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
                >
                  <div className="relative aspect-16/9 overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 text-[10px] font-bold text-[#C98A84]">
                      {art.category}
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#695B64]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{art.readingTime}</span>
                        <span>•</span>
                        <span>{art.date}</span>
                      </div>
                      <h3 className="font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A]">
                        {art.title}
                      </h3>
                      <p className="text-xs text-[#695B64] line-clamp-2">
                        {art.excerpt}
                      </p>
                    </div>
                    <div className="pt-2 text-xs font-bold text-[#C98A84] flex items-center gap-1">
                      <span>Read Essay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. THE MAGICAL STORY SUBMISSION STUDIO */}
        <section
          ref={writeDeskRef}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF9F5] via-[#FFFBF9] to-[#FAEEED] border-2 border-[#C98A84]/40 p-6 sm:p-12 shadow-xl space-y-8"
        >
          {/* Whimsical background accents */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#C98A84]/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[#8B3DFF]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Studio Header */}
          <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-bold text-[#C98A84] shadow-xs">
              <Sparkles className="w-4 h-4 text-[#C98A84]" />
              <span>Become a Published Little Author</span>
            </div>

            <h2 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D222A] leading-tight">
              Got a Magical Tale to Tell? <br />
              <span className="italic font-normal text-[#C98A84]">Write Your Story Here!</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed max-w-xl mx-auto">
              Type your child's original story below. We publish it with their name, standard, and city 
              in the Little Authors Library so friends, family, and readers everywhere can read and cherish it!
            </p>
          </div>

          {/* Submission Received Message */}
          {submissionSuccess && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-amber-300 p-6 sm:p-8 text-center space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-300">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                ✍️
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Thank you, {submissionSuccess.child_name}!
              </h3>
              <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                Your story <span className="font-bold text-[#2D222A]">"{submissionSuccess.title}"</span> has been received!<br />
                Our team will review it and publish it in the Little Authors Library very soon. 🌟
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                <span>⏳</span>
                <span>Awaiting Admin Review & Publishing</span>
              </div>
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setSubmissionSuccess(null)}
                  className="px-5 py-2.5 rounded-full bg-[#C98A84] text-white text-xs font-semibold shadow-xs hover:bg-[#B87A74] cursor-pointer"
                >
                  Write Another Story
                </button>
              </div>
            </div>
          )}

          {/* Submission Form */}
          {!submissionSuccess && (
            <form onSubmit={handleSubmitStory} className="max-w-3xl mx-auto space-y-6 relative z-10">
              {formError && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <span className="font-bold">Oops!</span> {formError}
                </div>
              )}

              {/* Grid: Child Name, Standard, Place */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
                    <Feather className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>Little Author's Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Diya / Aarav"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>Standard / Class *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={standard}
                    onChange={(e) => setStandard(e.target.value)}
                    placeholder="e.g. 3rd Standard / Grade 4"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>City / Place *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="e.g. Chennai / Coimbatore"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none transition"
                  />
                </div>
              </div>

              {/* Story Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>Story Title *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                    placeholder="e.g. The Boy Who Talked to Rainclouds"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none transition font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>Category / Genre</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none transition"
                  >
                    <option value="Fantasy & Magic">🏰 Fantasy & Magic</option>
                    <option value="Adventure">🧭 Adventure</option>
                    <option value="Animal Tales">🦁 Animal Tales</option>
                    <option value="Space & Sci-Fi">🚀 Space & Sci-Fi</option>
                    <option value="Bedtime & Calm">🌙 Bedtime & Calm</option>
                    <option value="Everyday Hero">🌟 Everyday Hero</option>
                  </select>
                </div>
              </div>

              {/* Story Starters Inspiration */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-[#695B64] flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-[#C98A84]" />
                  <span>Need an idea? Click any prompt to start writing:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {STORY_STARTERS.map((starter, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setStoryText((prev) => (prev ? prev + " " + starter : starter))}
                      className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white border border-[#EBE3D9] text-[11px] text-[#695B64] hover:text-[#C98A84] transition text-left cursor-pointer"
                    >
                      "{starter}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>Write The Story *</span>
                  </label>
                  <span className="text-[11px] text-[#695B64]">
                    {wordCount} words written
                  </span>
                </div>
                <textarea
                  required
                  rows={7}
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Once upon a time in a sunny corner of our town..."
                  className="w-full p-4 rounded-2xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none transition leading-relaxed resize-y font-story"
                />
              </div>

              {/* Book Spine Color Selection & Parent Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#2D222A]">
                    Pick Your Book Cover Color
                  </label>
                  <div className="flex items-center gap-3">
                    {COLOR_PALETTES.map((p) => (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setCoverColor(p.hex)}
                        title={p.name}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          coverColor === p.hex ? "scale-125 border-[#2D222A] shadow-md" : "border-white"
                        }`}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D222A]">
                    Parent's Email / WhatsApp (Optional)
                  </label>
                  <input
                    type="text"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="We'll send you the published book certificate!"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] text-xs text-[#2D222A] outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#C98A84] via-[#BD7A74] to-[#A76963] hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-[#C98A84]/30 flex items-center justify-center gap-2 mx-auto transition transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Publishing Your Storybook...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish My Story to the Atelier</span>
                      <Send className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-[#695B64] mt-2">
                  ✨ Instant publication! Your story will appear in the library right away.
                </p>
              </div>
            </form>
          )}
        </section>
      </div>

      {/* 5. STORYBOOK READER MODAL */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-[#2D222A]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full border border-[#EBE3D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div
              className="p-6 border-b border-[#EBE3D9] flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${selectedStory.cover_color || "#C98A84"}20 0%, #FAF7F2 100%)`
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-bold uppercase text-white shadow-xs"
                  style={{ backgroundColor: selectedStory.cover_color || "#C98A84" }}
                >
                  {selectedStory.category}
                </span>
                <span className="text-xs text-[#695B64]">Little Authors Collection</span>
              </div>

              <button
                onClick={() => setSelectedStory(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] flex items-center justify-center text-[#695B64] hover:text-[#2D222A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Parchment Story Layout */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              {/* Title & Child Details */}
              <div className="text-center space-y-3 pb-6 border-b border-[#EBE3D9]">
                <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A] leading-tight">
                  {selectedStory.title}
                </h2>

                <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-[#695B64] bg-white px-4 py-2 rounded-full border border-[#EBE3D9] shadow-xs">
                  <span className="text-[#C98A84]">Written by {selectedStory.child_name}</span>
                  <span>•</span>
                  <span>{selectedStory.standard}</span>
                  <span>•</span>
                  <span>{selectedStory.place}</span>
                </div>
              </div>

              {/* Story Content with decorative drop cap */}
              <div className="text-[#2D222A] leading-relaxed font-story text-base sm:text-lg space-y-4 max-w-2xl mx-auto pt-2">
                <p className="first-letter:font-editorial-serif first-letter:text-5xl first-letter:font-bold first-letter:text-[#C98A84] first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                  {selectedStory.story_text}
                </p>
              </div>

              {/* Footer encouragement */}
              <div className="pt-8 border-t border-[#EBE3D9] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleLike(e, selectedStory.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                      likedStories[selectedStory.id]
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedStories[selectedStory.id] ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                    <span>Love this Story ({selectedStory.likes_count || 0})</span>
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedStory(null);
                      scrollToWritingDesk();
                    }}
                    className="px-5 py-2 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Write Your Story</span>
                  </button>
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="px-5 py-2 rounded-full bg-white border border-[#EBE3D9] text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. ARTICLE DETAIL MODAL */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-[#2D222A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#EBE3D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#EBE3D9] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-3 text-xs text-[#695B64]">
                <span className="font-semibold text-[#C98A84] uppercase tracking-wider">
                  {activeArticle.category}
                </span>
                <span>•</span>
                <span>{activeArticle.readingTime}</span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] flex items-center justify-center text-[#695B64] hover:text-[#2D222A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A] leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-[#695B64] pb-4 border-b border-[#EBE3D9]">
                <div className="w-9 h-9 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] font-editorial-serif font-bold text-xs">
                  {activeArticle.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[#2D222A]">{activeArticle.author}</div>
                  <div className="text-[11px]">{activeArticle.authorRole} • Published {activeArticle.date}</div>
                </div>
              </div>

              {activeArticle.pullQuote && (
                <div className="p-6 rounded-2xl bg-[#FAEEED]/40 border-l-4 border-[#C98A84] font-story text-base sm:text-lg italic text-[#2D222A] leading-relaxed">
                  “{activeArticle.pullQuote}”
                </div>
              )}

              <div className="space-y-4 text-xs sm:text-sm text-[#4E424B] leading-relaxed">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-8 border-t border-[#EBE3D9] bg-[#FAF7F2] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl space-y-4">
                <div className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  Bring this story magic to your child
                </div>
                <p className="text-xs text-[#695B64]">
                  Browse our personalized storybooks designed to make your child the hero of bedtime reading.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/storybooks"
                    onClick={() => setActiveArticle(null)}
                    className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Explore Storybooks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#EBE3D9] text-[#2D222A] text-xs font-medium cursor-pointer"
                  >
                    Back to Journal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Search,
  Filter,
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle,
  Eye,
  X,
  Heart,
  SlidersHorizontal
} from "lucide-react";
import { api, StoryTemplate } from "@/lib/api";
import { HardcoverBook } from "@/components/HardcoverBook";

interface StoryCatalogItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  age_range: string;
  min_age: number;
  max_age: number;
  page_count: number;
  price_digital: number;
  price_print: number;
  description: string;
  cover_image_url: string;
  rating: number;
  review_count: number;
  tag: string;
  is_live: boolean;
  sample_spreads: {
    page: number;
    title: string;
    text: string;
    scene: string;
  }[];
}

function formatCategory(cat?: string): string {
  if (!cat) return "Adventure";
  if (cat === cat.toUpperCase()) {
    return cat.charAt(0) + cat.slice(1).toLowerCase();
  }
  return cat;
}

function parseAgeRange(ageRange?: string, minAge?: number, maxAge?: number) {
  let min = minAge || 3;
  let max = maxAge || 7;
  if (ageRange) {
    const matches = ageRange.match(/(\d+)\s*[-–to]\s*(\d+)/i);
    if (matches) {
      min = parseInt(matches[1], 10);
      max = parseInt(matches[2], 10);
    }
  }
  return { min, max };
}

const DEFAULT_TAGS = ["Bestseller", "New Release", "Popular", "Staff Favorite", "Featured"];
const DEFAULT_RATINGS = [5.0, 4.9, 4.8, 4.9, 5.0];
const DEFAULT_REVIEWS = [148, 114, 92, 83, 67];

function mapTemplateToCatalogItem(template: StoryTemplate, index: number): StoryCatalogItem {
  let sampleSpreads: StoryCatalogItem["sample_spreads"] = [];
  if (template.pages && template.pages.length > 0) {
    const textPages = template.pages.filter(
      (p) => p.page_type !== "cover" && (p.story_text || p.extracted_text)
    );
    const selected = textPages.length >= 2 ? textPages.slice(0, 3) : template.pages.slice(0, 3);
    if (selected.length > 0) {
      sampleSpreads = selected.map((p) => ({
        page: p.page_number,
        title: `Page ${p.page_number} Spread`,
        text: (p.story_text || p.extracted_text || `Scene illustration for ${template.title}`).replace(
          /\[Name\]|\{name\}|\[child_name\]|\{child_name\}/g,
          "your child"
        ),
        scene: p.scene_description || `Illustrated personalized story scene from ${template.title}.`
      }));
    }
  }

  if (sampleSpreads.length === 0) {
    sampleSpreads = [
      {
        page: 1,
        title: "The Adventure Begins",
        text: `One beautiful morning, your child steps into the magical realm of ${template.title}.`,
        scene: `Opening story spread illustration for ${template.title}.`
      },
      {
        page: Math.floor((template.page_count || 24) / 2),
        title: "The Heart of the Journey",
        text: "With curiosity and wonder, an extraordinary discovery awaits along the golden path.",
        scene: "A breathtaking full-bleed illustration celebrating courage and friendship."
      }
    ];
  }

  const { min, max } = parseAgeRange(template.age_range, template.min_age, template.max_age);

  return {
    id: template.id,
    slug: template.slug,
    title: template.title,
    category: formatCategory(template.category),
    age_range: template.age_range || `Ages ${min}–${max}`,
    min_age: min,
    max_age: max,
    page_count: template.page_count || 24,
    price_digital: template.price_digital || 799,
    price_print: template.price_print || 1399,
    description: template.description || `An enchanting personalized storybook where your child becomes the hero of ${template.title}.`,
    cover_image_url: template.cover_image_url || "/unicorn_cover.png",
    rating: DEFAULT_RATINGS[index % DEFAULT_RATINGS.length],
    review_count: DEFAULT_REVIEWS[index % DEFAULT_REVIEWS.length],
    tag: DEFAULT_TAGS[index % DEFAULT_TAGS.length],
    is_live: true,
    sample_spreads: sampleSpreads
  };
}

const AGE_FILTERS = [
  { label: "All Ages", min: 0, max: 99 },
  { label: "2 - 4 Years", min: 2, max: 4 },
  { label: "4 - 6 Years", min: 4, max: 6 },
  { label: "6 - 8 Years", min: 6, max: 8 },
  { label: "8+ Years", min: 8, max: 99 }
];

export default function StoryBooksPage() {
  const [stories, setStories] = useState<StoryCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All Stories");
  const [selectedAge, setSelectedAge] = useState("All Ages");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewStory, setPreviewStory] = useState<StoryCatalogItem | null>(null);
  const [activeSpreadIndex, setActiveSpreadIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.getStories()
      .then((apiStories: StoryTemplate[]) => {
        if (apiStories && apiStories.length > 0) {
          const mapped = apiStories.map((template, idx) => mapTemplateToCatalogItem(template, idx));
          setStories(mapped);
        } else {
          setStories([]);
        }
      })
      .catch((err) => {
        console.error("Error loading stories:", err);
        setStories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "All Stories",
    ...Array.from(new Set(stories.map((s) => s.category).filter(Boolean)))
  ];

  const filteredStories = stories.filter((story) => {
    const matchesCat =
      selectedCategory === "All Stories" ||
      story.category?.toLowerCase() === selectedCategory.toLowerCase();
    const ageFilter = AGE_FILTERS.find((a) => a.label === selectedAge);
    const matchesAge =
      !ageFilter ||
      selectedAge === "All Ages" ||
      (story.min_age <= ageFilter.max && story.max_age >= ageFilter.min);
    const matchesSearch =
      story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      story.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesAge && matchesSearch;
  });

  return (
    <div className="pb-24">
      {/* 1. Atelier Header & Introduction */}
      <section className="bg-gradient-to-b from-[#FAEEED]/40 via-[#FAF7F2] to-[#FAF7F2] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-medium text-[#C98A84] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Heirloom Library</span>
          </div>

          <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight">
            Story Books Where <span className="italic font-normal text-[#C98A84]">They Shine</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            Every storybook in our atelier is thoughtfully written to nurture bravery, empathy, and boundless wonder. Customized with your child’s recognizable likeness across all 26 full-color spreads.
          </p>

          {/* Quick Specifications Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#695B64]">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#8F9E8B]" />
              <span>210 × 210 mm Archival Hardcover</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#8F9E8B]" />
              <span>Heavyweight 170gsm Silk Paper</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#8F9E8B]" />
              <span>Smyth-Sewn Lie-Flat Binding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#8F9E8B]" />
              <span>Deterministic PDF Proofing</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Search & Filters Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EBE3D9] shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#695B64]" />
              <input
                type="text"
                placeholder="Search by title, theme, or magical creature..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#FAF7F2] border border-[#EBE3D9] text-xs text-[#2D222A] focus:outline-hidden focus:border-[#C98A84] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#695B64] hover:text-[#2D222A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Age Filter Dropdown / Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-medium text-[#695B64] flex items-center gap-1 shrink-0">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#C98A84]" />
                <span>Age:</span>
              </span>
              {AGE_FILTERS.map((age) => (
                <button
                  key={age.label}
                  onClick={() => setSelectedAge(age.label)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${selectedAge === age.label
                      ? "bg-[#2D222A] text-white shadow-xs"
                      : "bg-[#FAF7F2] text-[#695B64] hover:bg-[#F2EEF7]"
                    }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto border-t border-[#EBE3D9] pt-4 scrollbar-none">
            <span className="text-xs font-medium text-[#695B64] flex items-center gap-1 shrink-0 mr-2">
              <Filter className="w-3.5 h-3.5 text-[#8F9E8B]" />
              <span>Theme:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${selectedCategory === cat
                    ? "bg-[#C98A84] text-white shadow-xs"
                    : "bg-[#FAF7F2] text-[#695B64] hover:bg-[#FAEEED] hover:text-[#C98A84]"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
              {selectedCategory}
            </h2>
            <p className="text-xs text-[#695B64] mt-0.5">
              Showing {filteredStories.length} curated master storybook templates
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="editorial-card p-6 bg-white border border-[#EBE3D9] animate-pulse space-y-4">
                <div className="aspect-square bg-[#FAF7F2] rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-[#EBE3D9]" />
                </div>
                <div className="h-4 bg-[#FAF7F2] rounded w-3/4" />
                <div className="h-3 bg-[#FAF7F2] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#EBE3D9] p-8 space-y-4">
            <BookOpen className="w-12 h-12 text-[#C98A84]/60 mx-auto" />
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              No Storybooks Matched Your Search
            </h3>
            <p className="text-xs text-[#695B64] max-w-md mx-auto">
              Try adjusting your theme filters, age range, or search keywords to explore other magical storybooks in our atelier.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All Stories");
                setSelectedAge("All Ages");
                setSearchQuery("");
              }}
              className="px-5 py-2 rounded-full bg-[#C98A84] text-white text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="editorial-card group flex flex-col justify-between overflow-hidden bg-white border border-[#EBE3D9] hover:border-[#C98A84]/50 transition-all duration-300"
              >
                {/* Book Cover Container — Realistic 3D Hardcover Book Showcase */}
                <div>
                  <div className="relative aspect-square p-5 sm:p-6 bg-gradient-to-b from-[#FDFCFB] via-[#F8F5EE] to-[#EFE8DD] flex items-center justify-center overflow-hidden border-b border-[#EBE3D9]/70">
                    <div className="w-[82%] sm:w-[86%] max-w-[320px] aspect-square flex items-center justify-center mx-auto">
                      <HardcoverBook
                        coverUrl={story.cover_image_url}
                        title={story.title}
                        aspectRatio="square"
                        fallbackSrc="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                        onClick={() => {
                          setPreviewStory(story);
                          setActiveSpreadIndex(0);
                        }}
                      >
                        {/* Quick Preview Hover Overlay */}
                        <div className="absolute inset-0 bg-[#2D222A]/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 rounded-r-[7px] rounded-l-[4px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewStory(story);
                              setActiveSpreadIndex(0);
                            }}
                            className="px-4 py-2.5 rounded-full bg-white text-[#2D222A] hover:bg-[#FAF7F2] text-xs font-medium shadow-lg transition-transform transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#C98A84]" />
                            <span>Quick Look Inside</span>
                          </button>
                        </div>
                      </HardcoverBook>
                    </div>

                    {/* Ribbon Tag */}
                    <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#EBE3D9] text-[11px] font-semibold text-[#2D222A] shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#C98A84]" />
                      <span>{story.tag}</span>
                    </div>

                    {/* Age Range Badge */}
                    <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-[#2D222A]/85 backdrop-blur-md text-[11px] font-medium text-white shadow-xs">
                      {story.age_range}
                    </div>
                  </div>

                  {/* Book Card Content */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#C98A84] font-semibold uppercase tracking-wider">
                        {story.category}
                      </span>
                      <span className="text-[#695B64] flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                        <strong className="text-[#2D222A]">{story.rating}</strong> ({story.review_count})
                      </span>
                    </div>

                    <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A] group-hover:text-[#C98A84] transition-colors leading-snug">
                      {story.title}
                    </h3>

                    <p className="text-xs text-[#695B64] leading-relaxed line-clamp-3">
                      {story.description}
                    </p>

                    <div className="text-[11px] text-[#8F9E8B] flex items-center gap-1.5 pt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-[#8F9E8B]" />
                      <span>{story.page_count} Full-Bleed Pages • 8×8 mm Archival Hardcover</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-[#EBE3D9] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#695B64]">
                        Starting from
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                          ₹{story.price_digital ? Number(story.price_digital).toLocaleString("en-IN") : "799"}
                        </span>
                        <span className="text-[11px] text-[#695B64]">Digital</span>
                        <span className="text-[#C98A84] font-medium text-xs">•</span>
                        <span className="text-xs font-medium text-[#695B64]">
                          ₹{story.price_print ? Number(story.price_print).toLocaleString("en-IN") : "1,399"} Print
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/personalize/${story.slug}`}
                      className="px-4 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                    >
                      <span>Personalize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Heirloom Craftsmanship Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9]">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
              Museum-Grade Craftsmanship
            </span>
            <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
              Built to Be Cherished for Generations
            </h3>
            <p className="text-xs sm:text-sm text-[#695B64]">
              We treat each child’s book as a literary heirloom, printed with traditional European bindery methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#FAEEED] text-[#C98A84] flex items-center justify-center font-editorial-serif font-bold">
                01
              </div>
              <h4 className="font-editorial-serif text-lg font-bold text-[#2D222A]">
                170gsm Silk Fine-Art Paper
              </h4>
              <p className="text-xs text-[#695B64] leading-relaxed">
                Acid-free, FSC-certified heavyweight pages that resist fingerprints, glare, and yellowing for decades.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#F2EEF7] text-[#B8A9C9] flex items-center justify-center font-editorial-serif font-bold">
                02
              </div>
              <h4 className="font-editorial-serif text-lg font-bold text-[#2D222A]">
                Character Consistency Engine
              </h4>
              <p className="text-xs text-[#695B64] leading-relaxed">
                Multi-angle face preservation keeps your child recognizable through smiles, wonder, and dynamic story scenes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] space-y-2.5">
              <div className="w-10 h-10 rounded-full bg-[#EEF4ED] text-[#8F9E8B] flex items-center justify-center font-editorial-serif font-bold">
                03
              </div>
              <h4 className="font-editorial-serif text-lg font-bold text-[#2D222A]">
                Hand-Sewn Durable Hardcover
              </h4>
              <p className="text-xs text-[#695B64] leading-relaxed">
                Sturdy cloth-bound spine with glossy or soft-touch matte lamination that survives enthusiastic bedtime read-alouds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Quick Look Inside Modal */}
      {previewStory && (
        <div className="fixed inset-0 z-50 bg-[#2D222A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#EBE3D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EBE3D9] flex items-center justify-between bg-[#FAF7F2]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C98A84]">
                  Storybook Spread Preview
                </span>
                <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                  {previewStory.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewStory(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] flex items-center justify-center text-[#695B64] hover:text-[#2D222A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {(() => {
                const currentSpread = previewStory.sample_spreads[activeSpreadIndex] || previewStory.sample_spreads[0];
                if (!currentSpread) return null;
                return (
                  <>
                    <div className="aspect-16/9 bg-[#FAEEED]/40 rounded-2xl border border-[#EBE3D9] p-8 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-[#2D222A] border border-[#EBE3D9]">
                        Spread {activeSpreadIndex + 1} of {previewStory.sample_spreads.length}
                      </div>

                      <div className="space-y-3 max-w-lg">
                        <span className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">
                          Page {currentSpread.page} Preview
                        </span>
                        <h4 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                          {currentSpread.title}
                        </h4>
                        <p className="font-story text-base sm:text-lg text-[#2D222A] italic leading-relaxed">
                          “{currentSpread.text}”
                        </p>
                      </div>

                      <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#EBE3D9] text-xs text-[#695B64]">
                        <strong className="text-[#2D222A] block mb-0.5">Scene Illustration Note:</strong>
                        {currentSpread.scene}
                      </div>
                    </div>

                    {/* Spread selector tabs */}
                    <div className="flex gap-2">
                      {previewStory.sample_spreads.map((spread, idx) => (
                        <button
                          key={spread.page || idx}
                          onClick={() => setActiveSpreadIndex(idx)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${activeSpreadIndex === idx
                              ? "bg-[#C98A84] text-white border-[#C98A84]"
                              : "bg-[#FAF7F2] text-[#695B64] border-[#EBE3D9] hover:bg-[#FAEEED]"
                            }`}
                        >
                          Spread {idx + 1} (Page {spread.page})
                        </button>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#EBE3D9] bg-[#FAF7F2] flex items-center justify-between">
              <div className="text-xs text-[#695B64]">
                <span>Full story contains </span>
                <strong className="text-[#2D222A]">{previewStory.page_count} illustrated pages</strong>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPreviewStory(null)}
                  className="px-4 py-2 rounded-full border border-[#EBE3D9] bg-white text-xs font-medium text-[#2D222A]"
                >
                  Close
                </button>
                <Link
                  to={`/personalize/${previewStory.slug}`}
                  className="px-5 py-2 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Personalize This Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

const CURATED_STORIES: StoryCatalogItem[] = [
  {
    id: "unicorn-story-curated",
    slug: "unicorn-story",
    title: "The Girl & the Magical Unicorn",
    category: "Fairy Tales",
    age_range: "3 - 8 Years",
    min_age: 3,
    max_age: 8,
    page_count: 26,
    price_digital: 19.99,
    price_print: 39.99,
    description: "In the whispered heart of Whispering Meadow, a kind-hearted child discovers an enchanted unicorn lost in the dawn mist. Together, they embark on a luminous quest of friendship.",
    cover_image_url: "/api/v1/assets/unicorn_cover.png",
    rating: 4.9,
    review_count: 148,
    tag: "Bestseller",
    is_live: true,
    sample_spreads: [
      {
        page: 3,
        title: "The Whispering Meadow",
        text: "The sun stretched golden fingers across the dew, and there, between silver birch trees, stood a creature of shimmering starlight.",
        scene: "A radiant unicorn greets your child beneath towering ancient trees filled with fireflies."
      },
      {
        page: 7,
        title: "The Bridge of Fallen Stars",
        text: "With a brave smile and a gentle hand on the unicorn's silver mane, they stepped onto the celestial rainbow bridge.",
        scene: "Walking across shimmering starlight arches above a misty valley of soft clouds."
      },
      {
        page: 14,
        title: "The Crystal Lantern",
        text: "The forest whispered secrets of old, and in your child's hand glowed the light of true kindness.",
        scene: "Surrounded by friendly woodland animals holding glowing glass acorns."
      }
    ]
  },
  {
    id: "starlight-dragon",
    slug: "starlight-dragon",
    title: "The Starlight Dragon",
    category: "Bedtime & Magic",
    age_range: "3 - 7 Years",
    min_age: 3,
    max_age: 7,
    page_count: 24,
    price_digital: 19.99,
    price_print: 39.99,
    description: "A gentle baby dragon with wings of midnight velvet collects fallen shooting stars to tuck sleepy dreamers into bed with warm starlight glow.",
    cover_image_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    review_count: 92,
    tag: "Staff Favorite",
    is_live: false,
    sample_spreads: [
      {
        page: 2,
        title: "Night Sky Whispers",
        text: "When the clock struck eight, a soft purple spark lit upon the nursery windowsill.",
        scene: "A tiny velvet dragon holding a celestial lantern peering softly through moonlit windows."
      },
      {
        page: 8,
        title: "Catching Falling Stars",
        text: "Together they caught seven fallen constellations and wove them into a cozy bedtime quilt.",
        scene: "Floating peacefully through a dreamy pastel night sky with smiling crescent moon."
      }
    ]
  },
  {
    id: "secret-treehouse",
    slug: "secret-treehouse",
    title: "The Secret Treehouse Society",
    category: "Courage & Kindness",
    age_range: "5 - 9 Years",
    min_age: 5,
    max_age: 9,
    page_count: 28,
    price_digital: 22.99,
    price_print: 44.99,
    description: "Hidden deep inside an ancient banyan tree is a sanctuary where curious creatures gather to solve whimsical mysteries and bake berry pies.",
    cover_image_url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    review_count: 67,
    tag: "New Release",
    is_live: false,
    sample_spreads: [
      {
        page: 4,
        title: "The Hidden Spiral Stairs",
        text: "Twisting around the mossy trunk, carved wooden steps led straight into the leafy canopy.",
        scene: "Your child discovering a glowing brass key nestled in a hollow tree trunk."
      }
    ]
  },
  {
    id: "ocean-voyager",
    slug: "ocean-voyager",
    title: "The Little Ocean Voyager",
    category: "Animal Adventures",
    age_range: "2 - 5 Years",
    min_age: 2,
    max_age: 5,
    page_count: 22,
    price_digital: 19.99,
    price_print: 38.99,
    description: "A playful adventure across coral reefs with a singing dolphin and an ancient sea turtle who guards the secret treasure of the glowing pearls.",
    cover_image_url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    review_count: 114,
    tag: "Popular",
    is_live: false,
    sample_spreads: [
      {
        page: 5,
        title: "Coral Symphony",
        text: "Under the turquoise waves, bubbles carried songs of kindness to playful seals.",
        scene: "Your child wearing a golden shell crown swimming alongside playful turquoise sea creatures."
      }
    ]
  },
  {
    id: "whispering-woods",
    slug: "whispering-woods",
    title: "The Knight of Whispering Woods",
    category: "Courage & Kindness",
    age_range: "6 - 10 Years",
    min_age: 6,
    max_age: 10,
    page_count: 30,
    price_digital: 24.99,
    price_print: 46.99,
    description: "Armed only with a wooden sword, a kind smile, and an empathetic heart, a young knight proves that true strength lies in understanding others.",
    cover_image_url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    review_count: 83,
    tag: "Character Builder",
    is_live: false,
    sample_spreads: [
      {
        page: 6,
        title: "The Great Mountain Path",
        text: "The path was steep, but courage does not mean being fearless — it means continuing with a caring heart.",
        scene: "Facing a gentle giant guardian who only wanted someone to listen to his ancient flute song."
      }
    ]
  },
  {
    id: "cloud-baker",
    slug: "cloud-baker",
    title: "The Baker of Sweet Cloud Dreams",
    category: "Wonder & Space",
    age_range: "2 - 6 Years",
    min_age: 2,
    max_age: 6,
    page_count: 24,
    price_digital: 19.99,
    price_print: 39.99,
    description: "High in the marshmallow clouds, your child kneads sunshine dough, sprinkles rainbow sugar, and bakes sweet lullaby dreams for children asleep below.",
    cover_image_url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    rating: 5.0,
    review_count: 53,
    tag: "Sweet Dreams",
    is_live: false,
    sample_spreads: [
      {
        page: 3,
        title: "The Cloud Kitchen",
        text: "Spoons made of moonlight and whisks of gentle breeze whipped up cotton candy clouds.",
        scene: "Wearing a chef hat, your child dusting sugar glitter over fluffy pink sunset clouds."
      }
    ]
  }
];

const CATEGORIES = [
  "All Stories",
  "Fairy Tales",
  "Bedtime & Magic",
  "Courage & Kindness",
  "Animal Adventures",
  "Wonder & Space"
];

const AGE_FILTERS = [
  { label: "All Ages", min: 0, max: 99 },
  { label: "2 - 4 Years", min: 2, max: 4 },
  { label: "4 - 6 Years", min: 4, max: 6 },
  { label: "6 - 8 Years", min: 6, max: 8 },
  { label: "8+ Years", min: 8, max: 99 }
];

export default function StoryBooksPage() {
  const [stories, setStories] = useState<StoryCatalogItem[]>(CURATED_STORIES);
  const [selectedCategory, setSelectedCategory] = useState("All Stories");
  const [selectedAge, setSelectedAge] = useState("All Ages");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewStory, setPreviewStory] = useState<StoryCatalogItem | null>(null);
  const [activeSpreadIndex, setActiveSpreadIndex] = useState(0);

  useEffect(() => {
    // Attempt to merge live stories from API if available
    api.getStories()
      .then((apiStories: StoryTemplate[]) => {
        if (apiStories && apiStories.length > 0) {
          setStories((prev) => {
            const liveSlugs = new Set(apiStories.map((s) => s.slug));
            const updated = prev.map((item) => {
              const matched = apiStories.find((s) => s.slug === item.slug);
              if (matched) {
                return {
                  ...item,
                  title: matched.title,
                  description: matched.description || item.description,
                  cover_image_url: matched.cover_image_url || item.cover_image_url,
                  page_count: matched.page_count || item.page_count,
                  price_digital: matched.price_digital || item.price_digital,
                  price_print: matched.price_print || item.price_print,
                  is_live: true
                };
              }
              return item;
            });
            return updated;
          });
        }
      })
      .catch((err) => console.log("Catalog using local templates:", err));
  }, []);

  const filteredStories = stories.filter((story) => {
    const matchesCat =
      selectedCategory === "All Stories" || story.category === selectedCategory;
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
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                    selectedAge === age.label
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
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  selectedCategory === cat
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

        {filteredStories.length === 0 ? (
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
                {/* Book Cover Container */}
                <div>
                  <div className="relative aspect-square overflow-hidden bg-[#FAF7F2]">
                    <img
                      src={story.cover_image_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80";
                      }}
                    />

                    {/* Ribbon Tag */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#EBE3D9] text-[11px] font-semibold text-[#2D222A] shadow-xs">
                      <Sparkles className="w-3 h-3 text-[#C98A84]" />
                      <span>{story.tag}</span>
                    </div>

                    {/* Age Range Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#2D222A]/85 backdrop-blur-md text-[11px] font-medium text-white shadow-xs">
                      {story.age_range}
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 bg-[#2D222A]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <button
                        onClick={() => {
                          setPreviewStory(story);
                          setActiveSpreadIndex(0);
                        }}
                        className="px-4 py-2.5 rounded-full bg-white text-[#2D222A] hover:bg-[#FAF7F2] text-xs font-medium shadow-md transition-transform transform translate-y-2 group-hover:translate-y-0 flex items-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#C98A84]" />
                        <span>Quick Look Inside</span>
                      </button>
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
                      <span>{story.page_count} Full-Bleed Pages • 210×210 mm Archival Hardcover</span>
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
                          ${story.price_digital}
                        </span>
                        <span className="text-[11px] text-[#695B64]">Digital</span>
                        <span className="text-[#C98A84] font-medium text-xs">•</span>
                        <span className="text-xs font-medium text-[#695B64]">
                          ${story.price_print} Print
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
              <div className="aspect-16/9 bg-[#FAEEED]/40 rounded-2xl border border-[#EBE3D9] p-8 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-xs font-medium text-[#2D222A] border border-[#EBE3D9]">
                  Spread {activeSpreadIndex + 1} of {previewStory.sample_spreads.length}
                </div>

                <div className="space-y-3 max-w-lg">
                  <span className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">
                    Page {previewStory.sample_spreads[activeSpreadIndex].page} Preview
                  </span>
                  <h4 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                    {previewStory.sample_spreads[activeSpreadIndex].title}
                  </h4>
                  <p className="font-story text-base sm:text-lg text-[#2D222A] italic leading-relaxed">
                    “{previewStory.sample_spreads[activeSpreadIndex].text}”
                  </p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-xl p-4 border border-[#EBE3D9] text-xs text-[#695B64]">
                  <strong className="text-[#2D222A] block mb-0.5">Scene Illustration Note:</strong>
                  {previewStory.sample_spreads[activeSpreadIndex].scene}
                </div>
              </div>

              {/* Spread selector tabs */}
              <div className="flex gap-2">
                {previewStory.sample_spreads.map((spread, idx) => (
                  <button
                    key={spread.page}
                    onClick={() => setActiveSpreadIndex(idx)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      activeSpreadIndex === idx
                        ? "bg-[#C98A84] text-white border-[#C98A84]"
                        : "bg-[#FAF7F2] text-[#695B64] border-[#EBE3D9] hover:bg-[#FAEEED]"
                    }`}
                  >
                    Spread {idx + 1} (Page {spread.page})
                  </button>
                ))}
              </div>
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

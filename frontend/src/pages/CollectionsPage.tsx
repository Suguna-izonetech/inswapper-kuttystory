import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Gift,
  ArrowRight,
  Package,
  Layers,
  Heart,
  Star,
  CheckCircle2,
  ShieldCheck,
  Check
} from "lucide-react";

interface CollectionItem {
  id: string;
  name: string;
  tagline: string;
  category: string;
  colorBg: string;
  colorBorder: string;
  accentColor: string;
  badge: string;
  description: string;
  boxFeatures: string[];
  stories: {
    title: string;
    slug: string;
    genre: string;
    pages: number;
  }[];
  bundlePrice: number;
  regularPrice: number;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: "enchanted-realm",
    name: "The Enchanted Realm Collection",
    tagline: "Unicorns, friendly dragons, and starlight adventures",
    category: "Fantasy & Wonder",
    colorBg: "bg-gradient-to-br from-[#FAEEED] to-[#F2EEF7]",
    colorBorder: "border-[#C98A84]/40",
    accentColor: "text-[#C98A84]",
    badge: "Most Cherished",
    description: "Transport your child into a mythical universe where gentle woodland creatures and celestial guardians teach the power of courage, compassion, and wonder.",
    boxFeatures: [
      "Custom foil-stamped heirloom gift presentation box",
      "Satin ribbon bookmark sewn into spine",
      "Includes 2 hardcover volumes personalized for your child",
      "Bonus 8×8 inch archival art print of your child's character"
    ],
    stories: [
      {
        title: "The Girl & the Magical Unicorn",
        slug: "unicorn-story",
        genre: "Fairy Tale",
        pages: 26
      },
      {
        title: "The Starlight Dragon",
        slug: "starlight-dragon",
        genre: "Bedtime Wonder",
        pages: 24
      }
    ],
    bundlePrice: 1999,
    regularPrice: 2798
  },
  {
    id: "little-explorer",
    name: "Little Explorer & Ocean Discovery",
    tagline: "Coral reefs, deep sea melodies, and brave journeys",
    category: "Adventure & Nature",
    colorBg: "bg-gradient-to-br from-[#EEF4ED] to-[#FAF7F2]",
    colorBorder: "border-[#8F9E8B]/40",
    accentColor: "text-[#8F9E8B]",
    badge: "Nature & STEM",
    description: "Designed for curious toddlers and young explorers eager to dive beneath turquoise waves and discover the interconnected beauty of wildlife and nature.",
    boxFeatures: [
      "Eco-friendly linen presentation box with sea turtle motif",
      "Interactive fold-out underwater treasure map with child's name",
      "2 Hardcovers printed on 170gsm heavyweight matte paper",
      "FSC-certified vegetable-based non-toxic inks"
    ],
    stories: [
      {
        title: "The Little Ocean Voyager",
        slug: "ocean-voyager",
        genre: "Ocean Adventure",
        pages: 22
      },
      {
        title: "The Secret Treehouse Society",
        slug: "secret-treehouse",
        genre: "Forest Mystery",
        pages: 28
      }
    ],
    bundlePrice: 1999,
    regularPrice: 2798
  },
  {
    id: "bedtime-lullaby",
    name: "Bedtime Serenades & Sweet Dreams",
    tagline: "Soothing nighttime rituals for peaceful slumber",
    category: "Bedtime & Calming",
    colorBg: "bg-gradient-to-br from-[#F2EEF7] to-[#FAEEED]",
    colorBorder: "border-[#B8A9C9]/40",
    accentColor: "text-[#B8A9C9]",
    badge: "Sleep Routine",
    description: "Specially authored in rhythmic, cadence-tested prose that calms evening hyperactivity and helps young children drift peacefully off to sleep.",
    boxFeatures: [
      "Midnight velvet slipcase with gold foil constellation embossing",
      "Glow-in-the-dark commemorative star sticker sheet",
      "Parent audio bedtime read-along QR code",
      "2 Hardcovers with soft-touch matte protective finish"
    ],
    stories: [
      {
        title: "The Baker of Sweet Cloud Dreams",
        slug: "cloud-baker",
        genre: "Calming Bedtime",
        pages: 24
      },
      {
        title: "The Starlight Dragon",
        slug: "starlight-dragon",
        genre: "Night Sky Wonder",
        pages: 24
      }
    ],
    bundlePrice: 1999,
    regularPrice: 2798
  },
  {
    id: "sibling-duet",
    name: "Sibling & Duo Adventure Editions",
    tagline: "Two children starred together on every single page",
    category: "Family & Siblings",
    colorBg: "bg-gradient-to-br from-[#FAF5E8] to-[#FAEEED]",
    colorBorder: "border-[#C5A059]/40",
    accentColor: "text-[#C5A059]",
    badge: "Double The Love",
    description: "Celebrate the unbreakable bond between brothers, sisters, cousins, or best friends. Both children are illustrated together as co-heroes of their shared quest.",
    boxFeatures: [
      "Twin hardcover volumes with interlocking cover art",
      "Shared dedication page signed by parents or grandparents",
      "Deluxe gift box with dual satin ribbons",
      "Both children's facial likenesses rendered consistently"
    ],
    stories: [
      {
        title: "The Secret Treehouse Society (Duo Edition)",
        slug: "secret-treehouse",
        genre: "Teamwork & Empathy",
        pages: 28
      },
      {
        title: "The Knight of Whispering Woods (Duo Edition)",
        slug: "whispering-woods",
        genre: "Brotherhood & Courage",
        pages: 30
      }
    ],
    bundlePrice: 2299,
    regularPrice: 2998
  }
];

export default function CollectionsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredCollections =
    selectedFilter === "All"
      ? COLLECTIONS
      : COLLECTIONS.filter((c) => c.category.includes(selectedFilter));

  return (
    <div className="pb-24">
      {/* 1. Header */}
      <section className="bg-gradient-to-b from-[#FAEEED]/40 via-[#FAF7F2] to-[#FAF7F2] pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-semibold text-[#C98A84] shadow-xs">
            <Gift className="w-3.5 h-3.5" />
            <span>Curated Heirloom Sets & Bundles</span>
          </div>

          <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight">
            Curated Story <span className="italic font-normal text-[#C98A84]">Collections</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            Discover our themed box sets and multi-book heirloom bundles. Packaged in archival presentation boxes with gold foil embossing, made to be given as unforgettable milestone gifts.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {["All", "Fantasy", "Adventure", "Bedtime", "Family"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedFilter === filter
                    ? "bg-[#2D222A] text-white shadow-xs"
                    : "bg-white border border-[#EBE3D9] text-[#695B64] hover:bg-[#FAF7F2]"
                }`}
              >
                {filter === "All" ? "All Collections" : `${filter} Series`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Collection Cards Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredCollections.map((col) => (
            <div
              key={col.id}
              className={`rounded-3xl p-6 sm:p-8 border ${col.colorBorder} bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6`}
            >
              <div className="space-y-4">
                {/* Header Strip */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FAF7F2] text-[#2D222A] border border-[#EBE3D9]">
                    {col.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#FAEEED] text-[#C98A84]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{col.badge}</span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div>
                  <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
                    {col.name}
                  </h3>
                  <p className="text-xs font-medium text-[#C98A84] mt-1">
                    {col.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                  {col.description}
                </p>

                {/* Box Set Included Stories */}
                <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE3D9] space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D222A] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C98A84]" />
                    <span>Included Storybooks in this Box Set:</span>
                  </div>
                  <div className="space-y-2">
                    {col.stories.map((story) => (
                      <div
                        key={story.title}
                        className="bg-white p-3 rounded-xl border border-[#EBE3D9] flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-[#2D222A] block">{story.title}</strong>
                          <span className="text-[11px] text-[#695B64]">
                            {story.genre} • {story.pages} Pages
                          </span>
                        </div>
                        <Link
                          to={`/personalize/${story.slug}`}
                          className="text-[#C98A84] hover:text-[#B87A74] font-medium flex items-center gap-1 text-[11px]"
                        >
                          <span>Preview</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Presentation Box Highlights */}
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D222A]">
                    Presentation Box Features:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#4E424B]">
                    {col.boxFeatures.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#8F9E8B] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="pt-4 border-t border-[#EBE3D9] flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[#695B64]">
                    Box Set Bundle Value
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                      ₹{col.bundlePrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-[#695B64] line-through">
                      ₹{col.regularPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[11px] font-bold text-[#4E7048] bg-[#EEF4ED] px-2 py-0.5 rounded-full">
                      Save ₹{(col.regularPrice - col.bundlePrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/personalize/${col.stories[0].slug}`}
                  className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
                >
                  <span>Personalize Set</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The Gift Atelier Experience */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
              Gift Presentation Box
            </span>
            <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
              Unwrapping an Unforgettable Memory
            </h3>
            <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
              Every KuttyStory Collection Box is hand-assembled in our atelier. Rigid keepsake presentation boxes lined with acid-free tissue paper, closed with double-faced French satin ribbon, and stamped with our signature gold seal.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#2D222A]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B]" />
                <span>Complimentary Hand-Written Gift Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B]" />
                <span>No pricing invoices included inside box</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B]" />
                <span>Global direct shipping to recipient</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-[#EBE3D9] text-center space-y-3">
            <Package className="w-12 h-12 text-[#C98A84] mx-auto" />
            <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              Sending Directly as a Gift?
            </h4>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Enter the recipient's delivery address at checkout. We’ll package it in our signature gift box with your personalized greeting printed on fine cotton cardstock.
            </p>
            <Link
              to="/storybooks"
              className="inline-block mt-2 px-5 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FAEEED] text-xs font-semibold text-[#C98A84] border border-[#EBE3D9]"
            >
              Browse All Books
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

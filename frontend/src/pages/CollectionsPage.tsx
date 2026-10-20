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
  Check,
  Eye,
  X,
  Compass,
  Moon,
  Users,
  Award,
  Crown,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Bookmark
} from "lucide-react";
import { HardcoverBook } from "@/components/HardcoverBook";

export interface HardcoverVolume {
  title: string;
  slug: string;
  genre: string;
  pages: number;
  age: string;
  coverUrl: string;
  fallbackUrl?: string;
  tagline: string;
  description: string;
  sampleSpreads: {
    page: number;
    title: string;
    text: string;
    scene: string;
  }[];
}

export interface CollectionSet {
  id: string;
  name: string;
  tagline: string;
  category: string;
  badge: string;
  colorBorder: string;
  accentColor: string;
  bgGradient: string;
  rating: number;
  reviewCount: number;
  description: string;
  boxFeatures: string[];
  stories: HardcoverVolume[];
  bundlePrice: number;
  regularPrice: number;
  boxImage: string;
}

const HARDCOVER_COLLECTIONS: CollectionSet[] = [
  {
    id: "enchanted-realm",
    name: "The Enchanted Realm Heirloom Duo",
    tagline: "Unicorns, friendly dragons, and starlight adventures",
    category: "Fantasy & Wonder",
    badge: "Atelier Bestseller",
    colorBorder: "border-[#C98A84]/40 hover:border-[#C98A84]",
    accentColor: "text-[#C98A84]",
    bgGradient: "from-[#FAEEED]/60 via-[#FFFFFF] to-[#FAF7F2]",
    rating: 4.98,
    reviewCount: 246,
    description: "Transport your child into a mythical universe where gentle woodland creatures and celestial guardians teach the power of courage, compassion, and wonder.",
    boxImage: "/covers/heirloom_box.jpg",
    boxFeatures: [
      "2 Deluxe Hardcover volumes with custom gold foil spine crests",
      "Traditional Smyth-sewn 180° lay-flat binding that never cracks",
      "Rigid linen presentation gift box with gold atelier hot-stamping",
      "Dual golden satin ribbon bookmarks hand-sewn into spines",
      "Bonus 8×8\" archival cotton art print with your dedication"
    ],
    stories: [
      {
        title: "The Girl & the Magical Unicorn",
        slug: "unicorn-story",
        genre: "Enchanted Fairy Tale",
        pages: 26,
        age: "3 - 8 Years",
        coverUrl: "/unicorn_cover.png",
        fallbackUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        tagline: "A luminous quest through Whispering Meadow with a gentle creature of starlight.",
        description: "In the whispered heart of Whispering Meadow, your child discovers an enchanted unicorn lost in the dawn mist. Together, they embark on a journey teaching empathy and inner light.",
        sampleSpreads: [
          {
            page: 3,
            title: "The Whispering Meadow",
            text: "The sun stretched golden fingers across the morning dew, and there, between silver birch trees, stood a creature of shimmering starlight.",
            scene: "A radiant unicorn greets your child beneath ancient trees filled with friendly fireflies."
          },
          {
            page: 7,
            title: "The Bridge of Fallen Stars",
            text: "With a brave smile and a gentle hand on the unicorn's silver mane, they stepped onto the celestial rainbow bridge.",
            scene: "Walking across shimmering starlight arches above a misty valley of soft clouds."
          }
        ]
      },
      {
        title: "The Starlight Dragon",
        slug: "starlight-dragon",
        genre: "Bedtime Wonder",
        pages: 24,
        age: "3 - 7 Years",
        coverUrl: "/covers/starlight_dragon.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        tagline: "A gentle baby dragon collecting fallen stars to tuck sleepy dreamers into bed.",
        description: "A friendly baby dragon with velvet wings collects fallen constellations to tuck young dreamers into bed with a cozy golden nightlight.",
        sampleSpreads: [
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
            scene: "Floating peacefully through a dreamy pastel night sky with a smiling crescent moon."
          }
        ]
      }
    ],
    bundlePrice: 1999,
    regularPrice: 2798
  },
  {
    id: "little-explorer",
    name: "The Marine & Forest Explorers Set",
    tagline: "Coral reefs, deep sea melodies, and brave treehouse journeys",
    category: "Adventure & STEM",
    badge: "Explorer's Choice",
    colorBorder: "border-[#8F9E8B]/40 hover:border-[#8F9E8B]",
    accentColor: "text-[#8F9E8B]",
    bgGradient: "from-[#EEF4ED]/60 via-[#FFFFFF] to-[#FAF7F2]",
    rating: 4.95,
    reviewCount: 184,
    description: "Designed for curious toddlers and young explorers eager to dive beneath turquoise waves and discover the interconnected beauty of wildlife, nature, and friendship.",
    boxImage: "/covers/heirloom_box.jpg",
    boxFeatures: [
      "2 Deluxe Hardcovers printed on 170gsm heavyweight matte paper",
      "Eco-friendly natural linen presentation box with sea & flora crest",
      "Interactive fold-out treasure map personalized with child's name",
      "FSC-certified vegetable-based non-toxic archival inks",
      "Smyth-sewn 180° lay-flat pages ideal for curious toddler hands"
    ],
    stories: [
      {
        title: "The Little Ocean Voyager",
        slug: "ocean-voyager",
        genre: "Ocean Adventure",
        pages: 22,
        age: "2 - 6 Years",
        coverUrl: "/covers/ocean_voyager.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        tagline: "Glide beneath turquoise waves with playful dolphins and glowing coral reefs.",
        description: "A joyful underwater quest with a singing dolphin and an ancient sea turtle guarding the secret treasure of luminous ocean pearls.",
        sampleSpreads: [
          {
            page: 5,
            title: "Coral Symphony",
            text: "Under the turquoise waves, playful bubbles carried songs of kindness to gentle seals.",
            scene: "Your child wearing a golden shell crown swimming alongside glowing sea creatures."
          }
        ]
      },
      {
        title: "The Secret Treehouse Society",
        slug: "secret-treehouse",
        genre: "Forest Mystery",
        pages: 28,
        age: "4 - 9 Years",
        coverUrl: "/covers/treehouse_society.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
        tagline: "Climb into an enchanted leafy sanctuary where woodland friends solve riddles.",
        description: "Hidden deep inside an ancient banyan tree is a cozy sanctuary where curious creatures gather to solve whimsical mysteries and bake berry pies.",
        sampleSpreads: [
          {
            page: 4,
            title: "The Hidden Spiral Stairs",
            text: "Twisting around the mossy trunk, carved wooden steps led straight into the leafy canopy.",
            scene: "Your child discovering a glowing brass key nestled in a hollow tree trunk."
          }
        ]
      }
    ],
    bundlePrice: 1999,
    regularPrice: 2798
  },
  {
    id: "bedtime-lullaby",
    name: "Slumber & Starlight Bedtime Trunk",
    tagline: "Cadence-tested prose for gentle evening sleep rituals",
    category: "Bedtime & Calming",
    badge: "Sleep Routine Hero",
    colorBorder: "border-[#B8A9C9]/40 hover:border-[#B8A9C9]",
    accentColor: "text-[#B8A9C9]",
    bgGradient: "from-[#F2EEF7]/60 via-[#FFFFFF] to-[#FAF7F2]",
    rating: 5.0,
    reviewCount: 212,
    description: "Specially authored in rhythmic, cadence-tested prose that calms evening hyperactivity and helps young children drift peacefully off to sleep.",
    boxImage: "/covers/heirloom_box.jpg",
    boxFeatures: [
      "2 Hardcovers with velvet-touch scuff-resistant matte lamination",
      "Midnight twilight presentation slipcase with gold foil constellation embossing",
      "Glow-in-the-dark commemorative star sticker sheet",
      "Bedtime audio read-along QR code with soothing ambient music",
      "Personalized goodnight dedication letter printed on cotton cardstock"
    ],
    stories: [
      {
        title: "The Baker of Sweet Cloud Dreams",
        slug: "cloud-baker",
        genre: "Calming Bedtime",
        pages: 24,
        age: "2 - 6 Years",
        coverUrl: "/covers/cloud_baker.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        tagline: "Knead warm sunshine dough and bake sweet lullaby dreams high in the clouds.",
        description: "High in marshmallow clouds, your child kneads sunshine dough, sprinkles rainbow sugar, and bakes sweet lullaby dreams for children asleep below.",
        sampleSpreads: [
          {
            page: 3,
            title: "The Cloud Kitchen",
            text: "Spoons made of moonlight and whisks of gentle breeze whipped up cotton candy clouds.",
            scene: "Wearing a chef hat, your child dusting sugar glitter over fluffy sunset clouds."
          }
        ]
      },
      {
        title: "The Starlight Dragon",
        slug: "starlight-dragon",
        genre: "Night Sky Wonder",
        pages: 24,
        age: "3 - 7 Years",
        coverUrl: "/covers/starlight_dragon.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        tagline: "Catching falling constellations to tuck little dreamers into sweet slumber.",
        description: "A gentle baby dragon with velvet wings collects fallen constellations to tuck young dreamers into bed with a cozy golden nightlight.",
        sampleSpreads: [
          {
            page: 8,
            title: "Catching Falling Stars",
            text: "Together they caught seven fallen constellations and wove them into a cozy bedtime quilt.",
            scene: "Floating peacefully through a dreamy pastel night sky with a smiling crescent moon."
          }
        ]
      }
    ],
    bundlePrice: 1999,
    regularPrice: 2798
  },
  {
    id: "sibling-duet",
    name: "The Sibling & Duo Hero Chronicles",
    tagline: "Two children starred together side-by-side on every single page",
    category: "Family & Siblings",
    badge: "Two Children Starred",
    colorBorder: "border-[#C5A059]/40 hover:border-[#C5A059]",
    accentColor: "text-[#C5A059]",
    bgGradient: "from-[#FAF5E8]/60 via-[#FFFFFF] to-[#FAF7F2]",
    rating: 4.96,
    reviewCount: 168,
    description: "Celebrate the unbreakable bond between brothers, sisters, cousins, or best friends. Both children are illustrated together as co-heroes of their shared quest.",
    boxImage: "/covers/heirloom_box.jpg",
    boxFeatures: [
      "Twin hardcover volumes with interlocking cover artwork and spine design",
      "Shared family dedication page signed by parents or grandparents",
      "Deluxe gift presentation box with dual satin pull ribbons",
      "Both children's facial likenesses rendered consistently across all spreads",
      "170gsm archival silk matte paper bound with cotton Smyth threading"
    ],
    stories: [
      {
        title: "The Secret Treehouse (Duo Edition)",
        slug: "secret-treehouse",
        genre: "Teamwork & Empathy",
        pages: 28,
        age: "4 - 10 Years",
        coverUrl: "/covers/treehouse_society.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
        tagline: "Two intrepid young adventurers unite to solve whimsical forest mysteries.",
        description: "Two siblings or best friends stumble upon the secret leafy treetop sanctuary, where each child's unique talents help uncover the ancient forest treasure.",
        sampleSpreads: [
          {
            page: 6,
            title: "The Lantern Workshop",
            text: "With one child decoding the ancient parchment and the other guiding the lantern, no riddle stayed unsolved.",
            scene: "Two children working hand-in-hand under glowing lantern-lit boughs."
          }
        ]
      },
      {
        title: "The Knight of Whispering Woods (Duo Edition)",
        slug: "whispering-woods",
        genre: "Brotherhood & Courage",
        pages: 30,
        age: "5 - 10 Years",
        coverUrl: "/covers/knight_woods.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        tagline: "Armed with kind smiles and empathetic hearts, two knights conquer every trial.",
        description: "Armed with gentle wooden swords and compassionate hearts, two young knights prove that true strength lies in standing by one another.",
        sampleSpreads: [
          {
            page: 6,
            title: "The Great Mountain Path",
            text: "The path was steep, but side by side they walked through the emerald mist without fear.",
            scene: "Two children in knight capes greeted by magical glowing woodland creatures."
          }
        ]
      }
    ],
    bundlePrice: 2299,
    regularPrice: 2998
  },
  {
    id: "grand-atelier-trilogy",
    name: "The Grand Atelier Master Trilogy",
    tagline: "The ultimate 3-volume personalized library heirloom collection",
    category: "Master Trilogy",
    badge: "Limited Edition Collector's Box",
    colorBorder: "border-[#C5A059]/60 hover:border-[#C5A059]",
    accentColor: "text-[#C5A059]",
    bgGradient: "from-[#FAF5E8]/80 via-[#FAEEED]/40 to-[#FAF7F2]",
    rating: 5.0,
    reviewCount: 94,
    description: "Our crowning achievement. Three full-length personalized hardcover volumes covering fairy tales, oceanic discovery, and heroic empathy, encased in a hand-crafted linen library slipcase.",
    boxImage: "/covers/heirloom_box.jpg",
    boxFeatures: [
      "3 Full-length personalized hardcovers with sequential gold spine crests",
      "Bespoke rigid presentation box with gold foil KuttyStory Atelier crest",
      "3 Hand-dyed silk ribbon bookmarks (Champagne Gold, Atelier Rose, Forest Sage)",
      "Includes 3 hand-numbered archival collector art prints & atelier wax seal",
      "Traditional Smyth-sewn lay-flat binding with 170gsm heavyweight paper"
    ],
    stories: [
      {
        title: "The Girl & the Magical Unicorn",
        slug: "unicorn-story",
        genre: "Enchanted Fairy Tale",
        pages: 26,
        age: "3 - 8 Years",
        coverUrl: "/unicorn_cover.png",
        fallbackUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        tagline: "A luminous quest through Whispering Meadow with a gentle creature of starlight.",
        description: "In the whispered heart of Whispering Meadow, your child discovers an enchanted unicorn lost in the dawn mist.",
        sampleSpreads: [
          {
            page: 3,
            title: "The Whispering Meadow",
            text: "The sun stretched golden fingers across the morning dew, and there stood a creature of shimmering starlight.",
            scene: "A radiant unicorn greets your child beneath ancient birch trees."
          }
        ]
      },
      {
        title: "The Little Ocean Voyager",
        slug: "ocean-voyager",
        genre: "Ocean Adventure",
        pages: 22,
        age: "2 - 6 Years",
        coverUrl: "/covers/ocean_voyager.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
        tagline: "Glide beneath turquoise waves with playful dolphins and glowing coral reefs.",
        description: "A joyful underwater quest with a singing dolphin and an ancient sea turtle guarding the secret treasure of ocean pearls.",
        sampleSpreads: [
          {
            page: 5,
            title: "Coral Symphony",
            text: "Under the turquoise waves, playful bubbles carried songs of kindness to gentle seals.",
            scene: "Swimming alongside playful turquoise dolphins and glowing sea turtles."
          }
        ]
      },
      {
        title: "The Knight of Whispering Woods",
        slug: "whispering-woods",
        genre: "Courage & Kindness",
        pages: 30,
        age: "5 - 10 Years",
        coverUrl: "/covers/knight_woods.jpg",
        fallbackUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        tagline: "Armed with kind smiles and empathetic hearts, proving strength lies in understanding.",
        description: "Armed with gentle wooden swords and compassionate hearts, a young knight proves that true strength lies in understanding others.",
        sampleSpreads: [
          {
            page: 6,
            title: "The Great Mountain Path",
            text: "The path was steep, but courage does not mean being fearless — it means continuing with a caring heart.",
            scene: "Facing a gentle giant guardian who only wanted someone to listen to his ancient flute song."
          }
        ]
      }
    ],
    bundlePrice: 2899,
    regularPrice: 4197
  }
];

// All individual hardcovers for the interactive bookshelf showcase
const ALL_HARDCOVER_BOOKS: HardcoverVolume[] = [
  {
    title: "The Girl & the Magical Unicorn",
    slug: "unicorn-story",
    genre: "Enchanted Fairy Tale",
    pages: 26,
    age: "3 - 8 Years",
    coverUrl: "/unicorn_cover.png",
    tagline: "A luminous quest through Whispering Meadow with a gentle unicorn.",
    description: "In the whispered heart of Whispering Meadow, your child discovers an enchanted unicorn lost in the dawn mist.",
    sampleSpreads: [
      {
        page: 3,
        title: "The Whispering Meadow",
        text: "The sun stretched golden fingers across the dew, and there stood a creature of shimmering starlight.",
        scene: "A radiant unicorn greets your child beneath ancient trees filled with fireflies."
      }
    ]
  },
  {
    title: "The Starlight Dragon",
    slug: "starlight-dragon",
    genre: "Bedtime & Magic",
    pages: 24,
    age: "3 - 7 Years",
    coverUrl: "/covers/starlight_dragon.jpg",
    tagline: "Catching fallen constellations to tuck little dreamers into slumber.",
    description: "A gentle baby dragon with wings of midnight velvet collects fallen shooting stars to tuck sleepy dreamers into bed.",
    sampleSpreads: [
      {
        page: 2,
        title: "Night Sky Whispers",
        text: "When the clock struck eight, a soft purple spark lit upon the nursery windowsill.",
        scene: "A tiny velvet dragon holding a celestial lantern peering softly through moonlit windows."
      }
    ]
  },
  {
    title: "The Little Ocean Voyager",
    slug: "ocean-voyager",
    genre: "Ocean Adventure",
    pages: 22,
    age: "2 - 6 Years",
    coverUrl: "/covers/ocean_voyager.jpg",
    tagline: "Dive beneath turquoise waves with singing dolphins and coral reefs.",
    description: "A playful adventure across coral reefs with a singing dolphin and an ancient sea turtle guarding glowing pearls.",
    sampleSpreads: [
      {
        page: 5,
        title: "Coral Symphony",
        text: "Under the turquoise waves, bubbles carried songs of kindness to playful seals.",
        scene: "Your child wearing a golden shell crown swimming alongside playful turquoise sea creatures."
      }
    ]
  },
  {
    title: "The Secret Treehouse Society",
    slug: "secret-treehouse",
    genre: "Forest Mystery",
    pages: 28,
    age: "4 - 9 Years",
    coverUrl: "/covers/treehouse_society.jpg",
    tagline: "A cozy treetop sanctuary where woodland friends solve riddles.",
    description: "Hidden deep inside an ancient banyan tree is a cozy sanctuary where curious creatures gather to solve whimsical mysteries.",
    sampleSpreads: [
      {
        page: 4,
        title: "The Hidden Spiral Stairs",
        text: "Twisting around the mossy trunk, carved wooden steps led straight into the leafy canopy.",
        scene: "Your child discovering a glowing brass key nestled in a hollow tree trunk."
      }
    ]
  },
  {
    title: "The Knight of Whispering Woods",
    slug: "whispering-woods",
    genre: "Courage & Kindness",
    pages: 30,
    age: "5 - 10 Years",
    coverUrl: "/covers/knight_woods.jpg",
    tagline: "Armed with an empathetic heart, proving kindness is true courage.",
    description: "Armed with a gentle wooden sword and compassionate heart, a young knight proves that true strength lies in understanding others.",
    sampleSpreads: [
      {
        page: 6,
        title: "The Great Mountain Path",
        text: "The path was steep, but courage does not mean being fearless — it means continuing with a caring heart.",
        scene: "Facing a gentle giant guardian who only wanted someone to listen to his ancient flute song."
      }
    ]
  },
  {
    title: "The Baker of Sweet Cloud Dreams",
    slug: "cloud-baker",
    genre: "Calming Bedtime",
    pages: 24,
    age: "2 - 6 Years",
    coverUrl: "/covers/cloud_baker.jpg",
    tagline: "Knead sunshine dough and bake sweet lullaby dreams high in the clouds.",
    description: "High in marshmallow clouds, your child kneads sunshine dough, sprinkles rainbow sugar, and bakes sweet lullaby dreams.",
    sampleSpreads: [
      {
        page: 3,
        title: "The Cloud Kitchen",
        text: "Spoons made of moonlight and whisks of gentle breeze whipped up cotton candy clouds.",
        scene: "Dusting sugar glitter over fluffy pink sunset clouds."
      }
    ]
  }
];

export default function CollectionsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  // Per-collection active volume index for interactive book switcher on the card
  const [activeVolumeIdx, setActiveVolumeIdx] = useState<Record<string, number>>({});
  // Per-collection view mode: "books" (3D hardcover stage) vs "box" (archival box presentation)
  const [collectionViews, setCollectionViews] = useState<Record<string, "books" | "box">>({});
  // Craftsmanship interactive tab
  const [activeCraftTab, setActiveCraftTab] = useState(0);
  // Modal for inspecting a hardcover in deep detail
  const [inspectVolume, setInspectVolume] = useState<HardcoverVolume | null>(null);
  const [inspectSpreadIdx, setInspectSpreadIdx] = useState(0);

  const filteredCollections =
    selectedFilter === "All"
      ? HARDCOVER_COLLECTIONS
      : HARDCOVER_COLLECTIONS.filter(
        (c) =>
          c.category.toLowerCase().includes(selectedFilter.toLowerCase()) ||
          c.name.toLowerCase().includes(selectedFilter.toLowerCase())
      );

  const getActiveVolumeForCollection = (collection: CollectionSet): HardcoverVolume => {
    const idx = activeVolumeIdx[collection.id] ?? 0;
    return collection.stories[idx] || collection.stories[0];
  };

  const getCollectionViewMode = (colId: string): "books" | "box" => {
    return collectionViews[colId] || "books";
  };

  const toggleCollectionView = (colId: string, mode: "books" | "box") => {
    setCollectionViews((prev) => ({ ...prev, [colId]: mode }));
  };

  const setVolumeForCollection = (colId: string, index: number) => {
    setActiveVolumeIdx((prev) => ({ ...prev, [colId]: index }));
  };

  const craftsmanshipPillars = [
    {
      title: "180° Smyth-Sewn Lay-Flat Binding",
      shortTitle: "Smyth-Sewn Binding",
      tag: "Never Cracks or Tears",
      icon: Layers,
      accent: "text-[#C98A84] bg-[#FAEEED]",
      description:
        "Unlike cheap mass-market glued books that crack down the spine, our physical hardcovers are sewn in 8-page signatures using high-tensile archival cotton thread. The book opens completely flat 180° across your lap so two-page panoramic illustrations flow across without disappearing into the gutter.",
      specList: [
        "Traditional hand-stitched signature binding",
        "Zero gutter loss on panoramic two-page spreads",
        "Rigid 2.5mm European wrapped hardcover casing",
        "Reinforced cloth headbands on top and bottom of spine"
      ]
    },
    {
      title: "170gsm Archival Silk-Coated Matte Paper",
      shortTitle: "Archival Silk Paper",
      tag: "Heirloom 100-Year Life",
      icon: BookOpen,
      accent: "text-[#8F9E8B] bg-[#EEF4ED]",
      description:
        "Printed on heavyweight 170gsm museum-grade silk paper that feels substantial and velvety in little hands. Acid-free and lignin-free, it is certified to resist fading or yellowing for over a century. Smooth velvet touch prevents toddler fingerprint glare.",
      specList: [
        "170 GSM heavyweight archival paper density",
        "FSC-certified sustainable forest wood pulp",
        "Non-toxic vegetable-based rich inks (safe for toddlers)",
        "Zero show-through / bleed under bright reading lights"
      ]
    },
    {
      title: "Hot Gold-Foil Embossed Custom Spines",
      shortTitle: "Gold Foil Embossing",
      tag: "Gleaming Custom Lettering",
      icon: Sparkles,
      accent: "text-[#C5A059] bg-[#FAF5E8]",
      description:
        "Your child's name, starry constellations, and our atelier seal are hot-pressed into the spine and front casing with genuine metallic gold foil using traditional heated brass dies. It glints softly under evening nursery light with timeless heirloom grandeur.",
      specList: [
        "Child's full name hot-stamped in metallic gold on spine",
        "Atelier celestial crest stamped on front & spine",
        "Debossed French joint hinge groove along front board",
        "Silk-matte lamination that highlights foil contrast"
      ]
    },
    {
      title: "Archival Linen Presentation Box & Ribbon",
      shortTitle: "Archival Gift Box",
      tag: "Signature Atelier Unboxing",
      icon: Gift,
      accent: "text-[#B8A9C9] bg-[#F2EEF7]",
      description:
        "Each multi-book collection arrives nestled in an archival 1200gsm rigid presentation box with hidden magnetic clasp. Wrapped in fine cotton linen, lined with acid-free tissue paper, and closed with double-faced French satin ribbon.",
      specList: [
        "1200 GSM rigid keepsake box with magnetic catch",
        "French double-faced satin ribbon pull tab",
        "Archival cotton parchment bedding & gold seal",
        "Personalized letterpress dedication card included"
      ]
    }
  ];

  return (
    <div className="pb-28 overflow-x-hidden">
      {/* ──────────────────────────────────────────────────────────
          1. Hero Section: Editorial Atelier Hardcover Collections
          ────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-[#FAEEED]/50 via-[#FAF7F2] to-[#FAF7F2] pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9] overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[340px] bg-gradient-to-r from-[#FAEEED]/70 via-[#FAF5E8]/60 to-[#F2EEF7]/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-12 right-[10%] w-64 h-64 bg-[#C98A84]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#C98A84]/30 text-xs font-semibold text-[#C98A84] shadow-xs backdrop-blur-md">
            <Gift className="w-3.5 h-3.5 text-[#C98A84]" />
            <span className="tracking-wide uppercase text-[11px]">Bespoke Hardcopy Collections & Heirloom Sets</span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight">
              Masterpiece Hardcopy <span className="italic font-normal text-[#C98A84]">Collections</span>
            </h1>
            <p className="font-editorial-serif italic text-base sm:text-lg text-[#C5A059] font-medium">
              ✦ Traditional Smyth-Sewn Hardcovers • Gold Foil Stamped • Archival Gift Boxes ✦
            </p>
          </div>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            Discover our curated multi-volume hardcopy book sets. Handcrafted in our editorial atelier, each set pairs 2 to 3 personalized hardcover volumes in an archival linen presentation box, made to be cherished through generations.
          </p>

          {/* Key Craftsmanship Specs Banner */}
          <div className="pt-2 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            <div className="p-3 bg-white/80 rounded-2xl border border-[#EBE3D9] backdrop-blur-xs flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#FAEEED] flex items-center justify-center shrink-0 text-[#C98A84]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#2D222A] leading-tight">180° Lay-Flat</div>
                <div className="text-[10px] text-[#695B64]">Smyth-Sewn Binding</div>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-[#EBE3D9] backdrop-blur-xs flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#FAF5E8] flex items-center justify-center shrink-0 text-[#C5A059]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#2D222A] leading-tight">Gold Foil Spine</div>
                <div className="text-[10px] text-[#695B64]">Hot-Stamped Lettering</div>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-[#EBE3D9] backdrop-blur-xs flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#EEF4ED] flex items-center justify-center shrink-0 text-[#8F9E8B]">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#2D222A] leading-tight">170gsm Silk Paper</div>
                <div className="text-[10px] text-[#695B64]">Museum Heavyweight</div>
              </div>
            </div>

            <div className="p-3 bg-white/80 rounded-2xl border border-[#EBE3D9] backdrop-blur-xs flex items-center gap-2.5 shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-[#F2EEF7] flex items-center justify-center shrink-0 text-[#B8A9C9]">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#2D222A] leading-tight">Archival Box Set</div>
                <div className="text-[10px] text-[#695B64]">Magnetic Keepsake Box</div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {[
              { id: "All", label: "All Collections" },
              { id: "Fantasy", label: "Fantasy & Wonder" },
              { id: "Adventure", label: "Adventure & STEM" },
              { id: "Bedtime", label: "Bedtime & Calming" },
              { id: "Family", label: "Sibling & Duos" },
              { id: "Trilogy", label: "Master Trilogy Sets" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${selectedFilter === tab.id
                  ? "bg-[#2D222A] text-white shadow-sm scale-105"
                  : "bg-white border border-[#EBE3D9] text-[#695B64] hover:bg-[#FAF7F2] hover:text-[#2D222A]"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          2. Master Hardcopy Collections: 3D Dual-Book Showcase Cards
          ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="space-y-12">
          {filteredCollections.map((col, cIdx) => {
            const activeVol = getActiveVolumeForCollection(col);
            const viewMode = getCollectionViewMode(col.id);
            const activeIdx = activeVolumeIdx[col.id] ?? 0;

            return (
              <div
                key={col.id}
                className={`rounded-3xl border ${col.colorBorder} bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row`}
              >
                {/* LEFT: 3D Hardcover Stage & Presentation Box View */}
                <div
                  className={`lg:w-1/2 p-6 sm:p-8 bg-gradient-to-br ${col.bgGradient} flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#EBE3D9]/80 relative group`}
                >
                  {/* Top Bar on Stage: Badge, Rating & View Toggle */}
                  <div className="flex items-center justify-between gap-2 z-20">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white text-[#2D222A] border border-[#EBE3D9] shadow-2xs">
                        {col.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/90 text-[#C98A84] border border-[#C98A84]/20 shadow-2xs">
                        <Sparkles className="w-3 h-3" />
                        <span>{col.badge}</span>
                      </div>
                    </div>

                    {/* View Mode Toggle: 3D Hardcovers vs Box Set */}
                    <div className="inline-flex p-1 bg-white/80 rounded-full border border-[#EBE3D9] shadow-2xs">
                      <button
                        onClick={() => toggleCollectionView(col.id, "books")}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${viewMode === "books"
                          ? "bg-[#2D222A] text-white shadow-xs"
                          : "text-[#695B64] hover:text-[#2D222A]"
                          }`}
                        title="View 3D Physical Hardcovers"
                      >
                        Books View
                      </button>
                      <button
                        onClick={() => toggleCollectionView(col.id, "box")}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${viewMode === "box"
                          ? "bg-[#2D222A] text-white shadow-xs"
                          : "text-[#695B64] hover:text-[#2D222A]"
                          }`}
                        title="View Presentation Box Set"
                      >
                        Box Set View
                      </button>
                    </div>
                  </div>

                  {/* CENTER STAGE: 3D Hardcover Presentation or Archival Box */}
                  <div className="py-8 sm:py-10 flex items-center justify-center min-h-[360px] sm:min-h-[420px] relative">
                    {viewMode === "books" ? (
                      /* 3D Realistic Dual / Triple Hardcover Book Stage */
                      <div className="w-full max-w-md relative flex items-center justify-center book-stack-container">
                        {/* If 2 books, show dynamic layered perspective */}
                        {col.stories.length === 2 && (
                          <div className="relative w-full max-w-[340px] sm:max-w-[380px] h-[280px] sm:h-[320px] flex items-center justify-center">
                            {/* Background Volume (Secondary) */}
                            <div
                              onClick={() => setVolumeForCollection(col.id, activeIdx === 0 ? 1 : 0)}
                              className={`absolute cursor-pointer transition-all duration-500 w-[65%] sm:w-[68%] aspect-square ${activeIdx === 0
                                ? "right-2 sm:right-4 z-10 scale-90 opacity-85 rotate-6 hover:rotate-3 hover:scale-95 hover:opacity-100"
                                : "left-2 sm:left-4 z-10 scale-90 opacity-85 -rotate-6 hover:rotate-0 hover:scale-95 hover:opacity-100"
                                }`}
                              title={`Click to switch to Volume ${activeIdx === 0 ? 2 : 1}`}
                            >
                              <HardcoverBook
                                coverUrl={col.stories[activeIdx === 0 ? 1 : 0].coverUrl}
                                title={col.stories[activeIdx === 0 ? 1 : 0].title}
                                aspectRatio="square"
                                fallbackSrc={col.stories[activeIdx === 0 ? 1 : 0].fallbackUrl}
                              >
                                {/* Satin ribbon bookmark dangling */}
                                <div className="satin-ribbon" />
                                <div className="absolute top-2 right-2 bg-[#2D222A]/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  Vol {activeIdx === 0 ? "II" : "I"}
                                </div>
                              </HardcoverBook>
                            </div>

                            {/* Foreground Active Volume (Primary) */}
                            <div
                              className={`absolute cursor-pointer transition-all duration-500 w-[72%] sm:w-[76%] aspect-square z-20 ${activeIdx === 0
                                ? "left-2 sm:left-4 -rotate-2 hover:rotate-0 hover:scale-105"
                                : "right-2 sm:right-4 rotate-2 hover:rotate-0 hover:scale-105"
                                }`}
                              onClick={() => {
                                setInspectVolume(activeVol);
                                setInspectSpreadIdx(0);
                              }}
                              title="Click to inspect physical hardcover"
                            >
                              <HardcoverBook
                                coverUrl={activeVol.coverUrl}
                                title={activeVol.title}
                                aspectRatio="square"
                                fallbackSrc={activeVol.fallbackUrl}
                              >
                                {/* Satin ribbon bookmark dangling */}
                                <div className="satin-ribbon satin-ribbon-rose" />

                                {/* Gold Foil Edition Pill */}
                                <div className="absolute top-2.5 left-2.5 z-25 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs border border-[#C5A059]/40 text-[10px] font-bold text-[#2D222A] shadow-xs">
                                  <Crown className="w-3 h-3 text-[#C5A059]" />
                                  <span>Vol {activeIdx === 0 ? "I" : "II"} • Hardcover</span>
                                </div>

                                {/* Hover Inspect Badge */}
                                <div className="absolute inset-0 bg-[#2D222A]/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-[7px] rounded-l-[4px] flex items-center justify-center p-4">
                                  <span className="px-4 py-2 rounded-full bg-white text-[#2D222A] text-xs font-semibold shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <Eye className="w-3.5 h-3.5 text-[#C98A84]" />
                                    <span>Examine Hardcover</span>
                                  </span>
                                </div>
                              </HardcoverBook>
                            </div>
                          </div>
                        )}

                        {/* If 3 books (Trilogy), show 3-stack cascade */}
                        {col.stories.length === 3 && (
                          <div className="relative w-full max-w-[400px] h-[300px] sm:h-[330px] flex items-center justify-center">
                            {col.stories.map((story, sIdx) => {
                              const isActive = activeIdx === sIdx;
                              const offsetMap = [
                                "left-0 -rotate-6 z-10 scale-85 opacity-80",
                                "left-12 rotate-0 z-20 scale-95 opacity-90",
                                "right-0 rotate-6 z-30 scale-100 opacity-100"
                              ];
                              return (
                                <div
                                  key={story.title}
                                  onClick={() => setVolumeForCollection(col.id, sIdx)}
                                  className={`absolute cursor-pointer transition-all duration-400 w-[58%] aspect-square ${isActive
                                    ? "z-40 scale-105 -translate-y-2 shadow-2xl"
                                    : offsetMap[sIdx]
                                    }`}
                                  title={`Volume ${sIdx + 1}: ${story.title}`}
                                >
                                  <HardcoverBook
                                    coverUrl={story.coverUrl}
                                    title={story.title}
                                    aspectRatio="square"
                                    fallbackSrc={story.fallbackUrl}
                                  >
                                    <div className="satin-ribbon" />
                                    <div className="absolute top-2 left-2 bg-[#2D222A]/85 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                      Vol {sIdx + 1}
                                    </div>
                                  </HardcoverBook>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Presentation Box View: Real Heirloom Gift Box Mockup */
                      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-[#EBE3D9] bg-white group/box">
                        <img
                          src={col.boxImage}
                          alt={`${col.name} Heirloom Presentation Box`}
                          className="w-full h-[280px] sm:h-[320px] object-cover transition-transform duration-700 group-hover/box:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D222A]/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                          <div className="text-[10px] uppercase tracking-widest text-[#ECC880] font-bold">
                            Archival Gift Presentation Chest
                          </div>
                          <div className="font-editorial-serif text-lg font-bold">
                            Linen Covered • Magnetic Clasp • Gold Stamped
                          </div>
                          <div className="text-xs text-white/80">
                            Includes 2 personalized volumes resting in cotton parchment bedding
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* BOTTOM OF STAGE: Volume Switcher Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EBE3D9]/60 z-20">
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <span className="text-[11px] font-semibold text-[#695B64] mr-1 shrink-0">
                        Volumes in Box:
                      </span>
                      {col.stories.map((story, idx) => (
                        <button
                          key={story.title}
                          onClick={() => {
                            setVolumeForCollection(col.id, idx);
                            toggleCollectionView(col.id, "books");
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${activeIdx === idx && viewMode === "books"
                            ? "bg-[#2D222A] text-white shadow-xs"
                            : "bg-white/80 border border-[#EBE3D9] text-[#695B64] hover:bg-white hover:text-[#2D222A]"
                            }`}
                        >
                          <Bookmark className="w-3 h-3 text-[#C98A84]" />
                          <span>Vol {idx + 1}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setInspectVolume(activeVol);
                        setInspectSpreadIdx(0);
                      }}
                      className="text-xs font-semibold text-[#C98A84] hover:text-[#B87A74] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Inspect Hardcover Specs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* RIGHT: Curated Hardcover Box Details, Included Books, & Personalize CTA */}
                <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    {/* Title & Tagline */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#C5A059] font-medium mb-1">
                        <div className="flex text-[#D8A24A]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <span className="font-semibold text-[#2D222A]">{col.rating}</span>
                        <span className="text-[#695B64]">({col.reviewCount} parent reviews)</span>
                      </div>

                      <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
                        {col.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-[#C98A84] mt-1">
                        {col.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                      {col.description}
                    </p>

                    {/* Active Volume Featured Highlight Card */}
                    <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE3D9] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D222A] flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#C98A84]" />
                          <span>Featured Volume {activeIdx + 1} in this Set:</span>
                        </div>
                        <span className="text-[11px] font-medium text-[#695B64] bg-white px-2 py-0.5 rounded-full border border-[#EBE3D9]">
                          {activeVol.age}
                        </span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#EBE3D9] flex items-start justify-between gap-3 shadow-2xs">
                        <div className="space-y-1">
                          <strong className="text-sm text-[#2D222A] block font-editorial-serif">
                            {activeVol.title}
                          </strong>
                          <p className="text-xs text-[#695B64] line-clamp-2">
                            {activeVol.tagline}
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#8F9E8B] font-medium">
                            <span>{activeVol.genre}</span>
                            <span>•</span>
                            <span>{activeVol.pages} Hardcover Pages</span>
                            <span>•</span>
                            <span>Smyth-Sewn 180°</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setInspectVolume(activeVol);
                            setInspectSpreadIdx(0);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAEEED] text-[#C98A84] text-xs font-semibold shrink-0 border border-[#EBE3D9] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Look Inside</span>
                        </button>
                      </div>

                      {/* All Included Volumes in this Box Set */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#695B64]">
                          All {col.stories.length} Books Included In This Box:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {col.stories.map((story, sIndex) => (
                            <button
                              key={story.title}
                              onClick={() => setVolumeForCollection(col.id, sIndex)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${activeIdx === sIndex
                                ? "bg-white border-[#C98A84] shadow-xs"
                                : "bg-white/60 border-[#EBE3D9] hover:bg-white text-[#695B64]"
                                }`}
                            >
                              <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#EBE3D9]">
                                <img
                                  src={story.coverUrl}
                                  alt={story.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#2D222A] truncate">
                                  {story.title}
                                </div>
                                <div className="text-[10px] text-[#695B64]">
                                  {story.pages} Pages • Hardcover
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Hardcopy Presentation Box Specifications */}
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D222A] flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Included In This Deluxe Heirloom Box Set:</span>
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

                  {/* Price Strip & Personalize Set CTA */}
                  <div className="pt-4 border-t border-[#EBE3D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#695B64] font-medium">
                        Heirloom Box Set Value
                      </div>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
                          ₹{col.bundlePrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-sm text-[#695B64] line-through">
                          ₹{col.regularPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] font-bold text-[#4E7048] bg-[#EEF4ED] px-2.5 py-0.5 rounded-full border border-[#8F9E8B]/30">
                          Save ₹{(col.regularPrice - col.bundlePrice).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#695B64] mt-0.5">
                        Includes Free Pan-India Insured Express Delivery
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/personalize/${col.stories[0].slug}`}
                        className="px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Personalize Box Set</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          3. Complete Hardcopy Library Shelf: Explore Other Books
          ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF5E8] border border-[#C5A059]/30 text-xs font-semibold text-[#C5A059]">
            <Crown className="w-3.5 h-3.5" />
            <span>The KuttyStory Physical Library</span>
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Explore All Other <span className="italic font-normal text-[#C98A84]">Hardcover Volumes</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#695B64] max-w-2xl mx-auto">
            Looking for a single collector's volume or building your child's custom book stack? Each storybook is individually handcrafted as a standalone heirloom hardcover.
          </p>
        </div>

        {/* 3D Interactive Bookshelf Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-6">
          {ALL_HARDCOVER_BOOKS.map((book) => (
            <div
              key={book.title}
              onClick={() => {
                setInspectVolume(book);
                setInspectSpreadIdx(0);
              }}
              className="group cursor-pointer flex flex-col justify-between p-3 sm:p-4 rounded-2xl bg-white border border-[#EBE3D9] hover:border-[#C98A84]/60 shadow-2xs hover:shadow-md transition-all duration-300"
            >
              {/* 3D Realistic Hardcover View */}
              <div className="relative aspect-square w-full flex items-center justify-center p-1">
                <HardcoverBook
                  coverUrl={book.coverUrl}
                  title={book.title}
                  aspectRatio="square"
                >
                  <div className="satin-ribbon" />
                  <div className="absolute inset-0 bg-[#2D222A]/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-[7px] rounded-l-[4px] flex items-center justify-center">
                    <span className="px-2.5 py-1 rounded-full bg-white text-[#2D222A] text-[10px] font-bold shadow-md flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#C98A84]" />
                      <span>Look Inside</span>
                    </span>
                  </div>
                </HardcoverBook>
              </div>

              {/* Book Info */}
              <div className="pt-3 space-y-1 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C98A84]">
                  {book.age}
                </div>
                <h4 className="font-editorial-serif text-xs sm:text-sm font-bold text-[#2D222A] line-clamp-1 group-hover:text-[#C98A84] transition-colors">
                  {book.title}
                </h4>
                <div className="text-[11px] text-[#695B64]">
                  {book.pages} Pages • ₹1,399
                </div>

                <Link
                  to={`/personalize/${book.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 block w-full py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#FAEEED] text-[#C98A84] text-[11px] font-semibold border border-[#EBE3D9] transition-colors"
                >
                  Personalize
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          5. Gift Atelier: Unwrapping an Unforgettable Memory
          ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
              Signature Unboxing Ritual
            </span>
            <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
              Unwrapping an Unforgettable Memory
            </h3>
            <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
              Every KuttyStory Collection Box is hand-assembled in our editorial atelier. Rigid keepsake presentation boxes lined with acid-free shredded tissue paper, closed with double-faced French satin ribbon, and stamped with our signature gold seal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-[#2D222A]">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B] shrink-0" />
                <span>Complimentary Letterpress Gift Card</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B] shrink-0" />
                <span>No pricing invoices included inside box</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B] shrink-0" />
                <span>Global insured courier shipping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#8F9E8B] shrink-0" />
                <span>Optional Hand-Waxed Atelier Seal</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-[#EBE3D9] text-center space-y-3 shadow-xs">
            <div className="relative rounded-xl overflow-hidden mb-3 border border-[#EBE3D9]">
              <img
                src="/covers/heirloom_box.jpg"
                alt="Heirloom Box Set Packaging"
                className="w-full h-44 object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#2D222A]/80 text-white text-[10px] font-bold">
                Gold Foil Atelier Box
              </div>
            </div>
            <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              Sending Directly as a Milestone Gift?
            </h4>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Enter the recipient's delivery address at checkout. We’ll package it in our signature presentation box with your personalized greeting printed on fine cotton cardstock.
            </p>
            <Link
              to="/storybooks"
              className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#FAEEED] text-xs font-semibold text-[#C98A84] border border-[#EBE3D9] transition-colors"
            >
              Browse All Individual Books
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          6. Interactive Physical Hardcover Inspector Modal
          ────────────────────────────────────────────────────────── */}
      {inspectVolume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D222A]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#EBE3D9] shadow-2xl p-6 sm:p-8 space-y-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setInspectVolume(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#FAF7F2] hover:bg-[#FAEEED] text-[#695B64] hover:text-[#2D222A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FAEEED] text-[#C98A84]">
                {inspectVolume.genre}
              </span>
              <span className="text-xs text-[#695B64]">
                {inspectVolume.age} • {inspectVolume.pages} Hardcover Pages
              </span>
            </div>

            {/* Split: Hardcover 3D Cover + Details & Spread Excerpt */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              {/* Hardcover 3D Render */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-[85%] max-w-[260px] aspect-square">
                  <HardcoverBook
                    coverUrl={inspectVolume.coverUrl}
                    title={inspectVolume.title}
                    aspectRatio="square"
                    fallbackSrc={inspectVolume.fallbackUrl}
                  >
                    <div className="satin-ribbon satin-ribbon-rose" />
                  </HardcoverBook>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-[11px] font-bold text-[#C5A059] uppercase tracking-wider">
                    Physical Heirloom Dimensions
                  </div>
                  <div className="text-xs text-[#695B64] mt-0.5">
                    8.5 × 8.5 Inch Square • 2.5mm Hardcover Board
                  </div>
                </div>
              </div>

              {/* Book Details & Sample Spreads */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
                    {inspectVolume.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C98A84] font-medium mt-1">
                    {inspectVolume.tagline}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                  {inspectVolume.description}
                </p>

                {/* Sample Spread Preview */}
                {inspectVolume.sampleSpreads && inspectVolume.sampleSpreads.length > 0 && (
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE3D9] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#2D222A] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#C98A84]" />
                        <span>Sample Story Spread (Page {inspectVolume.sampleSpreads[inspectSpreadIdx].page})</span>
                      </div>
                      {inspectVolume.sampleSpreads.length > 1 && (
                        <div className="flex items-center gap-1">
                          {inspectVolume.sampleSpreads.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => setInspectSpreadIdx(idx)}
                              className={`w-5 h-5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${inspectSpreadIdx === idx
                                ? "bg-[#2D222A] text-white"
                                : "bg-white text-[#695B64] border border-[#EBE3D9]"
                                }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#EBE3D9] space-y-1">
                      <div className="font-editorial-serif text-xs font-bold text-[#2D222A]">
                        "{inspectVolume.sampleSpreads[inspectSpreadIdx].title}"
                      </div>
                      <p className="font-story italic text-xs text-[#4E424B] leading-relaxed">
                        "{inspectVolume.sampleSpreads[inspectSpreadIdx].text}"
                      </p>
                      <div className="text-[10px] text-[#8F9E8B] pt-1">
                        Illustration Scene: {inspectVolume.sampleSpreads[inspectSpreadIdx].scene}
                      </div>
                    </div>
                  </div>
                )}

                {/* Physical Specifications Checklist */}
                <div className="grid grid-cols-2 gap-2 text-xs text-[#2D222A] pt-1">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8F9E8B]" />
                    <span>Smyth-Sewn 180° Lay-Flat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8F9E8B]" />
                    <span>170gsm Archival Silk Paper</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8F9E8B]" />
                    <span>Hot Gold-Foil Spine Stamping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8F9E8B]" />
                    <span>French Satin Ribbon Bookmark</span>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-3 flex items-center justify-between border-t border-[#EBE3D9]">
                  <div>
                    <div className="text-[10px] uppercase text-[#695B64]">Hardcover Edition</div>
                    <div className="font-editorial-serif text-xl font-bold text-[#2D222A]">₹1,399</div>
                  </div>

                  <Link
                    to={`/personalize/${inspectVolume.slug}`}
                    className="px-6 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalize This Book</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

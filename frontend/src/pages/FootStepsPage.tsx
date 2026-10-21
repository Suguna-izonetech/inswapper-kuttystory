import { useState } from "react";
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
  Smile
} from "lucide-react";
import BookSalesMapSection from "../components/BookSalesMapSection";


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

  const currentStage =
    MILESTONE_STAGES.find((s) => s.id === selectedMilestone) ||
    MILESTONE_STAGES[0];

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
              <h1 className="font-editorial-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#2D222A] leading-[1.15] tracking-tight mb-5">
                Foot Steps:<br />
                Every Milestone<br />
                <span className="italic font-normal text-[#C98A84]">Woven into Wonder</span>
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
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
              Heartfelt Memories
            </span>
            <h3 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
              What Parents Say About Foot Steps
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] space-y-3">
              <div className="flex text-[#C5A059] gap-1">
                {"★★★★★"}
              </div>
              <p className="text-xs text-[#695B64] italic leading-relaxed">
                “When our son started kindergarten, he had so much separation anxiety. We gave him his KuttyStory book where he walked bravely through the Whispering Woods. He hugged that book every night before school.”
              </p>
              <div className="text-xs font-bold text-[#2D222A] pt-1">
                — Priya & Karthik M., Chennai
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] space-y-3">
              <div className="flex text-[#C5A059] gap-1">
                {"★★★★★"}
              </div>
              <p className="text-xs text-[#695B64] italic leading-relaxed">
                “We stamped Maya's 1st birthday footprint on the commemorative page. Holding the hardbound book and looking at her likeness as the unicorn's friend brought tears to her grandparents’ eyes.”
              </p>
              <div className="text-xs font-bold text-[#2D222A] pt-1">
                — Sarah & David B., Mumbai
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

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
  Smile,
  ShieldAlert,
  Stars
} from "lucide-react";

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
      <section className="bg-gradient-to-b from-[#FAEEED]/40 via-[#FAF7F2] to-[#FAF7F2] pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-semibold text-[#C98A84] shadow-xs">
            <Footprints className="w-3.5 h-3.5 text-[#C98A84]" />
            <span>Childhood Milestone Keepsakes</span>
          </div>

          <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight">
            Foot Steps: Every Milestone <span className="italic font-normal text-[#C98A84]">Woven into Wonder</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            Childhood slips through our fingers in a blink of an eye. The KuttyStory Foot Steps collection preserves every tender leap — from their first tiny steps to school milestones — as permanent heirloom literature.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#stages"
              className="px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
            >
              <span>Explore Milestone Stages</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/storybooks"
              className="px-6 py-3 rounded-full bg-white border border-[#EBE3D9] text-[#2D222A] text-xs sm:text-sm font-medium hover:border-[#C98A84]"
            >
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive Milestone Navigator */}
      <section id="stages" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D9] shadow-sm space-y-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-[#C98A84] mb-1">
              Select Your Child's Journey
            </div>
            <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
              Which Step Is Your Child Taking Today?
            </h2>
          </div>

          {/* Milestone Step Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {MILESTONE_STAGES.map((stage) => {
              const Icon = stage.icon;
              const isSelected = selectedMilestone === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setSelectedMilestone(stage.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-[#C98A84] bg-[#FAEEED]/40 shadow-sm ring-2 ring-[#C98A84]/20"
                      : "border-[#EBE3D9] bg-[#FAF7F2] hover:bg-white hover:border-[#C98A84]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${stage.colorBg} flex items-center justify-center ${stage.colorText}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#2D222A] border border-[#EBE3D9]">
                      {stage.ageRange}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D222A]">{stage.stageName}</div>
                    <div className="text-[11px] text-[#695B64] line-clamp-1">{stage.title}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Milestone Spotlight Detail Card */}
          <div className="rounded-2xl border border-[#EBE3D9] bg-gradient-to-br from-[#FAF7F2] via-white to-[#FAF7F2] p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-[#2D222A] text-white text-xs font-semibold">
                  Stage: {currentStage.stageName}
                </span>
                <span className="text-xs font-medium text-[#C98A84]">
                  Recommended For {currentStage.ageRange}
                </span>
              </div>

              <h3 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
                {currentStage.title}
              </h3>

              <p className="text-sm text-[#695B64] leading-relaxed">
                {currentStage.description}
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="text-xs uppercase tracking-wider font-bold text-[#2D222A]">
                  Built-In Heirloom Keepsake Elements:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentStage.keepsakeFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[#4E424B]">
                      <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Story Box */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C98A84]">
                  Ideal Story Match
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#695B64] border border-[#EBE3D9]">
                  {currentStage.recommendedStory.genre}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  {currentStage.recommendedStory.title}
                </h4>
                <p className="text-xs text-[#695B64]">
                  Tailored narrative designed to resonate with this exact developmental leap.
                </p>
              </div>

              <div className="pt-3 border-t border-[#EBE3D9] flex items-center justify-between">
                <div className="text-xs text-[#695B64]">
                  26 Pages • Archival 210×210 mm
                </div>
                <Link
                  to={`/personalize/${currentStage.recommendedStory.slug}`}
                  className="px-4 py-2 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Personalize</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The 3 Special Keepsake Inclusions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">
            The Foot Steps Inclusions
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            More Than a Book: A Tangible Time Capsule
          </h2>
          <p className="text-xs sm:text-sm text-[#695B64]">
            Every edition ordered through our Foot Steps collection includes these three permanent commemorative features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Keepsake 1 */}
          <div className="bg-white rounded-2xl p-7 border border-[#EBE3D9] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAEEED] flex items-center justify-center text-[#C98A84]">
              <Footprints className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              1. The 1:1 Footprint Page
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Printed on extra-heavyweight acid-free art stock. Includes instructions and non-toxic safe ink guidelines for stamping their tiny foot alongside an illustrated golden stepping-stone path.
            </p>
          </div>

          {/* Keepsake 2 */}
          <div className="bg-white rounded-2xl p-7 border border-[#EBE3D9] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EEF7] flex items-center justify-center text-[#B8A9C9]">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              2. The Letter From Loved Ones
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Before the story begins, Page 1 displays your permanent letter to your child. Written today, but waiting to be read again on their 18th birthday or wedding morning.
            </p>
          </div>

          {/* Keepsake 3 */}
          <div className="bg-white rounded-2xl p-7 border border-[#EBE3D9] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEF4ED] flex items-center justify-center text-[#8F9E8B]">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              3. The Growth Milestone Seal
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Tucked inside the back cover is an embossed certificate commemorating the date, height, favorite toy, and proudest achievement of the day this book was typeset.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Parent Memories & Testimonials */}
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
                — Priya & Karthik M., London, UK
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
                — Sarah & David B., Toronto, Canada
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Camera,
  Cpu,
  Eye,
  PackageCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkle,
  Image as ImageIcon,
  Check,
  X
} from "lucide-react";

interface StepItem {
  number: string;
  title: string;
  tagline: string;
  description: string;
  icon: any;
  colorBg: string;
  colorText: string;
  details: string[];
}

const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Select Story & Add Dedication",
    tagline: "Choose from our curated realm of fairy tales and adventures",
    description: "Browse our library of classical narrative arcs. Enter your child’s name, age, and write a heartfelt dedication letter that will be typeset on the last Page as a lifelong keepsake.",
    icon: BookOpen,
    colorBg: "bg-[#FAEEED]",
    colorText: "text-[#C98A84]",
    details: [
      "Select favorite theme: Fairytale, Dragon, Ocean, or Forest",
      "Typeset custom parent, grandparent, or godparent dedication",
      "Choose hardcover or digital instant PDF edition"
    ]
  },
  {
    number: "02",
    title: "Upload a Single Reference Photo",
    tagline: "One clear smartphone photo is all the atelier requires",
    description: "Simply snap or choose a well-lit photo of your child looking toward the camera. Our built-in guardian privacy validator ensures optimal angle, lighting, and composition.",
    icon: Camera,
    colorBg: "bg-[#F2EEF7]",
    colorText: "text-[#B8A9C9]",
    details: [
      "No studio shoot required — smartphone photos work beautifully",
      "Instant face validation check for sharp lighting and angles",
      "Encrypted in-memory processing with strict zero-training privacy"
    ]
  },
  {
    number: "03",
    title: "Character Consistency & Story Painting",
    tagline: "Transforming facial features into timeless art",
    description: "Our fine-tuned generative pipeline gently maps your child's distinctive eye shape, smile, and facial structure into the story's painterly illustration style across all 24 pages.",
    icon: Cpu,
    colorBg: "bg-[#EEF4ED]",
    colorText: "text-[#8F9E8B]",
    details: [
      "No uncanny cutouts: seamless watercolor painterly integration",
      "Consistent character likeness across close-ups and action scenes",
      "Adheres strictly to traditional children's book aesthetic guidelines"
    ]
  },
  {
    number: "04",
    title: "Interactive Flipbook Preview",
    tagline: "Turn the virtual pages before a single drop of ink is printed",
    description: "Review every spread of your child's book in our interactive 3D viewer. Read the poetry, inspect the illustrations, and verify every dedication detail with complete confidence.",
    icon: Eye,
    colorBg: "bg-[#FAF5E8]",
    colorText: "text-[#C5A059]",
    details: [
      "Instant full-bleed inspection of 5 illustrated pages"
    ]
  },
  {
    number: "05",
    title: "Archival Print & Global Dispatch",
    tagline: "Master bookbinding delivered to your family doorstep",
    description: "Your book is typeset using our deterministic ReportLab engine at 8×8 mm, printed on archival 170gsm silk paper, bound in hardcover, and hand-wrapped with luxury ribbons.",
    icon: PackageCheck,
    colorBg: "bg-[#FAEEED]",
    colorText: "text-[#C98A84]",
    details: [
      "8×8 mm square hardcover with protective matte laminate",
      "Smyth-sewn lie-flat binding built to survive enthusiastic bedtime hands",
      "Delivered in a presentation box with tracked international shipping"
    ]
  }
];

const FAQS = [
  {
    q: "What kind of photo should I upload for best results?",
    a: "A clear, well-lit smartphone photo taken at eye level works best! Natural daylight is ideal. Ensure your child is looking toward the camera with their face unobstructed by hats, pacifiers, or dark sunglasses. A natural gentle smile or pleasant neutral expression works wonders."
  },
  {
    q: "Can I inspect the full book before paying or printing?",
    a: "Absolutely! We believe in 100% transparency. Our interactive 3D Realistic Flipbook allows you to page through the entire 26-page volume online to ensure you love every illustration and text line before your heirloom copy is sent to our print presses."
  },
  {
    q: "How long does printing and delivery take?",
    a: "Digital editions are ready within minutes after personalization. For physical hardcovers, printing and Smyth-sewn binding takes 5 to 7 business days. Domestic shipping takes 2 to 7 business days, while international express delivery takes 6 to 9 business days."
  },
  {
    q: "How do you protect my child's photo and biometrics?",
    a: "Your family's privacy is sacred. Photos are stored in isolated encrypted storage solely for the purpose of generating your storybook. We never use your child's photos to train public models, and photos are automatically shredded after order fulfillment."
  },
  {
    q: "Can I order multiple copies for grandparents and relatives?",
    a: "Yes! Share the love — you can easily add duplicate hardcovers for grandparents, relatives, and godparents. Enjoy a 30% bundle discount on duplicates at checkout, and get 10% off when you order more than 2 books!"
  }
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="pb-24">
      {/* 1. Header */}
      <section className="bg-gradient-to-b from-[#FAEEED]/40 via-[#FAF7F2] to-[#FAF7F2] pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-semibold text-[#C98A84] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Atelier Process</span>
          </div>

          <h1 className="font-hero-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight">
            How Your Heirloom Book <span className="font-fairy-tale text-[#C98A84]">Comes to Life</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            From a single smartphone photo to an archival 8×8 mm hardcover, explore our 5-step journey that brings personalized magic into your child's bedtime routine.
          </p>
        </div>
      </section>

      {/* 2. Five Step Journey Walkthrough */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EBE3D9] shadow-xs hover:border-[#C98A84]/40 transition-all grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
              >
                {/* Step Number & Icon */}
                <div className="md:col-span-4 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#C98A84]/40">
                      {step.number}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl ${step.colorBg} flex items-center justify-center ${step.colorText}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#C98A84] font-medium mt-1">
                      {step.tagline}
                    </p>
                  </div>
                </div>

                {/* Step Description & Checklist */}
                <div className="md:col-span-8 space-y-4 md:border-l md:border-[#EBE3D9] md:pl-8">
                  <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                    {step.description}
                  </p>

                  <div className="space-y-2 pt-2">
                    {step.details.map((detail, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-[#2D222A]">
                        <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Photo Guide Visual Tips */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
              Photography Guidance
            </span>
            <h3 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
              Taking the Perfect Reference Photo
            </h3>
            <p className="text-xs text-[#695B64]">
              You don’t need a professional photographer. Just keep these simple tips in mind!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What Works Great */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#EEF4ED] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4E7048]">
                <Check className="w-4 h-4 text-[#4E7048]" />
                <span>What Works Wonderfully</span>
              </div>
              <ul className="space-y-3 text-xs text-[#695B64]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                  <span>Bright, natural room daylight or gentle outdoor morning light.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                  <span>Face clearly visible, looking forward or slightly angled at eye-level.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                  <span>Happy or serene expression showing their everyday personality.</span>
                </li>
              </ul>
            </div>

            {/* What to Avoid */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#FAEEED] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                <X className="w-4 h-4 text-[#C98A84]" />
                <span>What to Avoid</span>
              </div>
              <ul className="space-y-3 text-xs text-[#695B64]">
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-[#C98A84] shrink-0 mt-0.5" />
                  <span>Heavy shadows, strong flash glare, or dark room lighting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-[#C98A84] shrink-0 mt-0.5" />
                  <span>Accessories covering facial landmarks (sunglasses, large hats, pacifiers).</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-4 h-4 text-[#C98A84] shrink-0 mt-0.5" />
                  <span>Blurry, low-resolution screenshots from social media.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Frequently Asked Questions Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#C98A84]">
            Answers for Parents
          </span>
          <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#695B64]">
            Everything you need to know about personalizing your KuttyStory book.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#EBE3D9] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAF7F2]/50 transition-colors"
                >
                  <span className="font-editorial-serif text-base sm:text-lg font-bold text-[#2D222A]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C98A84] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-xs sm:text-sm text-[#695B64] leading-relaxed border-t border-[#EBE3D9]/50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Direct Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-gradient-to-r from-[#FAEEED] via-[#FAF7F2] to-[#EEF4ED] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-xs font-semibold text-[#C98A84] shadow-xs">
            <Sparkle className="w-3.5 h-3.5" />
            <span>Ready in under 2 minutes</span>
          </div>

          <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Begin Your Child’s Storybook Journey
          </h3>

          <p className="text-xs sm:text-sm text-[#695B64] max-w-xl mx-auto">
            Choose a story from our catalog, upload a photo, and watch their personalized book come to life.
          </p>

          <div>
            <Link
              to="/storybooks"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <span>Personalize A Storybook</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

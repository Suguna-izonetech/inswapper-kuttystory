import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Heart,
  BookOpen,
  ArrowRight,
  Award,
  Users,
  Feather,
  Printer,
  Sparkle,
  CheckCircle2
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="pb-24">
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-b from-[#FAEEED]/50 via-[#FAF7F2] to-[#FAF7F2] pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-semibold text-[#C98A84] shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Atelier Story & Mission</span>
          </div>

          <h1 className="font-hero-heading text-4xl sm:text-6xl lg:text-7xl font-bold text-[#2D222A] tracking-tight leading-[1.12]">
            Every child deserves to see themselves as the <span className="font-fairy-tale text-[#C98A84]">hero</span> of the story.
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#695B64] font-normal leading-relaxed">
            KuttyStory was born from a timeless truth: when a child opens a book and sees their own smile, courage, and name woven into breathtaking art, reading transforms into a lifelong superpower.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/storybooks"
              className="px-8 py-3.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>Explore Story Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/how-it-works"
              className="px-7 py-3.5 rounded-full bg-white border border-[#EBE3D9] hover:border-[#C98A84] text-[#2D222A] text-xs sm:text-sm font-medium transition-colors"
            >
              <span>How It Works</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. The Meaning Behind "Kutty" */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="text-xs uppercase tracking-widest text-[#C98A84] font-bold">
              Our Name & Ethos
            </div>
            <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
              What Does <span className="italic font-normal text-[#C98A84]">“Kutty”</span> Mean?
            </h2>
            <p className="text-sm text-[#695B64] leading-relaxed">
              In Tamil and South Asian languages, <strong>“Kutty”</strong> (pronounced <em>koot-tee</em>) is the most tender term of endearment for a beloved child. It means <em>“the little one”</em> — the sweet soul who fills a home with laughter, boundless questions, and uninhibited dreams.
            </p>
            <p className="text-sm text-[#695B64] leading-relaxed">
              We paired <em>Kutty</em> with timeless storybook craftsmanship because we believe every child's small years are grand miracles. The heirloom volumes we create aren't disposable toys; they are tangible family treasures meant to be preserved for 30 years and handed down to the next generation.
            </p>
          </div>

          <div className="md:col-span-5 bg-[#FAF7F2] rounded-2xl p-6 border border-[#EBE3D9] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84]">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <div className="font-editorial-serif text-lg font-bold text-[#2D222A]">The Atelier Promise</div>
                <div className="text-xs text-[#695B64]">Rooted in love and literacy</div>
              </div>
            </div>
            <ul className="space-y-3 text-xs text-[#695B64]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                <span>100% original narrative poetry and prose reviewed by literacy educators.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                <span>No uncanny valley: soft, painterly watercolor aesthetics that feel handmade.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0 mt-0.5" />
                <span>Strict zero-data-harvesting policy regarding child photos.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. The Four Pillars of Our Atelier */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">
            The Atelier Standards
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            The Four Pillars of KuttyStory
          </h2>
          <p className="text-xs sm:text-sm text-[#695B64]">
            How we unite classical bookbinding with cutting-edge ethical intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-7 rounded-2xl border border-[#EBE3D9] hover:border-[#C98A84]/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAEEED] flex items-center justify-center text-[#C98A84]">
              <Feather className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              1. Storytelling Heart
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              We never use generic or rushed writing. Each story arc addresses emotional growth — embracing vulnerability, learning to share, discovering inner resilience, and celebrating uniqueness.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-7 rounded-2xl border border-[#EBE3D9] hover:border-[#C98A84]/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EEF7] flex items-center justify-center text-[#B8A9C9]">
              <Sparkle className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              2. Gentle Likeness Artistry
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Our fine-tuned generative pipeline maps child facial contours into classical watercolor illustration. Your child is immediately recognizable while effortlessly belonging in the story realm.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-7 rounded-2xl border border-[#EBE3D9] hover:border-[#C98A84]/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#EEF4ED] flex items-center justify-center text-[#8F9E8B]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              3. Child Privacy Sanctuary
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Parents retain 100% control. Photos uploaded are encrypted, processed in memory-only sandboxes, never shared or sold to model aggregators, and purged following book delivery.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-7 rounded-2xl border border-[#EBE3D9] hover:border-[#C98A84]/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#FAF5E8] flex items-center justify-center text-[#C5A059]">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              4. Museum Archival Print
            </h3>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Deterministic 8x8 mm vector typesetting engine. Heavyweight 170gsm silk paper, reinforced cloth spine, and vegetable-based eco inks that resist water drops and sunlight fading.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Atelier Statistics / Impact */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-14 border border-[#EBE3D9]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#EBE3D9]">
            <div className="space-y-1 pt-4 md:pt-0">
              <div className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#C98A84]">
                1,300
              </div>
              <div className="text-xs font-medium text-[#2D222A]">Books Sold & Delivered</div>
              <div className="text-[11px] text-[#695B64]">In homes across India</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#8F9E8B]">
                15 / 28
              </div>
              <div className="text-xs font-medium text-[#2D222A]">States Reached</div>
              <div className="text-[11px] text-[#695B64]">With tracked express shipping</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#B8A9C9]">
                99.4%
              </div>
              <div className="text-xs font-medium text-[#2D222A]">Parent Delight Rating</div>
              <div className="text-[11px] text-[#695B64]">Verified customer reviews</div>
            </div>

            <div className="space-y-1 pt-4 md:pt-0">
              <div className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#C5A059]">
                100%
              </div>
              <div className="text-xs font-medium text-[#2D222A]">Archival Guarantee</div>
              <div className="text-[11px] text-[#695B64]">Built to last for decades</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Team & Artisans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">
            The Makers
          </div>
          <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Crafted by Storytellers, Artists & Parents
          </h2>
          <p className="text-xs sm:text-sm text-[#695B64]">
            Meet the team dedicated to making every bedtime page feel like magic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] text-center space-y-3">
            <div className="w-20 h-20 rounded-full mx-auto bg-[#FAEEED] flex items-center justify-center text-[#C98A84] font-editorial-serif text-2xl font-bold">
              KS
            </div>
            <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              Kavitha Sundaram
            </h4>
            <div className="text-xs text-[#C98A84] font-medium">Founder & Story Architect</div>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Former children's book editor and mother of two. Kavitha founded KuttyStory after seeing how her daughter's face lit up when her name was written into a bedtime poem.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] text-center space-y-3">
            <div className="w-20 h-20 rounded-full mx-auto bg-[#F2EEF7] flex items-center justify-center text-[#B8A9C9] font-editorial-serif text-2xl font-bold">
              MR
            </div>
            <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              Marcus Reynolds
            </h4>
            <div className="text-xs text-[#B8A9C9] font-medium">Head of Illustration & Art Direction</div>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Classically trained watercolorist with 14 years illustrating European picture books. He curates the warm color palettes and character styles for every KuttyStory realm.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#EBE3D9] text-center space-y-3">
            <div className="w-20 h-20 rounded-full mx-auto bg-[#EEF4ED] flex items-center justify-center text-[#8F9E8B] font-editorial-serif text-2xl font-bold">
              AL
            </div>
            <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              Dr. Ananya Lakshmi
            </h4>
            <div className="text-xs text-[#8F9E8B] font-medium">Child Development Advisor</div>
            <p className="text-xs text-[#695B64] leading-relaxed">
              Pediatric psychologist specializing in early narrative empathy. She reviews story arcs to ensure themes empower healthy emotional resilience in developing minds.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-gradient-to-r from-[#FAEEED] via-[#F2EEF7] to-[#FAF5E8] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 text-xs font-semibold text-[#C98A84]">
            <Award className="w-3.5 h-3.5" />
            <span>100% Satisfaction Guarantee</span>
          </div>

          <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Ready to give them a story they’ll never forget?
          </h3>

          <p className="text-xs sm:text-sm text-[#695B64] max-w-xl mx-auto">
            Choose a storybook, upload a photo, and watch their personalized fairy tale come to life in minutes.
          </p>

          <div>
            <Link
              to="/storybooks"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs sm:text-sm font-semibold shadow-md transition-all"
            >
              <span>Start Personalizing Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

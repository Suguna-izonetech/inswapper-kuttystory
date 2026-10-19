import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, ShieldCheck, BookOpen, CheckCircle, Compass } from "lucide-react";
import { api, StoryTemplate } from "@/lib/api";
import { HardcoverBook } from "@/components/HardcoverBook";

export default function HomePage() {
  const [stories, setStories] = useState<StoryTemplate[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    api.getStories()
      .then((data) => setStories(data))
      .catch((err) => console.error("Error loading stories:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-28 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAEEED] border border-[#C98A84]/30 text-xs font-medium text-[#C98A84]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Heirloom Storybooks for Children</span>
            </div>

            <h1 className="font-editorial-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#2D222A] leading-[1.08]">
              Where your child becomes the hero of their own <span className="italic font-normal text-[#C98A84]">fairy tale</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#695B64] font-normal leading-relaxed max-w-2xl">
              Immerse your child into breathtaking, painterly adventures. Powered by gentle character-consistent AI and deterministic book typography, tailored with your child’s name and recognizable likeness.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link
                to="/storybooks"
                className="px-8 py-4 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-base font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 text-center"
              >
                <span>Explore Story Books</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/collections"
                className="px-6 py-4 rounded-full bg-white border border-[#EBE3D9] hover:border-[#C98A84] text-[#2D222A] text-base font-medium transition-all flex items-center justify-center gap-2 text-center"
              >
                <Sparkles className="w-4 h-4 text-[#C98A84]" />
                <span>View Collections</span>
              </Link>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-6 pt-6 text-xs text-[#695B64]">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#8F9E8B]" />
                <span>Deterministic 210×210 mm Print Engine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8F9E8B]" />
                <span>Parental Consent Protected</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative luxury frame */}
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-[#FAEEED] via-[#F2EEF7] to-[#FAF5E8] opacity-80 blur-xl"></div>

              <div className="relative rounded-2xl bg-white p-3 shadow-xl border border-[#EBE3D9]">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAF7F2]">
                  {stories.length > 0 && stories[0].cover_image_url ? (
                    <img
                      src={stories[0].cover_image_url}
                      alt="The Girl and the Magical Unicorn Cover"
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#695B64] p-8 text-center bg-[#FAEEED]/30">
                      <BookOpen className="w-16 h-16 text-[#C98A84] mb-4 stroke-1" />
                      <span className="font-editorial-serif text-2xl font-semibold text-[#2D222A]">The Girl & the Magical Unicorn</span>
                      <span className="text-xs text-[#695B64] mt-2">26-Page Heirloom Edition</span>
                    </div>
                  )}

                  {/* Corner Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-[#EBE3D9] flex items-center justify-between shadow-sm">
                    <div>
                      <div className="text-xs font-semibold text-[#2D222A]">Unicorn Story Template</div>
                      <div className="text-[11px] text-[#695B64]">26 Full-Bleed Pages • 1:1 Square Trim</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#EEF4ED] text-[#4E7048] text-[11px] font-medium">
                      Published
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Stories Catalog */}
      <section id="stories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">Story Catalog</div>
          <h2 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#2D222A]">
            Curated Story Templates
          </h2>
          <p className="text-sm text-[#695B64]">
            Each story is crafted with classical fairy-tale storytelling and adaptable artwork layouts ready for personalization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Story: Unicorn Story */}
          {stories.map((story) => (
            <div key={story.id} className="editorial-card overflow-hidden flex flex-col group">
              <div className="relative aspect-square p-5 sm:p-6 bg-gradient-to-b from-[#FDFCFB] via-[#F8F5EE] to-[#EFE8DD] flex items-center justify-center overflow-hidden border-b border-[#EBE3D9]/70">
                <div className="w-[82%] sm:w-[86%] max-w-[320px] aspect-square flex items-center justify-center mx-auto">
                  <HardcoverBook
                    coverUrl={story.cover_image_url}
                    title={story.title}
                    aspectRatio="square"
                  />
                </div>
                <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#EBE3D9] text-[11px] font-medium text-[#2D222A] shadow-xs">
                  {story.age_range}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] uppercase tracking-wider text-[#C98A84] font-medium">
                    {story.category} • {story.page_count} Pages
                  </div>
                  <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                    {story.title}
                  </h3>
                  <p className="text-xs text-[#695B64] line-clamp-2 leading-relaxed">
                    {story.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EBE3D9] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#695B64]">From </span>
                    <span className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                      ₹{story.price_digital ? Number(story.price_digital).toLocaleString("en-IN") : "799"}
                    </span>
                  </div>
                  <Link
                    to={`/personalize/${story.slug}`}
                    className="px-4 py-2 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>Personalize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {/* Coming Soon Card 1 */}
          <div className="editorial-card p-6 flex flex-col justify-between opacity-75 border-dashed border-[#D8CCC0]">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl bg-[#F7F3EC] flex flex-col items-center justify-center p-6 text-center text-[#695B64]">
                <Sparkles className="w-10 h-10 text-[#B8A9C9] mb-3" />
                <span className="font-editorial-serif text-xl font-semibold text-[#2D222A]">The Starlight Dragon</span>
                <span className="text-[11px] text-[#A2949E] mt-1">Expanding Catalog</span>
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F2EEF7] text-[#7E6E92] text-[10px] font-medium">
                  In Production
                </span>
                <h4 className="font-editorial-serif text-xl font-semibold text-[#2D222A] mt-2">
                  The Starlight Dragon
                </h4>
                <p className="text-xs text-[#695B64] mt-1">
                  A gentle dragon who gathers fallen stars to light the quiet night sky for dreaming children.
                </p>
              </div>
            </div>
            <div className="pt-4 text-xs text-[#A2949E]">Available in Next Release</div>
          </div>

          {/* Coming Soon Card 2 */}
          <div className="editorial-card p-6 flex flex-col justify-between opacity-75 border-dashed border-[#D8CCC0]">
            <div className="space-y-4">
              <div className="aspect-square rounded-xl bg-[#F7F3EC] flex flex-col items-center justify-center p-6 text-center text-[#695B64]">
                <Compass className="w-10 h-10 text-[#8F9E8B] mb-3" />
                <span className="font-editorial-serif text-xl font-semibold text-[#2D222A]">The Secret Treehouse</span>
                <span className="text-[11px] text-[#A2949E] mt-1">Expanding Catalog</span>
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EEF4ED] text-[#4E7048] text-[10px] font-medium">
                  In Production
                </span>
                <h4 className="font-editorial-serif text-xl font-semibold text-[#2D222A] mt-2">
                  The Secret Treehouse
                </h4>
                <p className="text-xs text-[#695B64] mt-1">
                  Discover a hidden sanctuary nestled in ancient boughs where enchanted animals gather to share stories.
                </p>
              </div>
            </div>
            <div className="pt-4 text-xs text-[#A2949E]">Available in Next Release</div>
          </div>
        </div>
      </section>

      {/* 3. How Personalization Works */}
      <section id="how-it-works" className="bg-[#F7F3EC] py-20 border-y border-[#EBE3D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="text-xs uppercase tracking-widest text-[#C98A84] font-semibold">The Atelier Process</div>
            <h2 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#2D222A]">
              How Your Heirloom Book is Created
            </h2>
            <p className="text-sm text-[#695B64]">
              Three simple steps to craft an unforgettable personalized children’s book.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] font-editorial-serif text-2xl font-bold">
                1
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Name & Reference Photo
              </h3>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Enter your child’s name and upload a single clear, authorized photo. We validate face lighting and composition with strict guardian privacy safeguards.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F2EEF7] flex items-center justify-center text-[#B8A9C9] font-editorial-serif text-2xl font-bold">
                2
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Character Consistency AI
              </h3>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Our multi-stage pipeline integrates reference likeness across close-ups, dynamic scenes, and emotional moments while preserving the story’s timeless illustration style.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EEF4ED] flex items-center justify-center text-[#8F9E8B] font-editorial-serif text-2xl font-bold">
                3
              </div>
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Deterministic PDF Layout
              </h3>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Artwork is typeset with our ReportLab deterministic layout engine at exact 210×210 mm trim size. Sharp vector typography, safe margins, and validated print-ready output.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quality & Safety Charter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="editorial-card p-8 sm:p-12 bg-white flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8F9E8B]">
              <ShieldCheck className="w-4 h-4 text-[#8F9E8B]" />
              <span>Responsible AI & Child Safety Charter</span>
            </div>
            <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
              We respect your child’s privacy as sacred.
            </h3>
            <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
              Photographs uploaded by parents are stored in private, protected storage with automated retention limits. We never sell biometric identifiers, train public models on your children, or expose reference photos to third parties.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link
              to="/how-it-works"
              className="px-6 py-3.5 rounded-full bg-[#FAEEED] hover:bg-[#F5DFDC] text-[#C98A84] text-xs font-semibold text-center transition-colors"
            >
              See How It Works
            </Link>
            <Link
              to="/personalize/unicorn-story"
              className="px-6 py-3.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold text-center transition-colors shadow-sm"
            >
              Start Personalization
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

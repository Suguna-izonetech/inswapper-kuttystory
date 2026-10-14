import { Link, Outlet } from "react-router-dom";
import { Sparkles, ShieldCheck, LayoutDashboard } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D222A]">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EBE3D9] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-[#FAEEED] border border-[#C98A84]/30 flex items-center justify-center text-[#C98A84] group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#C98A84]" />
              </div>
              <div>
                <span className="font-editorial-serif text-2xl font-bold tracking-tight text-[#2D222A] block leading-none">
                  KuttyStory
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#695B64] font-medium">
                  Editorial Atelier
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation items */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#4E424B]">
            <a href="/#stories" className="hover:text-[#C98A84] transition-colors">
              Storybooks
            </a>
            <a href="/#how-it-works" className="hover:text-[#C98A84] transition-colors">
              How It Works
            </a>
            <Link to="/poc" className="hover:text-[#C98A84] transition-colors flex items-center gap-1.5 text-[#B87A74]">
              <Sparkles className="w-4 h-4 text-[#C98A84]" />
              <span>3-Image AI POC</span>
            </Link>
            <Link to="/admin" className="hover:text-[#C98A84] transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4 text-[#8F9E8B]" />
              <span>Admin Studio</span>
            </Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center space-x-4">
            <Link
              to="/personalize/unicorn-story"
              className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-sm font-medium shadow-sm hover:shadow transition-all flex items-center gap-2"
            >
              <span>Personalize Now</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Editorial Footer */}
      <footer className="bg-[#F7F3EC] border-t border-[#EBE3D9] py-14 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#C98A84]" />
                <span className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  KuttyStory
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#695B64]">
                Creating personalized heirloom storybooks that nurture wonder, bravery, and lasting memories for children around the world.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#8F9E8B] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#8F9E8B]" />
                <span>Verified Guardian Data Protection</span>
              </div>
            </div>

            <div>
              <h4 className="font-editorial-serif text-sm font-semibold uppercase tracking-wider text-[#2D222A] mb-4">
                Story Library
              </h4>
              <ul className="space-y-2.5 text-xs text-[#695B64]">
                <li><Link to="/personalize/unicorn-story" className="hover:text-[#C98A84]">The Girl & the Magical Unicorn</Link></li>
                <li><span className="text-[#A2949E]">The Starlight Dragon (Coming Soon)</span></li>
                <li><span className="text-[#A2949E]">The Secret Treehouse (Coming Soon)</span></li>
                <li><Link to="/poc" className="hover:text-[#C98A84]">Character Consistency POC</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-editorial-serif text-sm font-semibold uppercase tracking-wider text-[#2D222A] mb-4">
                Studio & Admin
              </h4>
              <ul className="space-y-2.5 text-xs text-[#695B64]">
                <li><Link to="/admin" className="hover:text-[#C98A84]">Studio Dashboard</Link></li>
                <li><Link to="/admin" className="hover:text-[#C98A84]">Story Template Manager</Link></li>
                <li><Link to="/admin" className="hover:text-[#C98A84]">AI Providers & Budgets</Link></li>
                <li><Link to="/admin" className="hover:text-[#C98A84]">Generation Monitor</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-editorial-serif text-sm font-semibold uppercase tracking-wider text-[#2D222A] mb-4">
                Privacy & Trust
              </h4>
              <p className="text-xs text-[#695B64] leading-relaxed mb-3">
                Children's photographs are stored in private encrypted storage and processed solely for book generation with parental consent.
              </p>
              <div className="text-[11px] text-[#A2949E]">
                ReportLab 210×210 mm Print Ready Engine • ISO 19005 Compliance
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#EBE3D9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#695B64]">
            <div>© 2026 KuttyStory Atelier. All rights reserved.</div>
            <div className="flex gap-6 mt-3 sm:mt-0">
              <span className="hover:text-[#2D222A] cursor-pointer">Privacy Charter</span>
              <span className="hover:text-[#2D222A] cursor-pointer">Parental Consent Terms</span>
              <span className="hover:text-[#2D222A] cursor-pointer">Print Specifications</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

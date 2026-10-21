import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Sparkles, ShieldCheck, Menu, X, ArrowRight } from "lucide-react";

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", path: "/", end: true },
    { label: "Story Books", path: "/storybooks" },
    { label: "About", path: "/about" },
    { label: "Foot Steps", path: "/footsteps" },
    { label: "How It Works", path: "/how-it-works" },
    { label: "Collections", path: "/collections" },
    { label: "Journal", path: "/journal" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D222A]">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EBE3D9] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-full bg-[#FAEEED] border border-[#C98A84]/30 flex items-center justify-center text-[#C98A84] group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                <img src="/logo.jpg" alt="KuttyStory Logo" className="w-full h-full object-cover" />
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

          {/* Primary Navigation Menu (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-xs xl:text-sm font-medium transition-all relative ${isActive
                    ? "text-[#C98A84] bg-[#FAEEED]/70 font-semibold"
                    : "text-[#4E424B] hover:text-[#C98A84] hover:bg-[#FAEEED]/30"
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C98A84] inline-block" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action CTA & Mobile Hamburger */}
          <div className="flex items-center space-x-3">
            <Link
              to="/storybooks"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs sm:text-sm font-medium shadow-xs hover:shadow transition-all"
            >
              <span>Personalize a Story</span>
              <Sparkles className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full bg-white border border-[#EBE3D9] flex items-center justify-center text-[#2D222A] hover:text-[#C98A84] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-[#EBE3D9] px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200">
            <div className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${isActive
                      ? "bg-[#FAEEED] text-[#C98A84] font-semibold"
                      : "text-[#2D222A] hover:bg-[#FAF7F2]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span>{item.label}</span>
                      {isActive && <Sparkles className="w-4 h-4 text-[#C98A84]" />}
                    </>
                  )}
                </NavLink>
              ))}

              <div className="pt-3 border-t border-[#EBE3D9] mt-2">
                <Link
                  to="/storybooks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-xl bg-[#C98A84] hover:bg-[#B87A74] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Personalize A Storybook</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
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
              <div className="flex items-center space-x-2.5">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#C98A84]/30 shadow-2xs">
                  <img src="/logo.jpg" alt="KuttyStory" className="w-full h-full object-cover" />
                </div>
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
                Explore Atelier
              </h4>
              <ul className="space-y-2.5 text-xs text-[#695B64]">
                <li><Link to="/storybooks" className="hover:text-[#C98A84] transition-colors">Story Books</Link></li>
                <li><Link to="/about" className="hover:text-[#C98A84] transition-colors">About Us</Link></li>
                <li><Link to="/footsteps" className="hover:text-[#C98A84] transition-colors">Foot Steps Milestones</Link></li>
                <li><Link to="/how-it-works" className="hover:text-[#C98A84] transition-colors">How It Works</Link></li>
                <li><Link to="/collections" className="hover:text-[#C98A84] transition-colors">Thematic Collections</Link></li>
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
                ReportLab 8×8 mm Print Ready Engine • ISO 19005 Compliance
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

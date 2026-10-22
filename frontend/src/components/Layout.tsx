import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Sparkles, ShieldCheck, Menu, X, ArrowRight } from "lucide-react";
import FooterFeedbackForm from "./FooterFeedbackForm";

// =========================================================================
// KUTTYSTORY SOCIAL MEDIA CONFIGURATION
// To connect official accounts, replace the placeholder URLs below with the real KuttyStory pages:
// =========================================================================
export const KUTTYSTORY_SOCIAL_LINKS = {
  // Replace with official Instagram profile URL (e.g., "https://www.instagram.com/kuttystory")
  instagram: "https://www.instagram.com/",
  // Replace with official WhatsApp link or phone number (e.g., "https://wa.me/91XXXXXXXXXX")
  whatsapp: "https://wa.me/",
  // Replace with official Facebook page URL (e.g., "https://www.facebook.com/kuttystory")
  facebook: "https://www.facebook.com/",
};

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}


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
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EBE3D9] p-0.5 flex items-center justify-center group-hover:scale-105 transition-transform overflow-hidden shadow-xs">
                <img src="/logo.png" alt="KuttyStory Logo" className="w-full h-full object-contain" />
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
                <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#EBE3D9] bg-white p-0.5 shadow-2xs flex items-center justify-center">
                  <img src="/logo.png" alt="KuttyStory" className="w-full h-full object-contain" />
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

              {/* Social Media Links */}
              <div className="pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2D222A] block mb-2.5">
                  Follow & Connect
                </span>
                <div className="flex items-center gap-2.5">
                  <a
                    href={KUTTYSTORY_SOCIAL_LINKS.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram - Follow KuttyStory"
                    className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] hover:border-[#C98A84] text-[#695B64] hover:text-[#C98A84] flex items-center justify-center transition shadow-2xs hover:shadow-xs"
                    title="Instagram - Follow KuttyStory (Configurable in src/components/Layout.tsx)"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>

                  <a
                    href={KUTTYSTORY_SOCIAL_LINKS.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp - Chat with KuttyStory"
                    className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] hover:border-[#25D366] text-[#695B64] hover:text-[#25D366] flex items-center justify-center transition shadow-2xs hover:shadow-xs"
                    title="WhatsApp - Connect with KuttyStory (Configurable in src/components/Layout.tsx)"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>

                  <a
                    href={KUTTYSTORY_SOCIAL_LINKS.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook - Connect with KuttyStory"
                    className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] hover:border-[#1877F2] text-[#695B64] hover:text-[#1877F2] flex items-center justify-center transition shadow-2xs hover:shadow-xs"
                    title="Facebook - KuttyStory (Configurable in src/components/Layout.tsx)"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                </div>
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

            {/* Column 4: Share Feedback Form */}
            <div>
              <FooterFeedbackForm />
            </div>
          </div>


          <div className="mt-12 pt-6 border-t border-[#EBE3D9] flex flex-col sm:flex-row items-center justify-between text-xs text-[#695B64] gap-4">
            <div className="text-center sm:text-left leading-relaxed">
              <p>© 2026 Kutty Story. All Rights Reserved.</p>
              <p className="mt-0.5">
                Designed &amp; Developed by{" "}
                <a
                  href="https://izonetech.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#2D222A] hover:text-[#C98A84] underline underline-offset-2 transition-colors"
                >
                  iZone Technologies
                </a>
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-[11px] sm:text-xs">
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

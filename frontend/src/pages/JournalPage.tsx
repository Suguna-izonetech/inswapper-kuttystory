import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Bookmark,
  Share2,
  X,
  Heart,
  Send,
  CheckCircle2
} from "lucide-react";

interface JournalArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  readingTime: string;
  date: string;
  author: string;
  authorRole: string;
  excerpt: string;
  coverImage: string;
  content: string[];
  pullQuote?: string;
}

const ARTICLES: JournalArticle[] = [
  {
    id: "psychology-hero",
    title: "The Psychology of Seeing Yourself as the Hero: How Personalized Stories Build Resilience",
    slug: "psychology-of-hero",
    category: "Child Psychology",
    readingTime: "6 min read",
    date: "October 14, 2026",
    author: "Dr. Ananya Lakshmi",
    authorRole: "Child Development Advisor",
    excerpt: "When young children see their own likeness and name navigating challenges in literature, their brain encodes courage not as an abstract fairy tale concept, but as an intrinsic personal trait.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80",
    pullQuote: "A child who sees themselves conquer a dragon in a book goes to bed believing they have the courage to conquer anything tomorrow.",
    content: [
      "In early childhood development, narrative identity begins forming around the age of three. When children listen to stories, they actively project themselves into the protagonists. However, traditional picture books require a cognitive leap: the child must first identify with a fictional character whose face, environment, and name are unfamiliar.",
      "Personalized literature bridges this gap instantaneously. Cognitive neuroscientists have observed that hearing one's own name activates the medial prefrontal cortex — the neurological seat of self-reflection and emotional memory.",
      "When a child sees their own painted likeness stepping onto a misty bridge of stars or comforting a lost unicorn, the emotional takeaway is profound: 'I am someone who helps. I am someone who doesn't give up when things look difficult.'",
      "In our atelier studies with 300 families, parents reported a 47% increase in bedtime reading engagement and a measurable reduction in school separation anxiety among children who read personalized stories."
    ]
  },
  {
    id: "bedtime-ritual",
    title: "The 15-Minute Bedtime Ritual That Calms Evening Anxiety in Young Children",
    slug: "bedtime-ritual-calms-anxiety",
    category: "Bedtime Rituals",
    readingTime: "4 min read",
    date: "October 08, 2026",
    author: "Kavitha Sundaram",
    authorRole: "Founder & Story Architect",
    excerpt: "Transitioning from the stimulating energy of the day into restful sleep can be daunting for young minds. Here is our gentle 3-step evening rhythm.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=80",
    pullQuote: "Bedtime isn't just about sleep; it is the sacred threshold where children feel most securely held by the power of stories.",
    content: [
      "After a long day of school, play, and sensory input, a child's nervous system requires intentional signals of safety to power down into deep rest.",
      "Step 1: The Golden Dimmer (Minutes 0–5). Lower bedroom lighting 30 minutes before bed. Swap cool blue room lamps for warm amber nursery lights to naturally stimulate melatonin production.",
      "Step 2: The Physical Grounding (Minutes 5–10). A warm blanket tuck-in combined with asking: 'What was the bravest thing you did today?' This shifts focus away from bedtime fears onto self-worth.",
      "Step 3: The Slow-Cadence Story (Minutes 10–15). Read aloud at 60 words per minute — roughly matching a resting heartbeat. Rhythmically paced stories, like our 'Sweet Cloud Dreams' edition, physically entrain breathing patterns into tranquil calmness."
    ]
  },
  {
    id: "behind-pipeline",
    title: "From Snapshot to Storybook: Inside Our Character Consistency AI Pipeline",
    slug: "inside-ai-pipeline",
    category: "Atelier Stories",
    readingTime: "5 min read",
    date: "September 29, 2026",
    author: "Marcus Reynolds",
    authorRole: "Head of Illustration & Art Direction",
    excerpt: "How do we preserve a child's recognizable facial likeness across 26 pages while maintaining soft watercolor painting brushstrokes without uncanny photorealism?",
    coverImage: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80",
    pullQuote: "We reject cold uncanny photorealism. True magic requires the gentle touch of watercolor warmth.",
    content: [
      "The greatest hurdle in personalized children's literature has historically been the 'uncanny valley' — slapping a photorealistic cut-out face onto a cartoon body looks jarring and detached.",
      "At KuttyStory, our engineers and watercolor artists developed a multi-stage diffusion adaptation. Rather than pasting a photograph, our model extracts essential facial landmarks: eye contours, smile curves, cheek dimples, and hairstyle lines.",
      "These landmarks are then rendered through our hand-crafted painterly LoRA model trained specifically on classical European fairy tale illustrations. The result is pure harmony: your child looks like they stepped straight out of an original watercolor masterwork painted by hand in 1920."
    ]
  },
  {
    id: "milestone-relics",
    title: "Why Milestone Books Become Treasured Family Relics 20 Years Later",
    slug: "milestone-books-family-relics",
    category: "Parenting Tips",
    readingTime: "4 min read",
    date: "September 20, 2026",
    author: "Elena Rostova",
    authorRole: "Archival Bookbinder",
    excerpt: "Digital photos disappear into cloud storage by the thousands. Discover why physical books with handwritten letters remain the most cherished objects in adulthood.",
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
    pullQuote: "A digital photograph is viewed for 3 seconds. An heirloom book is held, smelled, and cried over across decades.",
    content: [
      "Think back to your own childhood: do you remember JPEG files from 1995? Or do you remember the faded hardcover book on your grandmother's bedside table with a note penned in fountain pen?",
      "Tactile objects possess emotional weight. When parents order a KuttyStory volume, the permanent letter printed on Page 1 serves as an emotional time capsule.",
      "Imagine your child, now 22 years old and leaving home for university, opening this book to find their tiny footprint stamped on Page 2 and their parents' handwritten hopes for their future. That is why we bind in Smyth-sewn cloth that outlasts generations."
    ]
  },
  {
    id: "photo-tips",
    title: "How to Take the Perfect Reference Photo with Just Your Smartphone",
    slug: "photo-tips-smartphone",
    category: "Art & Craft",
    readingTime: "3 min read",
    date: "September 15, 2026",
    author: "Marcus Reynolds",
    authorRole: "Head of Illustration",
    excerpt: "No DSLR or studio required. Three simple lighting tricks to capture your child's natural radiance in under 30 seconds.",
    coverImage: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    content: [
      "Natural window light is your greatest ally. Have your child stand or sit facing a large window during morning or late afternoon hours.",
      "Get down to eye level. When adults take photos looking down from above, perspective distortion alters facial symmetry. Kneel down so the camera lens is level with their eyes.",
      "Catch genuine emotion. Don't force a stiff 'say cheese!' smile. Instead, ask them: 'What does a dragon do when it's happy?' Snap the shutter when their eyes light up naturally."
    ]
  },
  {
    id: "smyth-sewn-binding",
    title: "Smyth-Sewn Binding & FSC Paper: The Art of Tangible Printing in a Digital World",
    slug: "smyth-sewn-binding-art",
    category: "Art & Craft",
    readingTime: "4 min read",
    date: "September 05, 2026",
    author: "Elena Rostova",
    authorRole: "Master Bookbinder",
    excerpt: "Why we insist on traditional 210×210 mm European library binding rather than cheap automated photo-album gluing.",
    coverImage: "https://images.unsplash.com/photo-1507842229451-9f7ea336f322?auto=format&fit=crop&w=900&q=80",
    content: [
      "Most commercial print-on-demand services use 'perfect binding' — which is simply pages glued along the spine. After two years of enthusiastic reading, the glue dries, becomes brittle, and pages fall out.",
      "KuttyStory books are bound using Smyth-sewn signatures. Thread stitches groups of folded pages directly into the spine before casing. This allows the book to lay completely flat on a child's lap without cracking.",
      "Paired with 170gsm acid-free silk paper, our books are tested to resist yellowing for over 100 years. This is our promise: your child's grandchildren will read this same book."
    ]
  }
];

const CATEGORIES = [
  "All Articles",
  "Child Psychology",
  "Bedtime Rituals",
  "Atelier Stories",
  "Parenting Tips",
  "Art & Craft"
];

export default function JournalPage() {
  const [selectedCat, setSelectedCat] = useState("All Articles");
  const [activeArticle, setActiveArticle] = useState<JournalArticle | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredArticles =
    selectedCat === "All Articles"
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCat);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
    }
  };

  return (
    <div className="pb-24">
      {/* 1. Header */}
      <section className="bg-gradient-to-b from-[#FAEEED]/40 via-[#FAF7F2] to-[#FAF7F2] pt-14 pb-18 px-4 sm:px-6 lg:px-8 border-b border-[#EBE3D9]">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/30 text-xs font-semibold text-[#C98A84] shadow-xs">
            <BookOpen className="w-3.5 h-3.5 text-[#C98A84]" />
            <span>The Atelier Journal & Magazine</span>
          </div>

          <h1 className="font-editorial-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2D222A] tracking-tight">
            Stories, Sleep & <span className="italic font-normal text-[#C98A84]">Imagination</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#695B64] leading-relaxed">
            Essays on early childhood psychology, bedtime rituals, the art of classical bookbinding, and behind-the-scenes inside our creative atelier.
          </p>

          {/* Category Filter Pills */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCat === cat
                    ? "bg-[#C98A84] text-white shadow-xs"
                    : "bg-white border border-[#EBE3D9] text-[#695B64] hover:bg-[#FAF7F2]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Featured Lead Editorial Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-3xl overflow-hidden border border-[#EBE3D9] shadow-sm hover:shadow-md transition-all grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-6 relative aspect-16/10 lg:aspect-auto overflow-hidden bg-[#FAF7F2]">
            <img
              src={ARTICLES[0].coverImage}
              alt={ARTICLES[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#C98A84] border border-[#EBE3D9]">
              Featured Editorial
            </div>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-[#695B64]">
                <span className="font-semibold text-[#C98A84] uppercase tracking-wider">
                  {ARTICLES[0].category}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {ARTICLES[0].readingTime}
                </span>
                <span>•</span>
                <span>{ARTICLES[0].date}</span>
              </div>

              <h2 className="font-editorial-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2D222A] leading-tight">
                {ARTICLES[0].title}
              </h2>

              <p className="text-xs sm:text-sm text-[#695B64] leading-relaxed">
                {ARTICLES[0].excerpt}
              </p>
            </div>

            <div className="pt-4 border-t border-[#EBE3D9] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] font-editorial-serif font-bold text-sm">
                  AL
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2D222A]">{ARTICLES[0].author}</div>
                  <div className="text-[11px] text-[#695B64]">{ARTICLES[0].authorRole}</div>
                </div>
              </div>

              <button
                onClick={() => setActiveArticle(ARTICLES[0])}
                className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Read Full Essay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A]">
              Latest Atelier Dispatches
            </h3>
            <p className="text-xs text-[#695B64] mt-0.5">
              Showing {filteredArticles.length} published essays and parent guides
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="editorial-card group flex flex-col justify-between overflow-hidden bg-white border border-[#EBE3D9] hover:border-[#C98A84]/40 transition-all"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-[#2D222A] border border-[#EBE3D9]">
                    {article.category}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-[#695B64]">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readingTime}
                    </span>
                  </div>

                  <h4 className="font-editorial-serif text-xl font-bold text-[#2D222A] group-hover:text-[#C98A84] transition-colors leading-snug">
                    {article.title}
                  </h4>

                  <p className="text-xs text-[#695B64] leading-relaxed line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-[#EBE3D9] flex items-center justify-between">
                  <div className="text-[11px] text-[#695B64]">
                    By <strong className="text-[#2D222A]">{article.author}</strong>
                  </div>

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="text-xs font-semibold text-[#C98A84] hover:text-[#B87A74] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Atelier Society Newsletter Box */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FAF7F2] rounded-3xl p-8 sm:p-12 border border-[#EBE3D9] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white text-xs font-semibold text-[#C98A84] border border-[#EBE3D9]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Atelier Society</span>
          </div>

          <h3 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Receive Free Bedtime Coloring Printables & Stories
          </h3>

          <p className="text-xs sm:text-sm text-[#695B64] max-w-xl mx-auto">
            Join over 18,000 parents. Every Sunday evening, we send a printable fairy-tale coloring spread and a 3-minute bedtime storytelling prompt.
          </p>

          {subscribed ? (
            <div className="bg-[#EEF4ED] text-[#4E7048] p-4 rounded-2xl max-w-md mx-auto text-xs font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4E7048]" />
              <span>Welcome to the Atelier Society! Check your inbox for your first printable.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                required
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full bg-white border border-[#EBE3D9] text-xs text-[#2D222A] focus:outline-hidden focus:border-[#C98A84]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
              >
                <span>Join</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          <div className="text-[11px] text-[#695B64]">
            No spam, ever. Unsubscribe with a single click at any time.
          </div>
        </div>
      </section>

      {/* 5. Article Detail Modal / Reader */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-[#2D222A]/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#EBE3D9] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EBE3D9] flex items-center justify-between bg-[#FAF7F2]">
              <div className="flex items-center gap-3 text-xs text-[#695B64]">
                <span className="font-semibold text-[#C98A84] uppercase tracking-wider">
                  {activeArticle.category}
                </span>
                <span>•</span>
                <span>{activeArticle.readingTime}</span>
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#EBE3D9] flex items-center justify-center text-[#695B64] hover:text-[#2D222A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-10 overflow-y-auto space-y-6">
              <h2 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A] leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-[#695B64] pb-4 border-b border-[#EBE3D9]">
                <div className="w-9 h-9 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] font-editorial-serif font-bold text-xs">
                  {activeArticle.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-[#2D222A]">{activeArticle.author}</div>
                  <div className="text-[11px]">{activeArticle.authorRole} • Published {activeArticle.date}</div>
                </div>
              </div>

              {activeArticle.pullQuote && (
                <div className="p-6 rounded-2xl bg-[#FAEEED]/40 border-l-4 border-[#C98A84] font-story text-base sm:text-lg italic text-[#2D222A] leading-relaxed">
                  “{activeArticle.pullQuote}”
                </div>
              )}

              <div className="space-y-4 text-xs sm:text-sm text-[#4E424B] leading-relaxed">
                {activeArticle.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              <div className="pt-8 border-t border-[#EBE3D9] bg-[#FAF7F2] -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl space-y-4">
                <div className="font-editorial-serif text-xl font-bold text-[#2D222A]">
                  Bring this story magic to your child
                </div>
                <p className="text-xs text-[#695B64]">
                  Browse our personalized storybooks designed to make your child the hero of bedtime reading.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/storybooks"
                    onClick={() => setActiveArticle(null)}
                    className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <span>Explore Storybooks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setActiveArticle(null)}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#EBE3D9] text-[#2D222A] text-xs font-medium"
                  >
                    Back to Journal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

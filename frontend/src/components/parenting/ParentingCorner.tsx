import { useState, useEffect, useMemo } from "react";
import {
  Heart,
  Search,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Users,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  X,
  Layers,
  ArrowRight
} from "lucide-react";
import {
  ActivityCategory,
  PARENTING_CHALLENGES,
  PARENTING_MYTHS_FACTS,
  PARENT_CHILD_BONDING_ACTIVITIES
} from "@/data/parentingActivitiesData";
import {
  getParentingProgressSummary,
  getCompletedChallenges,
  getMythHistory,
  getFavoriteActivities,
  resetAllParentingProgress,
  PARENTING_STORAGE_EVENT,
  ParentingProgressSummary
} from "@/lib/parentingStorage";
import ParentingQuizSection from "./ParentingQuizSection";
import ParentingChallengeCard from "./ParentingChallengeCard";
import ParentingMythFactCard from "./ParentingMythFactCard";
import ParentingBondingCard from "./ParentingBondingCard";

export default function ParentingCorner() {
  // By default, show Daily Quizzes. User selects KPI cards to view other activities.
  const [activeCategory, setActiveCategory] = useState<ActivityCategory>("quiz");
  const [searchQuery, setSearchQuery] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [stats, setStats] = useState<ParentingProgressSummary>(() =>
    getParentingProgressSummary(PARENTING_CHALLENGES.length)
  );
  const [completedChallenges, setCompletedChallenges] = useState<string[]>(() =>
    getCompletedChallenges()
  );
  const [mythHistory, setMythHistory] = useState(() => getMythHistory());
  const [favoriteActivities, setFavoriteActivities] = useState(() => getFavoriteActivities());

  // Listen for storage updates
  useEffect(() => {
    const refreshData = () => {
      setStats(getParentingProgressSummary(PARENTING_CHALLENGES.length));
      setCompletedChallenges(getCompletedChallenges());
      setMythHistory(getMythHistory());
      setFavoriteActivities(getFavoriteActivities());
    };

    window.addEventListener(PARENTING_STORAGE_EVENT, refreshData);
    return () => window.removeEventListener(PARENTING_STORAGE_EVENT, refreshData);
  }, []);

  const handleResetProgress = () => {
    resetAllParentingProgress();
    setShowResetConfirm(false);
  };

  const handleSelectCategory = (cat: ActivityCategory) => {
    setActiveCategory(cat);
  };

  // ── FILTERING LOGIC (NO AGE RESTRICTIONS) ──
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredChallenges = useMemo(() => {
    return PARENTING_CHALLENGES.filter((item) => {
      return (
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.summary.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const filteredMyths = useMemo(() => {
    return PARENTING_MYTHS_FACTS.filter((item) => {
      return (
        !normalizedQuery ||
        item.statement.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.explanation.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  const filteredBonding = useMemo(() => {
    return PARENT_CHILD_BONDING_ACTIVITIES.filter((item) => {
      return (
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.overview.toLowerCase().includes(normalizedQuery) ||
        item.materialsNeeded.some((m) => m.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [normalizedQuery]);

  const totalResultsCount =
    activeCategory === "quiz"
      ? 1
      : activeCategory === "challenge"
      ? filteredChallenges.length
      : activeCategory === "myth_fact"
      ? filteredMyths.length
      : filteredBonding.length;

  // 4 KPI Cards: Daily Quizzes, Daily Challenges, Myth or Fact, Bonding Activities
  const kpiCards: Array<{
    id: ActivityCategory;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    badgeColor: string;
    value: string;
    subtext: string;
    countLabel: string;
  }> = [
    {
      id: "quiz",
      title: "Daily Quizzes",
      icon: Trophy,
      iconColor: "text-amber-500",
      badgeColor: "bg-amber-50 text-amber-700",
      value: stats.quizzesTaken > 0 ? `${stats.quizzesTaken} Completed` : "Ready to Start",
      subtext: stats.bestQuizScore !== null ? `Best Score: ${stats.bestQuizScore}%` : "5 Qs per session",
      countLabel: "Interactive"
    },
    {
      id: "challenge",
      title: "Daily Challenges",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      badgeColor: "bg-emerald-50 text-emerald-700",
      value: `${stats.completedChallengesCount} / ${stats.totalChallengesCount}`,
      subtext:
        stats.completedChallengesCount > 0
          ? `${Math.round((stats.completedChallengesCount / stats.totalChallengesCount) * 100)}% Complete`
          : "8 Daily habits",
      countLabel: "8 Tasks"
    },
    {
      id: "myth_fact",
      title: "Myth or Fact",
      icon: Lightbulb,
      iconColor: "text-purple-500",
      badgeColor: "bg-purple-50 text-purple-700",
      value: `${stats.mythsExploredCount} / ${PARENTING_MYTHS_FACTS.length}`,
      subtext: "Science & evidence",
      countLabel: "12 Cards"
    },
    {
      id: "bonding",
      title: "Bonding Activities",
      icon: Users,
      iconColor: "text-rose-500",
      badgeColor: "bg-rose-50 text-rose-700",
      value: `${PARENT_CHILD_BONDING_ACTIVITIES.length} Games`,
      subtext:
        favoriteActivities.length > 0
          ? `${favoriteActivities.length} bookmarked`
          : "Creative rituals",
      countLabel: "14 Ideas"
    }
  ];

  return (
    <section className="space-y-10">
      {/* ── 1. WELCOME HEADER ── */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C98A84]/40 text-xs font-bold text-[#C98A84] shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-[#C98A84] text-[#C98A84] animate-pulse" />
          <span>Little Authors Atelier • Mindful Caregiver Hub</span>
        </div>

        <h2 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D222A] tracking-tight">
          Parenting Corner 💕
        </h2>

        <p className="text-xs sm:text-sm text-[#695B64] max-w-2xl mx-auto leading-relaxed">
          Mindful parenting quizzes, daily connection challenges, evidence-based myth busters,
          and joyful bonding rituals. Crafted to support parents raising empathetic, confident young storytellers.
        </p>

        {/* Local Storage Privacy Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#EBE3D9] text-[11px] text-[#695B64]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Progress & scores are securely saved in your browser • No account or login required</span>
        </div>
      </div>

      {/* ── 2. INTERACTIVE KPI CARDS ── */}
      <div className="space-y-3 max-w-5xl mx-auto">
        <div className="flex items-center justify-between text-xs text-[#695B64] px-1">
          <span className="font-bold text-[#2D222A] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#C98A84]" />
            <span>Select an Activity:</span>
          </span>
          {(stats.quizzesTaken > 0 ||
            stats.completedChallengesCount > 0 ||
            stats.mythsExploredCount > 0) && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-[11px] text-[#695B64] hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset my progress</span>
            </button>
          )}
        </div>

        {/* The 4 Clickable KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {kpiCards.map((card) => {
            const Icon = card.icon;
            const isSelected = activeCategory === card.id;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleSelectCategory(card.id)}
                className={`group relative text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? "bg-white border-[#C98A84] ring-2 ring-[#C98A84]/40 shadow-md scale-[1.02]"
                    : "bg-white/90 border-[#EBE3D9] hover:border-[#C98A84]/60 hover:bg-white hover:shadow-xs"
                }`}
              >
                {/* Active Indicator Top Tag */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${card.iconColor}`} />
                    <span className="text-xs font-bold text-[#2D222A]">
                      {card.title}
                    </span>
                  </div>

                  {isSelected ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#C98A84] text-white text-[9px] font-bold uppercase tracking-wider animate-in fade-in duration-150">
                      Active
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${card.badgeColor}`}
                    >
                      {card.countLabel}
                    </span>
                  )}
                </div>

                {/* Main KPI Stat */}
                <div>
                  <div
                    className={`text-lg sm:text-xl font-extrabold tracking-tight transition-colors ${
                      isSelected ? "text-[#C98A84]" : "text-[#2D222A]"
                    }`}
                  >
                    {card.value}
                  </div>
                  <div className="text-[11px] text-[#695B64] font-medium mt-0.5">
                    {card.subtext}
                  </div>
                </div>

                {/* Bottom hint */}
                <div className="pt-2 border-t border-[#EBE3D9]/60 flex items-center justify-between text-[10px]">
                  <span
                    className={
                      isSelected
                        ? "font-bold text-[#C98A84]"
                        : "text-[#695B64] group-hover:text-[#2D222A]"
                    }
                  >
                    {isSelected ? "● Viewing now" : "Select activity"}
                  </span>
                  <ArrowRight
                    className={`w-3 h-3 transition-transform ${
                      isSelected
                        ? "text-[#C98A84] translate-x-0.5"
                        : "text-[#695B64] group-hover:translate-x-0.5"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. SEARCH BAR ── */}
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 text-[#695B64] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeCategory === "quiz"
                ? "Search parenting topics (e.g. bedtime, tantrums, praise)..."
                : activeCategory === "challenge"
                ? "Search daily challenges (e.g. listening, gratitude, pause)..."
                : activeCategory === "myth_fact"
                ? "Search myths & facts (e.g. screen time, brain, reading)..."
                : "Search bonding games (e.g. storytelling, drawing, fort)..."
            }
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-[#EBE3D9] focus:border-[#C98A84] focus:ring-2 focus:ring-[#C98A84]/20 text-xs sm:text-sm text-[#2D222A] outline-none shadow-xs transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── 4. ACTIVE ACTIVITY SECTION (ONLY THE SELECTED CARD IS SHOWN) ── */}

      {/* Empty State */}
      {totalResultsCount === 0 && (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#EBE3D9] p-8 space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84] mx-auto text-2xl">
            🔍
          </div>
          <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
            No matching activities found
          </h3>
          <p className="text-xs text-[#695B64] leading-relaxed">
            We couldn't find any activities matching "{searchQuery}" in{" "}
            {kpiCards.find((c) => c.id === activeCategory)?.title}.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="px-5 py-2.5 rounded-full bg-[#C98A84] text-white text-xs font-semibold hover:bg-[#B87A74] cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* 1. DAILY PARENTING QUIZ (SHOWN BY DEFAULT) */}
      {activeCategory === "quiz" && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EBE3D9] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                <Trophy className="w-4 h-4 text-[#C98A84]" />
                <span>Interactive Growth</span>
              </div>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] mt-1">
                Daily Parenting Quiz
              </h3>
            </div>
            <p className="text-xs text-[#695B64]">
              5 bite-sized questions per round • Instant feedback & child psychology insights
            </p>
          </div>

          <ParentingQuizSection />
        </div>
      )}

      {/* 2. POSITIVE PARENTING CHALLENGES */}
      {activeCategory === "challenge" && filteredChallenges.length > 0 && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EBE3D9] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                <CheckCircle2 className="w-4 h-4 text-[#C98A84]" />
                <span>Daily Habits</span>
              </div>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] mt-1">
                Positive Parenting Challenges
              </h3>
            </div>
            <p className="text-xs text-[#695B64]">
              Micro-actions for connection • Saved automatically in your browser ({filteredChallenges.length} tasks)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredChallenges.map((challenge) => (
              <ParentingChallengeCard
                key={challenge.id}
                challenge={challenge}
                isCompleted={completedChallenges.includes(challenge.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. PARENTING MYTH OR FACT */}
      {activeCategory === "myth_fact" && filteredMyths.length > 0 && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EBE3D9] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                <HelpCircle className="w-4 h-4 text-[#C98A84]" />
                <span>Evidence-Based Truths</span>
              </div>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] mt-1">
                Parenting Myth or Fact
              </h3>
            </div>
            <p className="text-xs text-[#695B64]">
              Test your knowledge of child neuroscience & developmental facts ({filteredMyths.length} cards)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredMyths.map((item) => (
              <ParentingMythFactCard
                key={item.id}
                item={item}
                initialUserChoiceFact={mythHistory[item.id]?.userChoiceFact}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. PARENT–CHILD BONDING ACTIVITIES */}
      {activeCategory === "bonding" && filteredBonding.length > 0 && (
        <div className="space-y-6 pt-2 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#EBE3D9] pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C98A84]">
                <Users className="w-4 h-4 text-[#C98A84]" />
                <span>Creative Connection</span>
              </div>
              <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#2D222A] mt-1">
                Parent–Child Bonding Activities
              </h3>
            </div>
            <p className="text-xs text-[#695B64]">
              Storytelling games, drawing prompts, and screen-free memory makers ({filteredBonding.length} ideas)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredBonding.map((activity) => (
              <ParentingBondingCard
                key={activity.id}
                activity={activity}
                isFavorite={favoriteActivities.includes(activity.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── 5. RESET CONFIRMATION MODAL ── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-[#2D222A]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#EBE3D9] shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Reset All Progress?
              </h3>
              <p className="text-xs text-[#695B64] leading-relaxed">
                This will clear your quiz history, completed daily challenges, and saved responses
                stored in this browser. You can always start fresh!
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2.5 rounded-full border border-[#EBE3D9] bg-white text-xs font-semibold text-[#2D222A] hover:bg-[#FAF7F2] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetProgress}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

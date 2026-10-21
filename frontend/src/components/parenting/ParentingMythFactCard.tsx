import { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Sparkles,
  RotateCcw
} from "lucide-react";
import { ParentingMythFact } from "@/data/parentingActivitiesData";
import { saveMythAnswer } from "@/lib/parentingStorage";

interface ParentingMythFactCardProps {
  item: ParentingMythFact;
  initialUserChoiceFact?: boolean;
  onAnswerSaved?: () => void;
}

export default function ParentingMythFactCard({
  item,
  initialUserChoiceFact,
  onAnswerSaved
}: ParentingMythFactCardProps) {
  const [userChoice, setUserChoice] = useState<boolean | undefined>(initialUserChoiceFact);

  const handleChoose = (choice: boolean) => {
    setUserChoice(choice);
    const isCorrect = choice === item.isFact;
    saveMythAnswer(item.id, choice, isCorrect);
    if (onAnswerSaved) onAnswerSaved();
  };

  const handleReset = () => {
    setUserChoice(undefined);
  };

  const hasAnswered = userChoice !== undefined;
  const isCorrect = userChoice === item.isFact;

  return (
    <div
      className={`editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all duration-300 ${
        hasAnswered
          ? isCorrect
            ? "border-emerald-200 bg-emerald-50/15"
            : "border-amber-200 bg-amber-50/15"
          : "hover:border-[#C98A84]/60"
      }`}
    >
      {/* Header tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] font-bold text-[10px] uppercase">
              {item.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EBE3D9] text-[#695B64] text-[10px] font-medium">
              {item.ageGroup === "all" ? "All Ages" : `Ages ${item.ageGroup}`}
            </span>
          </div>

          <div className="text-[11px] font-semibold text-[#695B64] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#C98A84]" />
            <span>Myth or Fact?</span>
          </div>
        </div>

        {/* Statement */}
        <h3 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#2D222A] leading-snug">
          "{item.statement}"
        </h3>
      </div>

      {/* Choice Buttons */}
      {!hasAnswered ? (
        <div className="pt-2">
          <div className="text-xs font-semibold text-[#695B64] mb-2.5">
            What does developmental science say?
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChoose(false)}
              className="py-3 px-4 rounded-xl border-2 border-rose-200 bg-white hover:bg-rose-50 text-rose-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.02]"
            >
              <span>❌</span>
              <span>It's a Myth</span>
            </button>

            <button
              type="button"
              onClick={() => handleChoose(true)}
              className="py-3 px-4 rounded-xl border-2 border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.02]"
            >
              <span>✅</span>
              <span>It's a Fact</span>
            </button>
          </div>
        </div>
      ) : (
        /* Revealed Answer & Explanation */
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EBE3D9] space-y-3 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  item.isFact
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}
              >
                {item.isFact ? "✅ VERIFIED FACT" : "❌ POPULAR MYTH"}
              </span>

              <span className="text-xs font-bold flex items-center gap-1">
                {isCorrect ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>You were right!</span>
                  </span>
                ) : (
                  <span className="text-amber-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Surprising truth!</span>
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-[#695B64] hover:text-[#2D222A] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>

          <p className="text-xs text-[#4E424B] leading-relaxed">
            {item.explanation}
          </p>

          <div className="p-3 rounded-xl bg-[#FAEEED]/60 border border-[#C98A84]/20 flex items-start gap-2 text-xs">
            <Lightbulb className="w-3.5 h-3.5 text-[#C98A84] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-[#2D222A]">Key Takeaway: </span>
              <span className="text-[#4E424B]">{item.keyTakeaway}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

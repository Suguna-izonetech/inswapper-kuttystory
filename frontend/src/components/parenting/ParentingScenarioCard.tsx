import { useState } from "react";
import {
  Lightbulb,
  Heart,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Sparkles,
  Check,
  RotateCcw
} from "lucide-react";
import { ParentingScenario } from "@/data/parentingActivitiesData";
import { saveScenarioAnswer } from "@/lib/parentingStorage";

interface ParentingScenarioCardProps {
  scenario: ParentingScenario;
  initialSelectedOption?: number;
  onAnswerSaved?: () => void;
}

export default function ParentingScenarioCard({
  scenario,
  initialSelectedOption,
  onAnswerSaved
}: ParentingScenarioCardProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | undefined>(initialSelectedOption);
  const [showChildThought, setShowChildThought] = useState(false);

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx);
    saveScenarioAnswer(scenario.id, idx);
    if (onAnswerSaved) onAnswerSaved();
  };

  const handleReset = () => {
    setSelectedIdx(undefined);
  };

  const selectedChoice = selectedIdx !== undefined ? scenario.options[selectedIdx] : null;

  return (
    <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-5 transition-all duration-300 hover:border-[#C98A84]/60">
      {/* Header tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] font-bold text-[10px] uppercase">
              {scenario.topic}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EBE3D9] text-[#695B64] text-[10px] font-medium">
              {scenario.ageGroup === "all" ? "All Ages" : `Ages ${scenario.ageGroup}`}
            </span>
          </div>

          {selectedIdx !== undefined && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Explored</span>
            </span>
          )}
        </div>

        <h3 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#2D222A]">
          {scenario.title}
        </h3>
      </div>

      {/* Situation narrative */}
      <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D9] text-xs sm:text-[13px] text-[#4E424B] leading-relaxed italic">
        "{scenario.situation}"
      </div>

      {/* Child's inner perspective toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowChildThought((prev) => !prev)}
          className="w-full flex items-center justify-between text-left text-xs font-semibold text-[#C98A84] hover:text-[#B87A74] py-1 cursor-pointer transition"
        >
          <span className="flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>What your child is quietly feeling inside...</span>
          </span>
          {showChildThought ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showChildThought && (
          <div className="mt-2 p-3.5 rounded-xl bg-[#FAEEED]/70 border border-[#C98A84]/25 text-xs text-[#2D222A] leading-relaxed animate-in fade-in duration-200 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#C98A84]">
              Child's Perspective
            </div>
            <p className="italic">"{scenario.childPerspective}"</p>
          </div>
        )}
      </div>

      {/* Question prompt & Options */}
      <div className="space-y-3 pt-1">
        <div className="text-xs font-bold text-[#2D222A] flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#C98A84]" />
          <span>How would you navigate this moment?</span>
        </div>

        <div className="space-y-2.5">
          {scenario.options.map((option, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs transition-all duration-200 cursor-pointer flex items-start gap-2.5 ${
                  isSelected
                    ? "border-[#C98A84] bg-[#FAEEED]/70 text-[#2D222A] font-semibold ring-2 ring-[#C98A84]/30 shadow-xs"
                    : "border-[#EBE3D9] bg-white hover:bg-[#FAF7F2] text-[#4E424B]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? "bg-[#C98A84] text-white"
                      : "bg-[#FAF7F2] border border-[#EBE3D9] text-[#695B64]"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="flex-1 leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Supportive Feedback & Practical Tip */}
      {selectedChoice && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-[#FAEEED]/50 border border-amber-200/80 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Supportive Reflection</span>
            </div>
            <p className="text-xs text-[#4E424B] leading-relaxed">
              {selectedChoice.feedback}
            </p>
          </div>

          <div className="pt-2 border-t border-amber-200/50 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C98A84]">
              <Lightbulb className="w-3.5 h-3.5 text-[#C98A84]" />
              <span>Practical Parenting Tip</span>
            </div>
            <p className="text-xs text-[#2D222A] font-medium leading-relaxed">
              {selectedChoice.parentingTip}
            </p>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-[#695B64] hover:text-[#2D222A] flex items-center gap-1 cursor-pointer transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Explore another response</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

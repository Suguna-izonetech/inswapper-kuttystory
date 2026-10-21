import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Play
} from "lucide-react";
import { ParentingChallenge } from "@/data/parentingActivitiesData";
import { toggleChallengeCompletion } from "@/lib/parentingStorage";

interface ParentingChallengeCardProps {
  challenge: ParentingChallenge;
  isCompleted: boolean;
  onToggled?: () => void;
}

export default function ParentingChallengeCard({
  challenge,
  isCompleted,
  onToggled
}: ParentingChallengeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    toggleChallengeCompletion(challenge.id);
    if (onToggled) onToggled();
  };

  return (
    <div
      className={`editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-4 transition-all duration-300 ${
        isCompleted
          ? "border-emerald-300 bg-emerald-50/20 shadow-xs"
          : "hover:border-[#C98A84]/60"
      }`}
    >
      {/* Header tags */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] font-bold text-[10px] uppercase">
              {challenge.badge}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#695B64] font-medium">
              <Clock className="w-3 h-3 text-[#C98A84]" />
              <span>{challenge.estimatedTime}</span>
            </span>
          </div>

          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300 animate-in fade-in duration-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed!</span>
            </span>
          )}
        </div>

        <h3 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#2D222A]">
          {challenge.title}
        </h3>

        <p className="text-xs text-[#695B64] leading-relaxed">
          {challenge.summary}
        </p>
      </div>

      {/* Expandable step-by-step instructions */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-semibold text-[#C98A84] hover:text-[#B87A74] flex items-center gap-1 cursor-pointer transition py-1"
        >
          <span>{expanded ? "Hide instructions" : "View step-by-step instructions"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-3 text-xs text-[#4E424B] animate-in fade-in duration-200">
            <div className="font-bold text-[#2D222A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C98A84]" />
              <span>How to Practice:</span>
            </div>
            <ol className="space-y-1.5 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
              {challenge.instructions.map((step, idx) => (
                <li key={idx} className="text-[#4E424B]">
                  {step}
                </li>
              ))}
            </ol>

            <div className="pt-2 border-t border-[#EBE3D9] space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C98A84]">
                Why this builds connection
              </div>
              <p className="text-[11px] text-[#695B64] italic">
                {challenge.whyItWorks}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-2 border-t border-[#EBE3D9] flex items-center justify-between gap-3">
        {!expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs font-semibold text-[#695B64] hover:text-[#2D222A] flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-3 h-3 text-[#C98A84]" />
            <span>Start Challenge</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleToggle}
          className={`ml-auto px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
            isCompleted
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
              : "bg-[#C98A84] hover:bg-[#B87A74] text-white shadow-xs"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isCompleted ? "Completed (Tap to undo)" : "Mark as Completed"}</span>
        </button>
      </div>
    </div>
  );
}

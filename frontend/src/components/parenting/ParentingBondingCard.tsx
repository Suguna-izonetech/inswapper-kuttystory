import { useState } from "react";
import {
  Clock,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  Palette,
  BookOpen,
  MessageSquare,
  Users
} from "lucide-react";
import { ParentingBondingActivity } from "@/data/parentingActivitiesData";
import { toggleFavoriteActivity } from "@/lib/parentingStorage";

interface ParentingBondingCardProps {
  activity: ParentingBondingActivity;
  isFavorite: boolean;
  onFavoriteToggled?: () => void;
}

export default function ParentingBondingCard({
  activity,
  isFavorite,
  onFavoriteToggled
}: ParentingBondingCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteActivity(activity.id);
    if (onFavoriteToggled) onFavoriteToggled();
  };

  const getTypeIcon = () => {
    switch (activity.type) {
      case "storytelling":
        return <BookOpen className="w-3.5 h-3.5 text-[#C98A84]" />;
      case "drawing":
        return <Palette className="w-3.5 h-3.5 text-[#C98A84]" />;
      case "conversation":
        return <MessageSquare className="w-3.5 h-3.5 text-[#C98A84]" />;
      case "creative":
        return <Sparkles className="w-3.5 h-3.5 text-[#C98A84]" />;
      case "family":
      default:
        return <Users className="w-3.5 h-3.5 text-[#C98A84]" />;
    }
  };

  return (
    <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-[#C98A84]/60 transition-all duration-300">
      {/* Header tags & favorite button */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAEEED] text-[#C98A84] font-bold text-[10px] uppercase">
              {getTypeIcon()}
              <span>{activity.badge}</span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EBE3D9] text-[#695B64] text-[10px] font-medium">
              {activity.ageGroup === "all" ? "All Ages" : `Ages ${activity.ageGroup}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleFavorite}
            className={`p-2 rounded-full border transition cursor-pointer ${
              isFavorite
                ? "bg-rose-50 text-rose-600 border-rose-200"
                : "bg-white text-gray-400 border-[#EBE3D9] hover:text-rose-500 hover:border-rose-200"
            }`}
            title={isFavorite ? "Remove from favorites" : "Save to favorites"}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
          </button>
        </div>

        <h3 className="font-editorial-serif text-lg sm:text-xl font-bold text-[#2D222A]">
          {activity.title}
        </h3>

        <div className="flex items-center gap-3 text-[11px] text-[#695B64]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#C98A84]" />
            <span>{activity.estimatedDuration}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#C98A84]" />
            <span>{activity.materialsNeeded.join(", ")}</span>
          </span>
        </div>

        <p className="text-xs text-[#4E424B] leading-relaxed pt-1">
          {activity.overview}
        </p>
      </div>

      {/* Expandable Step-by-Step Instructions */}
      <div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-semibold text-[#C98A84] hover:text-[#B87A74] flex items-center gap-1 cursor-pointer transition py-1"
        >
          <span>{expanded ? "Hide steps" : "View step-by-step game guide"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-3 text-xs text-[#4E424B] animate-in fade-in duration-200">
            <div className="font-bold text-[#2D222A] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C98A84]" />
              <span>Step-by-Step Steps:</span>
            </div>

            <ol className="space-y-2 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
              {activity.stepByStep.map((step, idx) => (
                <li key={idx} className="text-[#4E424B]">
                  {step}
                </li>
              ))}
            </ol>

            <div className="pt-2 border-t border-[#EBE3D9] space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#C98A84]">
                Developmental Benefit
              </div>
              <p className="text-[11px] text-[#695B64] italic">
                {activity.developmentalBenefit}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer materials pill */}
      <div className="pt-2 border-t border-[#EBE3D9] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-[#695B64] font-medium mr-1">Materials:</span>
          {activity.materialsNeeded.map((mat, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#EBE3D9] text-[#695B64]"
            >
              {mat}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-xs font-bold text-[#C98A84] hover:text-[#B87A74] cursor-pointer"
        >
          {expanded ? "Close" : "Try This Today →"}
        </button>
      </div>
    </div>
  );
}

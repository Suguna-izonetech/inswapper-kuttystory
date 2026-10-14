import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export interface PersonalizationRoadmapProps {
  currentStep?: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  // Optional props for backward compatibility
  storyTitle?: string;
  storyCoverUrl?: string;
  childName?: string;
  isGenerating?: boolean;
  isCompleted?: boolean;
}

export default function PersonalizationRoadmap({
  currentStep = 2,
  onStepClick,
}: PersonalizationRoadmapProps) {
  const navigate = useNavigate();

  const steps = [
    { number: 1, label: "Select Story", targetHref: "/#stories", targetId: "" },
    { number: 2, label: "Upload Photo", targetHref: "", targetId: "photo-upload-section" },
    { number: 3, label: "Preview", targetHref: "", targetId: "book-review-section" },
  ];

  // Progress percentage between step 1 (0%), step 2 (50%), and step 3 (100%)
  const progressPercentage =
    currentStep === 1 ? 0 : currentStep === 2 ? 50 : 100;

  const handleStepClick = (stepNum: 1 | 2 | 3, targetHref: string, targetId: string) => {
    if (onStepClick) {
      onStepClick(stepNum);
      return;
    }
    if (targetHref) {
      navigate(targetHref);
    } else if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-4 sm:px-8">
      <div className="relative flex items-center justify-between">
        {/* Continuous Background Track Line */}
        <div className="absolute top-[22px] left-[28px] right-[28px] -translate-y-1/2 h-[2px] bg-[#E2E8F0] z-0" />

        {/* Animated Purple Progress Fill Track */}
        <div
          className="absolute top-[22px] left-[28px] -translate-y-1/2 h-[2.5px] bg-gradient-to-r from-[#8B5CF6] via-[#9333EA] to-[#A855F7] z-0 transition-all duration-700 ease-in-out shadow-xs"
          style={{
            width: `calc(${progressPercentage}% * (100% - 56px) / 100)`,
          }}
        >
          {/* Subtle animated moving glow pulse at the tip */}
          {progressPercentage > 0 && progressPercentage < 100 && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white ring-2 ring-[#8B5CF6] animate-ping" />
          )}
        </div>

        {/* 3 Step Milestones (1. Select Story, 2. Upload Photo, 3. Preview) */}
        {steps.map((step) => {
          const stepNum = step.number as 1 | 2 | 3;
          const isActive = currentStep === stepNum;
          const isDone = currentStep > stepNum;

          return (
            <div
              key={step.number}
              onClick={() => handleStepClick(stepNum, step.targetHref, step.targetId)}
              className="relative z-10 flex flex-col items-center group cursor-pointer select-none"
            >
              {/* Milestone Circle */}
              <div
                className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 transform group-hover:scale-105 ${
                  isActive
                    ? "bg-[#8B5CF6] text-white shadow-md shadow-purple-500/30 scale-105 ring-4 ring-[#8B5CF6]/20 animate-pulse"
                    : isDone
                    ? "bg-[#8B5CF6] text-white shadow-xs"
                    : "bg-white border-2 border-[#E2E8F0] text-[#94A3B8] hover:border-[#CBD5E1]"
                }`}
              >
                {/* Completed Checkmark or Step Number */}
                {isDone ? (
                  <Check className="w-5 h-5 stroke-[2.5] animate-in zoom-in-50 duration-200" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>

              {/* Step Label Underneath */}
              <span
                className={`mt-2 text-xs sm:text-sm font-semibold tracking-tight whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? "text-[#1E1B4B] font-bold"
                    : isDone
                    ? "text-[#6B21A8] font-semibold"
                    : "text-[#94A3B8] font-medium group-hover:text-[#64748B]"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

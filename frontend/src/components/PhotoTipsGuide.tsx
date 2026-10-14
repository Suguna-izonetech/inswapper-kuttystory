import { useState, useRef } from "react";
import { Upload, Camera, Sparkles, Check, X, Info } from "lucide-react";

export interface PhotoTipsGuideProps {
  onPhotoSelected: (file: File) => void;
  onActivateCamera?: () => void;
  isProcessing?: boolean;
}

export default function PhotoTipsGuide({
  onPhotoSelected,
  onActivateCamera,
  isProcessing = false,
}: PhotoTipsGuideProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tips = [
    {
      id: "good",
      image: "/tips/tip_good.jpg",
      label: "Clear front-facing photo",
      isValid: true,
    },
    {
      id: "eating",
      image: "/tips/tip_eating.jpg",
      label: "No eating or covered face",
      isValid: false,
    },
    {
      id: "accessories",
      image: "/tips/tip_accessories.jpg",
      label: "No accessories",
      isValid: false,
    },
    {
      id: "far_away",
      image: "/tips/tip_far_away.jpg",
      label: "No far away or side angle",
      isValid: false,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onPhotoSelected(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPhotoSelected(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-3xl border-2 transition-all p-6 sm:p-8 bg-white shadow-sm relative overflow-hidden ${
        isDragging
          ? "border-[#8B5CF6] bg-[#F5F3FF]/60 ring-4 ring-[#8B5CF6]/20"
          : "border-[#E8E1F5] hover:border-[#D8B4FE]"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* TOP HEADER: T I P S (Exactly matching Image 2) */}
      <div className="text-center mb-6">
        <h3 className="text-sm font-bold tracking-[0.3em] uppercase text-[#1E1B4B]">
          T I P S
        </h3>
        <p className="text-[11px] text-[#695B64] mt-1">
          Follow these photo guidelines for crisp, beautiful character likeness
        </p>
      </div>

      {/* 4 CIRCULAR COMPARISONS (Matching Image 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto mb-8">
        {tips.map((tip) => (
          <div key={tip.id} className="flex flex-col items-center text-center group">
            {/* Avatar with circle badge */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <div
                className={`w-full h-full rounded-full overflow-hidden border-2 p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                  tip.isValid
                    ? "border-[#22C55E] bg-[#F0FDF4]"
                    : "border-[#EF4444] bg-[#FEF2F2]"
                }`}
              >
                <img
                  src={tip.image}
                  alt={tip.label}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    // Fallback if image path fails
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>

              {/* Status Badge at Top-Right of Avatar (Green Check or Red X) */}
              <div
                className={`absolute top-0 right-0 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white ${
                  tip.isValid ? "bg-[#22C55E]" : "bg-[#EF4444]"
                }`}
              >
                {tip.isValid ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                )}
              </div>
            </div>

            {/* Label below avatar */}
            <span
              className={`text-xs font-medium leading-tight mt-2.5 max-w-[120px] ${
                tip.isValid ? "text-[#15803D] font-semibold" : "text-[#4B5563]"
              }`}
            >
              {tip.label}
            </span>
          </div>
        ))}
      </div>

      {/* DASHED DIVIDER LINE (Matching Image 2) */}
      <div className="border-t-2 border-dashed border-[#DDD6FE] my-6 max-w-xl mx-auto" />

      {/* UPLOAD ACTIONS (Matching Image 2) */}
      <div className="flex flex-col items-center justify-center space-y-3.5">
        {/* Violet "Child's Photo" Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full max-w-sm py-4 px-8 rounded-2xl bg-[#8B5CF6] hover:bg-[#7C3AED] active:scale-[0.98] text-white text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <span>Child's Photo</span>
          <Upload className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Drop caption */}
        <p className="text-xs font-semibold text-[#1E1B4B]">
          drop a photo or click on the button
        </p>

        {/* Format & Dimensions Pill button (Matching Image 2) */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowInfoModal(!showInfoModal)}
            className="px-5 py-2 rounded-full border border-[#C084FC] hover:border-[#8B5CF6] bg-white hover:bg-[#FAF5FF] text-[#6B21A8] text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Photo Formats & Dimensions Info</span>
          </button>

          {/* Optional Live Camera Quick-Trigger */}
          {onActivateCamera && (
            <button
              type="button"
              onClick={onActivateCamera}
              className="px-4 py-2 rounded-full border border-[#E5DEFF] hover:border-[#8B5CF6] bg-[#FAF8FF] text-[#4C1D95] text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Camera className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>Use Camera</span>
            </button>
          )}
        </div>

        {/* Informative Popover Drawer */}
        {showInfoModal && (
          <div className="w-full max-w-md mt-4 p-4 rounded-2xl bg-[#F5F3FF] border border-[#DDD6FE] text-left text-xs space-y-2.5 text-[#4C1D95] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#DDD6FE]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#1E1B4B]">
                <Info className="w-4 h-4 text-[#8B5CF6]" />
                <span>Photo Specifications & Best Practices</span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-[#6B21A8] hover:text-[#1E1B4B] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ul className="space-y-1.5 text-[11px] text-[#4338CA]">
              <li className="flex items-start gap-2">
                <span className="font-bold">• Accepted Formats:</span>
                <span>JPG, JPEG, PNG, WebP (up to 10MB)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">• Optimal Resolution:</span>
                <span>1024 × 1024 pixels or higher (min 400 × 400 px)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">• Portrait Framing:</span>
                <span>Child looking straight at camera, eyes clearly visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">• Lighting:</span>
                <span>Soft, natural room light without deep shadows on eyes</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

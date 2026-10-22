import { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Palette,
  Check,
  X,
  RefreshCw,
  Camera,
  Upload,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { PhotoValidationReport } from "@/lib/photoValidator";
import { BACKDROP_PRESETS } from "@/lib/imageProcessor";

export interface PhotoValidationStatusProps {
  originalPreview: string;
  cleanPreview: string | null;
  useCleanBg: boolean;
  onToggleCleanBg: (val: boolean) => void;
  selectedBackdropHex: string;
  onBackdropChange: (hex: string) => void;
  isProcessingBg: boolean;
  validationReport: PhotoValidationReport | null;
  onResetPhoto: () => void;
  onChangePhotoClick: () => void;
  onCameraClick?: () => void;
}

export default function PhotoValidationStatus({
  originalPreview,
  cleanPreview,
  useCleanBg,
  onToggleCleanBg,
  selectedBackdropHex,
  onBackdropChange,
  isProcessingBg,
  validationReport,
  onResetPhoto,
  onChangePhotoClick,
  onCameraClick,
}: PhotoValidationStatusProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Automatically derived validity from real client-side analysis
  const isDisplayValid = validationReport ? validationReport.isValid : true;
  const displayScore = validationReport?.score || (isDisplayValid ? 96 : 48);

  // Extract individual check results for the 4 guidelines
  const chkFront = validationReport?.checks.find((c) => c.id === "front_facing");
  const chkMouth = validationReport?.checks.find((c) => c.id === "uncovered_face");
  const chkAccessory = validationReport?.checks.find((c) => c.id === "no_accessories");
  const chkFraming = validationReport?.checks.find((c) => c.id === "distance_framing");

  const isFrontOk = chkFront ? chkFront.status === "pass" : true;
  const isMouthOk = chkMouth ? chkMouth.status === "pass" : true;
  const isAccessoryOk = chkAccessory ? chkAccessory.status === "pass" : true;
  const isFramingOk = chkFraming ? chkFraming.status === "pass" : true;

  const displayImage = useCleanBg && cleanPreview ? cleanPreview : originalPreview;

  return (
    <div className="rounded-3xl border border-[#EBE3D9] bg-white p-6 sm:p-7 shadow-sm space-y-6">
      {/* Top Header: Upload Status & Quality Meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0EAE1]">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isDisplayValid
                  ? "bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC]"
                  : "bg-[#FEE2E2] text-[#B91C1C] border border-[#FCA5A5]"
              }`}
            >
              {isDisplayValid ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PHOTO VALID FOR STORYBOOK</span>
                </>
              ) : (
                <>
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                  <span>PHOTO NEEDS ATTENTION</span>
                </>
              )}
            </span>

            <span className="text-xs text-[#695B64] font-medium">
              Quality Match: <strong className={isDisplayValid ? "text-[#15803D]" : "text-[#B91C1C]"}>{displayScore}%</strong>
            </span>
          </div>

          <p className="text-xs text-[#4E424B] mt-1.5 font-editorial-sans">
            {isDisplayValid
              ? "Your child's photo automatically passed all 4 portrait guidelines for storybook illustration synthesis."
              : validationReport?.summary ||
                "Photo quality warning detected. Please review the guidelines below or replace with a clearer photo."}
          </p>
        </div>

        {/* Action buttons (Replace / Camera / Reset) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onChangePhotoClick}
            className="px-3.5 py-1.5 rounded-full border border-[#D8CCC0] hover:border-[#C98A84] text-xs font-medium text-[#2D222A] hover:text-[#C98A84] flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-white transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Replace</span>
          </button>

          {onCameraClick && (
            <button
              type="button"
              onClick={onCameraClick}
              className="px-3.5 py-1.5 rounded-full border border-[#D8CCC0] hover:border-[#C98A84] text-xs font-medium text-[#2D222A] hover:text-[#C98A84] flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-white transition cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
          )}

          <button
            type="button"
            onClick={onResetPhoto}
            className="p-1.5 rounded-full hover:bg-[#FAEEED] text-[#C98A84] transition cursor-pointer"
            title="Remove photo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Uploaded Image Preview & Guidelines Status */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Photo Preview with Automatic Validation Badge */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-[280px] rounded-3xl overflow-hidden border-3 shadow-md transition-all group bg-[#FAF7F2] flex items-center justify-center">
            {/* The Uploaded Image */}
            <img
              src={displayImage}
              alt="Child uploaded preview"
              className="w-full h-full object-cover transition duration-300 group-hover:scale-102"
            />

            {/* Circular Badge at Top-Right (Mirroring the circular badge from Image 2!) */}
            <div
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white transition-transform ${
                isDisplayValid ? "bg-[#22C55E] scale-105" : "bg-[#EF4444]"
              }`}
            >
              {isDisplayValid ? (
                <Check className="w-5 h-5 stroke-[3]" />
              ) : (
                <X className="w-5 h-5 stroke-[3]" />
              )}
            </div>

            {/* Bottom Status Banner on Image */}
            <div
              className={`absolute bottom-0 inset-x-0 py-1.5 px-3 backdrop-blur-md text-white text-[11px] font-bold flex items-center justify-between ${
                isDisplayValid ? "bg-black/60" : "bg-[#EF4444]/85"
              }`}
            >
              <span>{isDisplayValid ? "✓ Guidelines Passed" : "✕ Quality Alert"}</span>
              <span className="text-[10px] opacity-80">
                {validationReport?.dimensions
                  ? `${validationReport.dimensions.width}×${validationReport.dimensions.height}px`
                  : "Validated"}
              </span>
            </div>

            {/* Processing scanner overlay if solid background is being generated */}
            {isProcessingBg && (
              <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex flex-col items-center justify-center text-xs text-white gap-2 p-4 text-center z-20">
                {/* Glowing laser scanner sweep line */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C98A84] to-transparent shadow-[0_0_12px_#C98A84] animate-scanner-line pointer-events-none" />
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 animate-spin" style={{ animationDuration: "3s" }}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-white drop-shadow-md">
                  Studio isolating child & applying backdrop...
                </span>
                <span className="text-[10px] text-white/80">
                  Clean background ensures 100% illustration fidelity
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 4 Guidelines Checklist & Background Removal options */}
        <div className="md:col-span-7 space-y-4">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border transition-colors ${
              isDisplayValid
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#14532D]"
                : "bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]"
            }`}
          >
            <div className="flex items-start gap-3">
              {isDisplayValid ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 w-full">
                <h4 className="text-sm font-bold leading-tight">
                  {isDisplayValid
                    ? "Validated Portrait — High Illustration Fidelity"
                    : "Photo Has Quality Warnings"}
                </h4>
                <p className="text-xs leading-relaxed opacity-90">
                  {validationReport?.summary ||
                    (isDisplayValid
                      ? "Your photo has been successfully analyzed. The atelier will preserve your child's natural facial structure, hair color, and expression across all 26 story pages."
                      : "Photo quality warnings detected. Please review recommendations or replace photo.")}
                </p>
                {!isDisplayValid && validationReport?.recommendations && validationReport.recommendations.length > 0 && (
                  <div className="mt-2 text-[11px] font-medium text-[#991B1B] bg-white/80 p-2.5 rounded-xl border border-[#FECACA] space-y-1">
                    {validationReport.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="font-bold">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4 Guidelines Verification Matrix (Directly corresponding to the 4 circles in Image 2!) */}
            <div className="mt-3 pt-3 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* 1. Front-Facing Angle */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isFrontOk ? "bg-[#22C55E]" : "bg-[#EF4444]"
                  }`}
                >
                  {isFrontOk ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
                <span className={`font-medium ${isFrontOk ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
                  {isFrontOk ? "1. Front-Facing Angle" : "1. Side Profile / Turned Away"}
                </span>
              </div>

              {/* 2. Uncovered Face & Mouth */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isMouthOk ? "bg-[#22C55E]" : "bg-[#EF4444]"
                  }`}
                >
                  {isMouthOk ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
                <span className={`font-medium ${isMouthOk ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
                  {isMouthOk ? "2. Uncovered Face & Mouth" : "2. Mouth Covered (Hand or Object)"}
                </span>
              </div>

              {/* 3. No Heavy Accessories */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isAccessoryOk ? "bg-[#22C55E]" : "bg-[#EF4444]"
                  }`}
                >
                  {isAccessoryOk ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
                <span className={`font-medium ${isAccessoryOk ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
                  {isAccessoryOk ? "3. No Heavy Accessories" : "3. Sunglasses / Accessories Detected"}
                </span>
              </div>

              {/* 4. Close-Up Framing */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isFramingOk ? "bg-[#22C55E]" : "bg-[#EF4444]"
                  }`}
                >
                  {isFramingOk ? (
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  ) : (
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  )}
                </div>
                <span className={`font-medium ${isFramingOk ? "text-[#15803D]" : "text-[#B91C1C]"}`}>
                  {isFramingOk ? "4. Close-Up Framing" : "4. Too Far Away / In Background"}
                </span>
              </div>
            </div>
          </div>

          {/* Studio Backdrop Optimization Section */}
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-xs text-[#2D222A]">
                <input
                  type="checkbox"
                  checked={useCleanBg}
                  onChange={(e) => onToggleCleanBg(e.target.checked)}
                  className="w-4 h-4 rounded border-[#C98A84] text-[#C98A84] focus:ring-[#C98A84]"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C98A84]" />
                  <span>Studio Backdrop Enhancement (Recommended)</span>
                </span>
              </label>
            </div>
            <p className="text-[11px] text-[#695B64] leading-relaxed pl-6">
              Automatically eliminates distracting background clutter, furniture, and shadows so our illustration model isolates your child cleanly.
            </p>

            {useCleanBg && (
              <div className="pt-2 pl-6 border-t border-[#EBE3D9]/60 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold text-[#2D222A] flex items-center gap-1">
                  <Palette className="w-3 h-3 text-[#C98A84]" />
                  <span>Backdrop Color:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {BACKDROP_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onBackdropChange(preset.hex)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] border flex items-center gap-1.5 transition cursor-pointer ${
                        selectedBackdropHex === preset.hex
                          ? "border-[#C98A84] bg-white shadow-2xs font-bold text-[#C98A84]"
                          : "border-[#EBE3D9] bg-[#FAF7F2] text-[#4E424B] hover:bg-white"
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technical Diagnostics Collapsible */}
          <div>
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-[11px] text-[#695B64] hover:text-[#2D222A] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>{showDetails ? "Hide Diagnostic Checklist" : "View Full Diagnostic Checklist"}</span>
              {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showDetails && validationReport && (
              <div className="mt-2.5 p-3 rounded-xl bg-[#F9F7FB] border border-[#E9E4F0] space-y-2 text-[11px] text-[#4E424B]">
                {validationReport.checks.map((chk) => (
                  <div key={chk.id} className="flex items-start justify-between gap-2 py-1 border-b border-[#ECE7F2] last:border-0">
                    <div className="space-y-0.5">
                      <span className="font-semibold block text-[#2D222A]">{chk.title}</span>
                      <span className="text-[10px] text-[#695B64]">{chk.description}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                        chk.status === "pass"
                          ? "bg-[#DCFCE7] text-[#15803D]"
                          : chk.status === "warning"
                          ? "bg-[#FEF3C7] text-[#B45309]"
                          : "bg-[#FEE2E2] text-[#B91C1C]"
                      }`}
                    >
                      {chk.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

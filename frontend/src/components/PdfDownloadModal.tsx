import React, { useState, useEffect, useRef } from "react";
import {
  Download,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Printer,
  Palette,
  Wand2,
  Heart,
  FileCheck,
  ExternalLink
} from "lucide-react";

export interface PdfDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadUrl: string | null;
  filename?: string;
  childName?: string;
  storyTitle?: string;
  formatTitle?: string; // e.g. "Full Illustrated Storybook PDF" or "Print-Ready 8×8 Keepsake PDF"
  language?: string;
}

interface StepInfo {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
}

const DOWNLOAD_STAGES: StepInfo[] = [
  {
    icon: Palette,
    label: "Retrieving Character Spreads",
    detail: "Gathering personalized 3D face-swapped plates for all 26+ pages..."
  },
  {
    icon: Wand2,
    label: "Typesetting & Layout",
    detail: "Composing typography, page numbers, and editorial bleed margins..."
  },
  {
    icon: BookOpen,
    label: "Archival PDF Compilation",
    detail: "Compiling 300 DPI print-grade imagery into unified PDF stream..."
  },
  {
    icon: FileCheck,
    label: "Finalizing Document Package",
    detail: "Validating checksums and delivering file to your device..."
  }
];

export default function PdfDownloadModal({
  isOpen,
  onClose,
  downloadUrl,
  filename,
  childName = "Your Child",
  storyTitle = "Storybook",
  formatTitle = "Full Illustrated Storybook PDF",
  language = "English"
}: PdfDownloadModalProps) {
  const [status, setStatus] = useState<"preparing" | "downloading" | "completed" | "error">("preparing");
  const [progress, setProgress] = useState(10);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState<string | null>(null);
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean filename generator
  const getEffectiveFilename = () => {
    if (filename) return filename;
    const cleanChild = (childName || "Child").trim().replace(/[^a-zA-Z0-9]/g, "_");
    const cleanStory = (storyTitle || "Story").trim().replace(/[^a-zA-Z0-9]/g, "_");
    const isPrint = formatTitle.toLowerCase().includes("print");
    return `${cleanChild}_${cleanStory}_${isPrint ? "Print_8x8" : "Full_Storybook"}.pdf`;
  };

  const startDownload = async () => {
    if (!downloadUrl) return;

    setStatus("downloading");
    setProgress(12);
    setActiveStageIdx(0);
    setErrorMessage(null);
    setDownloadBlobUrl(null);

    const targetFilename = getEffectiveFilename();
    setDownloadFilename(targetFilename);

    // Abort previous if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Simulated progress incrementing smoothly while waiting for server generation
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    
    let currentProg = 12;
    progressTimerRef.current = setInterval(() => {
      currentProg += Math.random() * 4 + 2;
      if (currentProg > 92) {
        currentProg = 92; // Wait for actual blob to finish
      }
      setProgress(Math.round(currentProg));

      if (currentProg < 35) {
        setActiveStageIdx(0);
      } else if (currentProg < 65) {
        setActiveStageIdx(1);
      } else if (currentProg < 88) {
        setActiveStageIdx(2);
      } else {
        setActiveStageIdx(3);
      }
    }, 450);

    try {
      const response = await fetch(downloadUrl, {
        signal: controller.signal
      });

      if (!response.ok) {
        if (response.status === 402) {
          throw new Error("Payment is required to download this full storybook. Please complete your checkout first.");
        }
        let detail = `Server returned status ${response.status}`;
        try {
          const jsonErr = await response.json();
          if (jsonErr.detail) detail = jsonErr.detail;
        } catch {
          const txt = await response.text();
          if (txt) detail = txt;
        }
        throw new Error(detail);
      }

      // Check Content-Disposition for server provided filename if present
      const disposition = response.headers.get("Content-Disposition");
      let extractedFilename = targetFilename;
      if (disposition && disposition.includes("filename=")) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          extractedFilename = matches[1].replace(/['"]/g, "");
        }
      }
      setDownloadFilename(extractedFilename);

      const blob = await response.blob();
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);

      const mb = (blob.size / (1024 * 1024)).toFixed(1);
      setFileSizeMb(`${mb} MB`);
      setProgress(100);
      setActiveStageIdx(3);
      setStatus("completed");

      const objectUrl = window.URL.createObjectURL(blob);
      setDownloadBlobUrl(objectUrl);

      // Trigger automatic browser download
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = extractedFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      if (err.name === "AbortError") {
        return; // User cancelled
      }
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      console.error("PDF download failed:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to generate or download the storybook PDF.");
    }
  };

  useEffect(() => {
    if (isOpen && downloadUrl) {
      startDownload();
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      setStatus("preparing");
      setProgress(10);
      setActiveStageIdx(0);
      setErrorMessage(null);
    }

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [isOpen, downloadUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      {/* Container with glowing magical aura */}
      <div className="relative w-full max-w-lg">
        {/* Ambient Gradient Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#8B3DFF] via-[#FF69B4] to-[#C98A84] opacity-35 blur-xl animate-pulse" />

        <div className="relative bg-white rounded-3xl shadow-2xl border border-[#EBE3D9] p-6 sm:p-8 overflow-hidden text-[#2D222A]">
          {/* Close button */}
          <button
            onClick={() => {
              if (abortControllerRef.current) abortControllerRef.current.abort();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer z-10"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ACTIVE DOWNLOADING STATE */}
          {(status === "preparing" || status === "downloading") && (
            <div className="space-y-6 text-center">
              {/* Animated Atelier Book Visual */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                {/* Pulsing halo */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8B3DFF]/20 via-[#FF69B4]/20 to-[#C98A84]/20 animate-spin" style={{ animationDuration: '6s' }} />
                
                {/* Floating book icon with gentle bounce */}
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B3DFF] to-[#6019CA] text-white flex items-center justify-center shadow-lg shadow-[#8B3DFF]/30 transform hover:scale-105 transition">
                  <BookOpen className="w-8 h-8 animate-pulse" />
                  
                  {/* Whimsical fairy sparkles */}
                  <span className="absolute -top-2 -right-2 text-amber-400 animate-bounce">
                    <Sparkles className="w-5 h-5 drop-shadow" />
                  </span>
                  <span className="absolute -bottom-1 -left-2 text-pink-300">
                    <Heart className="w-4 h-4 fill-pink-300 animate-pulse" />
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8B3DFF]/10 text-[#8B3DFF] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{formatTitle}</span>
                </div>
                <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                  Crafting {childName}&apos;s Keepsake PDF
                </h3>
                <p className="text-xs text-[#695B64] max-w-sm mx-auto">
                  &ldquo;{storyTitle}&rdquo; • Language: <strong className="text-gray-800 uppercase">{language}</strong>
                </p>
              </div>

              {/* Smooth Glowing Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-[#695B64]">
                  <span className="flex items-center gap-1.5 text-[#8B3DFF]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Binding pages...</span>
                  </span>
                  <span className="font-mono text-sm text-[#2D222A] font-bold">
                    {progress}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#F5EEDB] overflow-hidden p-0.5 border border-[#EBE3D9]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B3DFF] via-[#FF69B4] to-[#C98A84] transition-all duration-300 relative shadow-sm"
                    style={{ width: `${progress}%` }}
                  >
                    {/* Shimmer light bar */}
                    <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Atelier Production Steps Flow */}
              <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE3D9] text-left space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#695B64] block">
                  Atelier Composition Pipeline
                </span>
                <div className="space-y-2.5">
                  {DOWNLOAD_STAGES.map((stg, idx) => {
                    const isDone = idx < activeStageIdx;
                    const isCurrent = idx === activeStageIdx;
                    const IconComp = stg.icon;

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 transition-opacity duration-300 ${
                          isDone ? "opacity-90" : isCurrent ? "opacity-100" : "opacity-40"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            isDone
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-[#8B3DFF] text-white shadow-sm ring-2 ring-[#8B3DFF]/20"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <IconComp className="w-3 h-3" />
                          )}
                        </div>
                        <div className="text-xs">
                          <p
                            className={`font-semibold ${
                              isCurrent ? "text-[#8B3DFF]" : isDone ? "text-emerald-800" : "text-gray-500"
                            }`}
                          >
                            {stg.label}
                          </p>
                          {isCurrent && (
                            <p className="text-[11px] text-[#695B64] mt-0.5 animate-fadeIn">
                              {stg.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-[#8C7D86] italic">
                ✨ Generating 300 DPI archival spreads. This takes ~5 to 10 seconds for a full 26-page volume.
              </p>
            </div>
          )}

          {/* COMPLETED SUCCESS STATE */}
          {status === "completed" && (
            <div className="space-y-6 text-center animate-fadeIn">
              {/* Success Checkmark Visual */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
                <div className="w-18 h-18 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-bounce" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download Started</span>
                </span>
                <h3 className="font-editorial-serif text-2xl font-bold text-gray-900">
                  {childName}&apos;s Book is Ready!
                </h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto">
                  Your complete high-resolution PDF has been assembled and sent directly to your downloads folder.
                </p>
              </div>

              {/* File details badge */}
              <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#EBE3D9] text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <span>File Name:</span>
                  <span className="font-mono text-gray-900 font-semibold truncate max-w-[220px]" title={downloadFilename}>
                    {downloadFilename}
                  </span>
                </div>
                {fileSizeMb && (
                  <div className="flex justify-between items-center text-gray-600">
                    <span>File Size:</span>
                    <span className="font-semibold text-gray-800">{fileSizeMb}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-600">
                  <span>Format:</span>
                  <span className="font-semibold text-emerald-700">Archival 300 DPI Vector PDF</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {downloadBlobUrl && (
                  <a
                    href={downloadBlobUrl}
                    download={downloadFilename}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Again</span>
                  </a>
                )}

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Return to Storybook
                </button>
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {status === "error" && (
            <div className="space-y-6 text-center animate-fadeIn">
              <div className="mx-auto w-18 h-18 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-md">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h3 className="font-editorial-serif text-2xl font-bold text-gray-900">
                  Could Not Complete Download
                </h3>
                <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 max-w-sm mx-auto">
                  {errorMessage || "We ran into an unexpected issue while composing your storybook PDF."}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={startDownload}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

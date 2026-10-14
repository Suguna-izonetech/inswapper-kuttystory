import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Sparkles,
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Palette,
  FlipHorizontal,
  RotateCcw
} from "lucide-react";
import { api, StoryTemplate, PersonalizationJob, GeneratedAsset } from "@/lib/api";
import { processSolidBackground, BACKDROP_PRESETS } from "@/lib/imageProcessor";

export default function PersonalizePage() {
  const params = useParams<{ slug?: string }>();
  const slug = params?.slug || "unicorn-story";

  // Story & page state
  const [story, setStory] = useState<StoryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [childName, setChildName] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Photo input & live camera states
  const [inputMode, setInputMode] = useState<"upload" | "camera">("upload");
  const [rawPhotoFile, setRawPhotoFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  // Live camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Background removal / plain backdrop states
  const [useCleanBg, setUseCleanBg] = useState(true);
  const [selectedBackdropHex, setSelectedBackdropHex] = useState("#FAF7F2");
  const [cleanPreview, setCleanPreview] = useState<string | null>(null);
  const [cleanPhotoBlob, setCleanPhotoBlob] = useState<Blob | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);

  // Job & Preview states
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<PersonalizationJob | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [retryingAssetId, setRetryingAssetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch story template
  useEffect(() => {
    api.getStory(slug)
      .then((data) => setStory(data))
      .catch((err) => {
        console.error("Error loading story:", err);
        setError("Could not load story details.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Polling job progress when job is active
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const updated = await api.getPersonalizationJob(jobId);
        setJob(updated);
        if (updated.status === "completed" || updated.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId]);

  // Start live webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera permission denied or camera not available. Please allow camera access in your browser or use the file upload option."
      );
      setIsCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Switch between front / back camera
  const switchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 150);
    }
  };

  // Take snapshot from live video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Center-crop square from video feed
    const sx = ((video.videoWidth || 640) - size) / 2;
    const sy = ((video.videoHeight || 640) - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const file = new File([blob], "live_capture.jpg", { type: "image/jpeg" });
        const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

        stopCamera();
        setRawPhotoFile(file);
        setOriginalPreview(dataUrl);

        // Process solid background
        processBgReplacement(dataUrl, selectedBackdropHex);
      },
      "image/jpeg",
      0.95
    );
  };

  // Handle file picker selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setRawPhotoFile(file);
      const url = URL.createObjectURL(file);
      setOriginalPreview(url);

      // Process solid background
      processBgReplacement(url, selectedBackdropHex);
    }
  };

  // Process solid background removal
  const processBgReplacement = async (imageSrc: string, bgHex: string) => {
    setIsProcessingBg(true);
    try {
      const res = await processSolidBackground(imageSrc, bgHex);
      setCleanPreview(res.dataUrl);
      setCleanPhotoBlob(res.blob);
    } catch (err) {
      console.error("Background processing error:", err);
    } finally {
      setIsProcessingBg(false);
    }
  };

  // Change solid background color preset
  const handleBackdropChange = (bgHex: string) => {
    setSelectedBackdropHex(bgHex);
    if (originalPreview) {
      processBgReplacement(originalPreview, bgHex);
    }
  };

  // Reset/retake photo
  const handleResetPhoto = () => {
    setRawPhotoFile(null);
    setOriginalPreview(null);
    setCleanPreview(null);
    setCleanPhotoBlob(null);
    if (inputMode === "camera") {
      startCamera();
    }
  };

  // Submit personalization job
  const handleStartPersonalization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      setError("Please enter your child's first name.");
      return;
    }
    if (!rawPhotoFile) {
      setError("Please upload or take a photograph of your child.");
      return;
    }
    if (!guardianConsent) {
      setError("Parent or legal guardian consent is required to process the photograph.");
      return;
    }
    if (!story) return;

    setError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("story_id", story.id);
      formData.append("child_name", childName.trim());
      formData.append("guardian_consent", "true");

      // Use clean solid background photo if enabled and available
      if (useCleanBg && cleanPhotoBlob) {
        formData.append("photo", cleanPhotoBlob, "child_clean_studio.jpg");
      } else {
        formData.append("photo", rawPhotoFile);
      }

      const createdJob = await api.startPersonalization(formData);
      setJobId(createdJob.id);
      setJob(createdJob);
    } catch (err: any) {
      setError(err.message || "Failed to start personalization.");
    } finally {
      setSubmitting(false);
    }
  };

  // Single page retry
  const handleRetryPage = async (assetId: string) => {
    setRetryingAssetId(assetId);
    try {
      await api.retryAsset(assetId);
      if (jobId) {
        const refreshed = await api.getPersonalizationJob(jobId);
        setJob(refreshed);
      }
    } catch (err: any) {
      alert("Retry error: " + err.message);
    } finally {
      setRetryingAssetId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#C98A84] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Opening Story Atelier...</span>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#C98A84] mx-auto" />
        <h2 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">Story Not Found</h2>
        <p className="text-sm text-[#695B64]">{error || "The requested story template could not be loaded."}</p>
        <Link to="/" className="inline-block px-6 py-2.5 rounded-full bg-[#C98A84] text-white text-xs font-semibold">
          Return to Story Catalog
        </Link>
      </div>
    );
  }

  const assets: GeneratedAsset[] = job?.assets || [];
  const currentAsset = assets[currentPageIdx];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb & Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#695B64]">
          <Link to="/" className="hover:text-[#C98A84]">Catalog</Link>
          <span>/</span>
          <span className="text-[#2D222A] font-medium">{story.title}</span>
          <span>/</span>
          <span className="text-[#C98A84]">Personalization</span>
        </div>
        <h1 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#2D222A]">
          Personalize {story.title}
        </h1>
        <p className="text-sm text-[#695B64] max-w-2xl">
          Enter your child’s name and capture or upload their photo. We automatically remove distracting background clutter and isolate your child against a studio backdrop so our AI creates pure, accurate cartoon illustrations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FAEEED] border border-[#C98A84]/40 text-[#2D222A] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#C98A84] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Wizard Form OR Active Progress / Book Viewer */}
      {!job ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Form: Personalization Wizard */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-[#EBE3D9] shadow-sm space-y-8">
            <form onSubmit={handleStartPersonalization} className="space-y-8">
              {/* 1. Child Name */}
              <div className="space-y-2">
                <label htmlFor="childName" className="block font-editorial-serif text-lg font-semibold text-[#2D222A]">
                  1. Child’s First Name
                </label>
                <input
                  id="childName"
                  type="text"
                  required
                  placeholder="e.g. Mia, Lucas, Aria"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] text-base focus:outline-none focus:ring-2 focus:ring-[#C98A84] transition"
                />
                <p className="text-[11px] text-[#695B64]">
                  This name will appear on the cover, chapter title, and throughout the story narrative.
                </p>
              </div>

              {/* 2. Photo Upload & Live Camera Options */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block font-editorial-serif text-lg font-semibold text-[#2D222A]">
                    2. Child’s Reference Photograph
                  </label>

                  {/* Mode Selector Tabs: Upload vs Live Camera */}
                  {!originalPreview && (
                    <div className="inline-flex items-center bg-[#F7F3EC] p-1 rounded-full border border-[#EBE3D9] text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode("upload");
                          stopCamera();
                        }}
                        className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                          inputMode === "upload" ? "bg-white text-[#2D222A] shadow-xs font-semibold" : "text-[#695B64] hover:text-[#2D222A]"
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode("camera");
                          startCamera();
                        }}
                        className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${
                          inputMode === "camera" ? "bg-white text-[#2D222A] shadow-xs font-semibold" : "text-[#695B64] hover:text-[#2D222A]"
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-[#C98A84]" />
                        <span>Live Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Sub-view A: File Upload Dropzone */}
                {!originalPreview && inputMode === "upload" && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D8CCC0] hover:border-[#C98A84] rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors bg-[#FAF7F2]/60 hover:bg-[#FAF7F2]"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84]">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[#2D222A] block">
                          Upload front-facing photograph
                        </span>
                        <span className="text-xs text-[#695B64] block mt-1">
                          PNG, JPG up to 10MB • Clear lighting, facing camera
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-view B: Live Camera Viewfinder */}
                {!originalPreview && inputMode === "camera" && (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#EBE3D9] bg-black/90 p-4 flex flex-col items-center justify-center">
                    {cameraError ? (
                      <div className="p-6 text-center space-y-3">
                        <AlertCircle className="w-8 h-8 text-[#C98A84] mx-auto" />
                        <p className="text-xs text-white max-w-sm leading-relaxed">{cameraError}</p>
                        <button
                          type="button"
                          onClick={() => setInputMode("upload")}
                          className="px-4 py-2 rounded-full bg-white text-[#2D222A] text-xs font-semibold"
                        >
                          Switch to File Upload
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover mirror-mode"
                        />

                        {/* Oval Face Guide Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                          <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                            <span className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full font-medium">
                              Position face here
                            </span>
                          </div>
                        </div>

                        {/* Camera Top Controls */}
                        <div className="absolute top-3 right-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={switchCamera}
                            title="Flip Camera"
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition"
                          >
                            <FlipHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Capture Shutter Bar */}
                        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition transform hover:scale-105"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Photo</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view C: Captured/Uploaded Photo with AI Background Cleanup */}
                {originalPreview && (
                  <div className="editorial-card p-5 bg-[#FAF7F2] space-y-4 border border-[#EBE3D9]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C98A84]" />
                        <span className="text-xs font-semibold text-[#2D222A]">
                          AI Studio Backdrop Optimization
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetPhoto}
                        className="text-xs text-[#C98A84] hover:text-[#B87A74] font-medium flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retake / Change Photo</span>
                      </button>
                    </div>

                    {/* Preview comparison / display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      {/* Photo preview with solid background */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-[#EBE3D9] shadow-sm flex items-center justify-center bg-white">
                        <img
                          src={useCleanBg && cleanPreview ? cleanPreview : originalPreview}
                          alt="Child reference preview"
                          className="w-full h-full object-cover"
                        />
                        {isProcessingBg && (
                          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center text-xs text-[#C98A84] gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Isolating child & applying backdrop...</span>
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/60 text-white text-[10px] font-medium tracking-wide">
                          {useCleanBg ? "Clean Studio Backdrop (Active)" : "Original Photo"}
                        </span>
                      </div>

                      {/* Studio Background Controls */}
                      <div className="space-y-4 text-xs">
                        {/* Toggle */}
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#2D222A]">
                            <input
                              type="checkbox"
                              checked={useCleanBg}
                              onChange={(e) => setUseCleanBg(e.target.checked)}
                              className="w-4 h-4 rounded border-[#C98A84] text-[#C98A84] focus:ring-[#C98A84]"
                            />
                            <span>Clean Plain Solid Background</span>
                          </label>
                          <p className="text-[11px] text-[#695B64] leading-relaxed pl-6">
                            Removes distracting room clutter, wallpaper, or background people so the AI cleanly transfers your child's likeness into the story illustrations.
                          </p>
                        </div>

                        {/* Palette options */}
                        {useCleanBg && (
                          <div className="space-y-2 pt-2 border-t border-[#EBE3D9]">
                            <span className="text-[11px] font-semibold text-[#2D222A] block flex items-center gap-1.5">
                              <Palette className="w-3.5 h-3.5 text-[#C98A84]" />
                              <span>Backdrop Solid Color:</span>
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {BACKDROP_PRESETS.map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  onClick={() => handleBackdropChange(preset.hex)}
                                  className={`p-2 rounded-xl text-left border flex items-center gap-2 transition ${
                                    selectedBackdropHex === preset.hex
                                      ? "border-[#C98A84] bg-white shadow-xs font-semibold"
                                      : "border-[#EBE3D9] bg-[#FAF7F2] hover:bg-white"
                                  }`}
                                >
                                  <span
                                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                                    style={{ backgroundColor: preset.hex }}
                                  />
                                  <span className="text-[11px] text-[#2D222A] truncate">{preset.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Guardian Consent */}
              <div className="p-4 rounded-xl bg-[#F7F3EC] border border-[#EBE3D9] space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[#C98A84] text-[#C98A84] focus:ring-[#C98A84]"
                  />
                  <div className="text-xs text-[#4E424B] leading-relaxed">
                    <span className="font-semibold text-[#2D222A] block">Parent / Legal Guardian Consent</span>
                    I confirm that I am the parent or legal guardian of this child. I authorize the processing of this photograph solely for creating personalized illustrations in this storybook. I acknowledge that the photograph will be stored privately and never used for public training.
                  </div>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-base font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Preparing Personalization...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Free Book Preview</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Card: Story Information */}
          <div className="lg:col-span-5 space-y-6">
            <div className="editorial-card p-6 bg-white space-y-5">
              <div className="aspect-square rounded-xl overflow-hidden bg-[#FAF7F2]">
                <img
                  src={story.cover_image_url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#695B64]">
                  <span>Square 210×210 mm Trim</span>
                  <span className="text-[#8F9E8B] font-semibold">{story.page_count} Pages</span>
                </div>
                <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                  {story.title}
                </h3>
                <p className="text-xs text-[#695B64] leading-relaxed">
                  {story.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EBE3D9] space-y-2 text-xs text-[#4E424B]">
                <div className="flex justify-between">
                  <span>Digital Illustrated Edition:</span>
                  <span className="font-semibold text-[#2D222A]">${story.price_digital}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heirloom Hardcover Print:</span>
                  <span className="font-semibold text-[#2D222A]">${story.price_print}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Progress & Completed Book Viewer */
        <div className="space-y-8">
          {/* Status Bar */}
          <div className="editorial-card p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#FAEEED] flex items-center justify-center text-[#C98A84]">
                {job.status === "completed" ? (
                  <CheckCircle className="w-6 h-6 text-[#8F9E8B]" />
                ) : job.status === "failed" ? (
                  <AlertCircle className="w-6 h-6 text-[#C98A84]" />
                ) : (
                  <RefreshCw className="w-6 h-6 text-[#C98A84] animate-spin" />
                )}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-[#695B64] font-medium">
                  Personalization for {job.child_name}
                </div>
                <div className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                  {job.current_stage}
                </div>
              </div>
            </div>

            {/* Right Status Badges */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-xs text-[#695B64] block">Progress</span>
                <span className="font-editorial-serif text-lg font-bold text-[#2D222A]">
                  {job.completed_pages} of {job.total_pages} Pages
                </span>
              </div>
              {job.status === "completed" && (
                <a
                  href={`/api/v1/books/${job.id}/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Preview PDF</span>
                </a>
              )}
            </div>
          </div>

          {/* Book Viewer when assets are ready */}
          {assets.length > 0 ? (
            <div className="editorial-card p-8 bg-white space-y-6">
              <div className="flex items-center justify-between border-b border-[#EBE3D9] pb-4">
                <div>
                  <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                    Interactive Book Preview
                  </h3>
                  <span className="text-xs text-[#695B64]">
                    Page {currentPageIdx + 1} of {assets.length} (Page #{currentAsset?.page_number})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPageIdx((prev) => Math.max(0, prev - 1))}
                    disabled={currentPageIdx === 0}
                    className="p-2 rounded-full border border-[#EBE3D9] hover:bg-[#FAF7F2] text-[#2D222A] disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPageIdx((prev) => Math.min(assets.length - 1, prev + 1))}
                    disabled={currentPageIdx === assets.length - 1}
                    className="p-2 rounded-full border border-[#EBE3D9] hover:bg-[#FAF7F2] text-[#2D222A] disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Large Spread Viewer */}
              {currentAsset && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  {/* Left: Illustration */}
                  <div className="md:col-span-7">
                    <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border border-[#EBE3D9] bg-[#FAF7F2]">
                      <img
                        src={currentAsset.image_url}
                        alt={`Page ${currentAsset.page_number}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[#FAEEED]/90 backdrop-blur-md text-[#C98A84] text-[10px] font-bold tracking-wider">
                        PERSONALIZED PREVIEW
                      </div>
                    </div>
                  </div>

                  {/* Right: Narrative text & Metadata */}
                  <div className="md:col-span-5 space-y-6">
                    <div className="p-6 rounded-2xl bg-[#F7F3EC] border border-[#EBE3D9] space-y-3">
                      <span className="text-[11px] uppercase tracking-wider text-[#C98A84] font-semibold">
                        Story Narrative
                      </span>
                      <p className="font-editorial-serif text-xl text-[#2D222A] leading-relaxed italic">
                        "{currentAsset.prompt_used.slice(0, 150)}..."
                      </p>
                    </div>

                    <div className="space-y-3 text-xs text-[#695B64]">
                      <div className="flex justify-between py-1.5 border-b border-[#EBE3D9]">
                        <span>AI Provider:</span>
                        <span className="font-medium text-[#2D222A]">{currentAsset.provider}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#EBE3D9]">
                        <span>Model:</span>
                        <span className="font-medium text-[#2D222A]">{currentAsset.model}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#EBE3D9]">
                        <span>Generation Latency:</span>
                        <span className="font-medium text-[#2D222A]">{currentAsset.generation_time_sec}s</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#EBE3D9]">
                        <span>Asset Version:</span>
                        <span className="font-medium text-[#2D222A]">v{currentAsset.asset_version}</span>
                      </div>
                    </div>

                    {/* Single page regenerate button */}
                    <button
                      onClick={() => handleRetryPage(currentAsset.id)}
                      disabled={retryingAssetId === currentAsset.id}
                      className="w-full py-3 rounded-full border border-[#C98A84] text-[#C98A84] hover:bg-[#FAEEED] text-xs font-semibold transition flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${retryingAssetId === currentAsset.id ? "animate-spin" : ""}`} />
                      <span>{retryingAssetId === currentAsset.id ? "Regenerating Page..." : "Regenerate This Page"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Thumbnails strip */}
              <div className="pt-6 border-t border-[#EBE3D9] flex gap-3 overflow-x-auto pb-2">
                {assets.map((ast, idx) => (
                  <button
                    key={ast.id}
                    onClick={() => setCurrentPageIdx(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      currentPageIdx === idx ? "border-[#C98A84] shadow-md scale-105" : "border-[#EBE3D9] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={ast.image_url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                      #{ast.page_number}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Generating skeleton */
            <div className="editorial-card p-12 bg-white text-center space-y-4">
              <RefreshCw className="w-12 h-12 text-[#C98A84] animate-spin mx-auto" />
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                Crafting Your Personalized Illustrations...
              </h3>
              <p className="text-xs text-[#695B64] max-w-md mx-auto">
                Our AI consistency engine is conditioning the narrative scenes with {job.child_name}’s likeness. This takes approximately 10–20 seconds.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

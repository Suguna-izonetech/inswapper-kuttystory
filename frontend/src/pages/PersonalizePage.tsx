import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
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
  FlipHorizontal,
  RotateCcw,
  BookOpen,
  Layout
} from "lucide-react";
import { api, StoryTemplate, PersonalizationJob, GeneratedAsset } from "@/lib/api";
import { processSolidBackground } from "@/lib/imageProcessor";
import { validateChildPhoto, PhotoValidationReport } from "@/lib/photoValidator";
import PersonalizationRoadmap from "@/components/PersonalizationRoadmap";
import PhotoTipsGuide from "@/components/PhotoTipsGuide";
import PhotoValidationStatus from "@/components/PhotoValidationStatus";
import RealisticBookFlipViewer from "@/components/RealisticBookFlipViewer";
import StorybookMagicLoader from "@/components/StorybookMagicLoader";

export default function PersonalizePage() {
  const params = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const slug = params?.slug || "unicorn-story";
  const urlJobId = searchParams.get("job_id");

  // Story & page state
  const [story, setStory] = useState<StoryTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states: Child profile details
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("5");
  const [childGender, setChildGender] = useState<"girl" | "boy">("girl");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Photo input & live camera states
  const [inputMode, setInputMode] = useState<"upload" | "camera">("upload");
  const [rawPhotoFile, setRawPhotoFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);

  // Photo validation state
  const [validationReport, setValidationReport] = useState<PhotoValidationReport | null>(null);
  const [isValidatingPhoto, setIsValidatingPhoto] = useState(false);

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
  const [jobId, setJobId] = useState<string | null>(urlJobId);
  const [job, setJob] = useState<PersonalizationJob | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [retryingAssetId, setRetryingAssetId] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<"flipbook" | "spread">("flipbook");

  // Multi-Language Translation states
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  const handleLanguageChange = async (targetLang: string) => {
    setSelectedLanguage(targetLang);
    if (targetLang === "english") {
      setTranslations({});
      return;
    }
    if (!jobId) return;
    setIsTranslating(true);
    try {
      const res = await api.translateJob(jobId, targetLang);
      if (res && res.translations) {
        setTranslations(res.translations);
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  };

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

    // Immediately fetch current job state
    api.getPersonalizationJob(jobId)
      .then((data) => {
        setJob(data);
        if (data.story_slug && data.story_slug !== slug) {
          api.getStory(data.story_slug).then(s => setStory(s)).catch(() => {});
        }
      })
      .catch((err) => console.error("Initial job load error:", err));

    const interval = setInterval(async () => {
      try {
        const updated = await api.getPersonalizationJob(jobId);
        setJob(updated);
        if (updated.story_slug && updated.story_slug !== slug && (!story || story.slug !== updated.story_slug)) {
          api.getStory(updated.story_slug).then(s => setStory(s)).catch(() => {});
        }
        const statusLower = updated.status?.toLowerCase();
        if (statusLower === "completed" || statusLower === "failed" || statusLower === "done") {
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

        // Photo validation (YuNet AI face landmark analysis + client fallback)
        setIsValidatingPhoto(true);
        validateChildPhoto(dataUrl, blob.size, blob)
          .then((report) => setValidationReport(report))
          .catch((err) => console.warn("Validation error:", err))
          .finally(() => setIsValidatingPhoto(false));

        // Process solid background
        processBgReplacement(dataUrl, selectedBackdropHex);
      },
      "image/jpeg",
      0.95
    );
  };

  // Handle photo file selection (from Dropzone or Button)
  const handlePhotoSelect = async (file: File) => {
    setRawPhotoFile(file);
    const url = URL.createObjectURL(file);
    setOriginalPreview(url);

    // Run photo guidelines validation (YuNet AI face landmark analysis + client fallback)
    setIsValidatingPhoto(true);
    try {
      const report = await validateChildPhoto(url, file.size, file);
      setValidationReport(report);
    } catch (err) {
      console.warn("Validation error:", err);
    } finally {
      setIsValidatingPhoto(false);
    }

    // Process solid background
    processBgReplacement(url, selectedBackdropHex);
  };

  // Handle file input event
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0]);
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
    setValidationReport(null);
    if (inputMode === "camera") {
      startCamera();
    }
  };

  // Submit personalization job (Backend logic preserved exactly as requested!)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Hidden File Input for trigger buttons */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Breadcrumb & Title */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#695B64]">
          <Link to="/" className="hover:text-[#C98A84]">Catalog</Link>
          <span>/</span>
          <span className="text-[#2D222A] font-medium">{story.title}</span>
          <span>/</span>
          <span className="text-[#C98A84]">Personalization</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-editorial-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D222A] tracking-tight">
              Personalize {story.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ROADMAP DESIGN (1. Select Story -> 2. Upload Photo -> 3. Preview) */}
      <PersonalizationRoadmap
        currentStep={job ? 3 : 2}
      />

      {error && (
        <div className="p-4 rounded-xl bg-[#FAEEED] border border-[#C98A84]/40 text-[#2D222A] text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#C98A84] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Wizard Form OR Active Progress / Book Viewer */}
      {!job ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Form: Personalization Wizard */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-9 rounded-3xl border border-[#EBE3D9] shadow-sm space-y-8">
            <form onSubmit={handleStartPersonalization} className="space-y-8">
              {/* 1. Child Details: Name, Age, Gender */}
              <div id="child-details-section" className="space-y-5">
                <div>
                  <label htmlFor="childName" className="block font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A]">
                    1. Child’s Details
                  </label>
                </div>

                {/* Child Name */}
                <div className="space-y-2">
                  <label htmlFor="childName" className="block text-sm font-semibold text-[#2D222A]">
                    Child’s First Name <span className="text-[#C98A84]">*</span>
                  </label>
                  <input
                    id="childName"
                    type="text"
                    required
                    placeholder="e.g. Mia, Lucas, Aria"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] text-base focus:outline-none focus:ring-2 focus:ring-[#C98A84] focus:border-[#C98A84] transition font-sans"
                  />
                </div>

                {/* Age & Gender Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Age Selector */}
                  <div className="space-y-2">
                    <label htmlFor="childAge" className="block text-sm font-semibold text-[#2D222A]">
                      Child’s Age
                    </label>
                    <div className="relative">
                      <select
                        id="childAge"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#C98A84] focus:border-[#C98A84] transition appearance-none cursor-pointer font-sans"
                      >
                        <option value="2">2 Years Old (Toddler)</option>
                        <option value="3">3 Years Old</option>
                        <option value="4">4 Years Old</option>
                        <option value="5">5 Years Old (Ideal for this tale)</option>
                        <option value="6">6 Years Old</option>
                        <option value="7">7 Years Old</option>
                        <option value="8">8 Years Old</option>
                        <option value="9">9 Years Old</option>
                        <option value="10">10 Years Old</option>
                        <option value="11">11+ Years Old</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#695B64]">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Gender Selector */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-[#2D222A]">
                      Child’s Gender
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setChildGender("girl")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${childGender === "girl"
                            ? "border-[#EC4899] bg-[#FDF2F8] text-[#BE185D] shadow-2xs ring-1 ring-[#EC4899]"
                            : "border-[#D8CCC0] bg-[#FAF7F2] text-[#695B64] hover:bg-white"
                          }`}
                      >
                        <span>👧</span>
                        <span>Girl</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setChildGender("boy")}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${childGender === "boy"
                            ? "border-[#3B82F6] bg-[#EFF6FF] text-[#1D4ED8] shadow-2xs ring-1 ring-[#3B82F6]"
                            : "border-[#D8CCC0] bg-[#FAF7F2] text-[#695B64] hover:bg-white"
                          }`}
                      >
                        <span>👦</span>
                        <span>Boy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Photo Upload & Live Camera Options */}
              <div id="photo-upload-section" className="space-y-4 pt-4 border-t border-[#F0EAE1]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block font-editorial-serif text-xl sm:text-2xl font-bold text-[#2D222A]">
                      2. Child’s Reference Photograph
                    </label>
                  </div>

                  {/* Mode Selector Tabs: Upload vs Live Camera */}
                  {!originalPreview && (
                    <div className="inline-flex items-center bg-[#F7F3EC] p-1 rounded-full border border-[#EBE3D9] text-xs font-medium self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode("upload");
                          stopCamera();
                        }}
                        className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${inputMode === "upload" ? "bg-white text-[#2D222A] shadow-xs font-semibold" : "text-[#695B64] hover:text-[#2D222A]"
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
                        className={`px-3 py-1 rounded-full transition flex items-center gap-1.5 ${inputMode === "camera" ? "bg-white text-[#2D222A] shadow-xs font-semibold" : "text-[#695B64] hover:text-[#2D222A]"
                          }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-[#C98A84]" />
                        <span>Live Camera</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* SUB-VIEW A: TIPS Guide with 4 Visual Circles & Upload Button (Matching Image 2) */}
                {!originalPreview && inputMode === "upload" && (
                  <PhotoTipsGuide
                    onPhotoSelected={handlePhotoSelect}
                    onActivateCamera={() => {
                      setInputMode("camera");
                      startCamera();
                    }}
                    isProcessing={isValidatingPhoto || isProcessingBg}
                  />
                )}

                {/* SUB-VIEW B: Live Camera Viewfinder */}
                {!originalPreview && inputMode === "camera" && (
                  <div className="relative rounded-3xl overflow-hidden border-2 border-[#EBE3D9] bg-black/90 p-4 flex flex-col items-center justify-center">
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
                            className="px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition transform hover:scale-105 cursor-pointer"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Capture Photo</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SUB-VIEW C: Uploaded Photo Validation Card (Shows Valid/Invalid like Ref Image 2) */}
                {originalPreview && (
                  <PhotoValidationStatus
                    originalPreview={originalPreview}
                    cleanPreview={cleanPreview}
                    useCleanBg={useCleanBg}
                    onToggleCleanBg={setUseCleanBg}
                    selectedBackdropHex={selectedBackdropHex}
                    onBackdropChange={handleBackdropChange}
                    isProcessingBg={isProcessingBg}
                    validationReport={validationReport}
                    onResetPhoto={handleResetPhoto}
                    onChangePhotoClick={() => fileInputRef.current?.click()}
                    onCameraClick={() => {
                      setInputMode("camera");
                      startCamera();
                    }}
                  />
                )}
              </div>

              {/* 3. Guardian Consent & Submit */}
              <div id="book-review-section" className="p-4 sm:p-5 rounded-2xl bg-[#F7F3EC] border border-[#EBE3D9] space-y-3">
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
                className="w-full py-4 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-base font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
            <div className="editorial-card p-6 bg-white space-y-5 sticky top-28">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] border border-[#EBE3D9] shadow-xs">
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
                  <span className="font-semibold text-[#2D222A]">₹{story.price_digital ? Number(story.price_digital).toLocaleString("en-IN") : "799"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heirloom Hardcover Print:</span>
                  <span className="font-semibold text-[#2D222A]">₹{story.price_print ? Number(story.price_print).toLocaleString("en-IN") : "1,399"}</span>
                </div>
              </div>

              {/* Personalization Summary Badge */}
              {childName && (
                <div className="p-3 rounded-xl bg-[#FAF5FF] border border-[#E9D5FF] text-[11px] text-[#6B21A8] flex items-center justify-between">
                  <span>Personalizing for:</span>
                  <strong className="font-bold">{childName} ({childAge} yrs, {childGender === "girl" ? "Girl" : "Boy"})</strong>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Progress & Completed Book Viewer */
        <div className="space-y-8">
          {/* Status Bar */}
          <div className="editorial-card p-6 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {(() => {
                const statusLower = job.status?.toLowerCase();
                const isJobCompleted = statusLower === "completed" || statusLower === "done";
                const isJobFailed = statusLower === "failed";
                return (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isJobCompleted
                      ? "bg-[#EEF4ED] text-[#8F9E8B]"
                      : isJobFailed
                      ? "bg-[#FEF2F2] text-[#EF4444]"
                      : "bg-[#FAEEED] text-[#C98A84] ring-4 ring-[#C98A84]/15 shadow-xs"
                  }`}>
                    {isJobCompleted ? (
                      <CheckCircle className="w-6 h-6 text-[#8F9E8B]" />
                    ) : isJobFailed ? (
                      <AlertCircle className="w-6 h-6 text-[#C98A84]" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-[#C98A84] animate-spin" style={{ animationDuration: "5s" }} />
                    )}
                  </div>
                );
              })()}
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
                  {job.completed_pages} of {job.total_pages || 5} Pages
                </span>
              </div>
              {(job.status?.toLowerCase() === "completed" || job.status?.toLowerCase() === "done") && (
                <a
                  href={`/api/v1/personalization/${job.id}/pdf?lang=${selectedLanguage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Preview PDF ({selectedLanguage.toUpperCase()})</span>
                </a>
              )}
            </div>
          </div>

          {/* 3D Realistic Book Flip Viewer & Editorial Spread Viewer */}
          {assets.length > 0 ? (
            <div className="space-y-4">
              {/* Preview Mode Selector */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#695B64]">
                  Personalized Book Preview
                </span>
                <div className="inline-flex rounded-full p-1 bg-[#F5EEDB] border border-[#DDD6C0] text-xs">
                  <button
                    onClick={() => setViewerMode("flipbook")}
                    className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer font-medium ${
                      viewerMode === "flipbook"
                        ? "bg-[#C98A84] text-white shadow-xs"
                        : "text-[#695B64] hover:text-[#2D222A]"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>3D Realistic Flipbook</span>
                  </button>
                  <button
                    onClick={() => setViewerMode("spread")}
                    className={`px-3 py-1 rounded-full flex items-center gap-1.5 transition cursor-pointer font-medium ${
                      viewerMode === "spread"
                        ? "bg-[#C98A84] text-white shadow-xs"
                        : "text-[#695B64] hover:text-[#2D222A]"
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>Editorial Spread</span>
                  </button>
                </div>
              </div>

              {viewerMode === "flipbook" ? (
                <RealisticBookFlipViewer
                  assets={assets}
                  currentPageIdx={currentPageIdx}
                  onPageChange={(idx) => setCurrentPageIdx(idx)}
                  childPhotoUrl={cleanPreview || originalPreview || job.photo_url}
                  childName={job.child_name || childName || "Your Child"}
                  storyTitle={story?.title || "Storybook"}
                  onRetryPage={handleRetryPage}
                  isRetrying={Boolean(retryingAssetId)}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  translatedTexts={translations}
                  isTranslating={isTranslating}
                />
              ) : (
                <div className="editorial-card p-8 bg-white space-y-6">
                  {/* Language Selector in Spread Mode */}
                  <div className="p-3 rounded-2xl bg-[#F7F3EC] border border-[#EBE3D9] flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs font-bold text-[#2D222A]">
                      Language Translation:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: "english", label: "English" },
                        { id: "tamil", label: "தமிழ் (Tamil)" },
                        { id: "malayalam", label: "മലയാളം (Malayalam)" },
                        { id: "hindi", label: "हिंदी (Hindi)" },
                        { id: "marathi", label: "मराठी (Marathi)" },
                        { id: "telugu", label: "తెలుగు (Telugu)" },
                        { id: "kannada", label: "ಕನ್ನಡ (Kannada)" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => handleLanguageChange(lang.id)}
                          disabled={isTranslating}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                            selectedLanguage === lang.id
                              ? "bg-[#C98A84] text-white border-[#C98A84]"
                              : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                        className="p-2 rounded-full border border-[#EBE3D9] hover:bg-[#FAF7F2] text-[#2D222A] disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPageIdx((prev) => Math.min(assets.length - 1, prev + 1))}
                        disabled={currentPageIdx === assets.length - 1}
                        className="p-2 rounded-full border border-[#EBE3D9] hover:bg-[#FAF7F2] text-[#2D222A] disabled:opacity-30 cursor-pointer"
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
                            Story Narrative ({selectedLanguage.toUpperCase()})
                          </span>
                          <p className="font-editorial-serif text-xl text-[#2D222A] leading-relaxed italic">
                            "{(() => {
                              if (translations[currentAsset.id]) return translations[currentAsset.id];
                              let text = currentAsset.story_text || currentAsset.prompt_used || "";
                              const cleanChild = (job?.child_name || childName || "Your Child").trim();
                              ["[Name]", "[name]", "{name}", "[child_name]", "{child_name}"].forEach((tag) => {
                                text = text.split(tag).join(cleanChild);
                              });
                              return text;
                            })()}"
                          </p>
                        </div>



                      </div>
                    </div>
                  )}

                  {/* Thumbnails strip */}
                  <div className="pt-6 border-t border-[#EBE3D9] flex gap-3 overflow-x-auto pb-2">
                    {assets.map((ast, idx) => (
                      <button
                        key={ast.id}
                        onClick={() => setCurrentPageIdx(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition cursor-pointer ${
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
              )}
            </div>
          ) : (
            /* Interactive Enchanted Storybook Atelier Generation Stage */
            <StorybookMagicLoader
              job={job}
              storyTitle={story?.title || "The Girl and the Magical Unicorn"}
              childPhotoUrl={cleanPreview || originalPreview || job.photo_url}
              childName={job.child_name || childName || "Your Child"}
            />
          )}
        </div>
      )}
    </div>
  );
}

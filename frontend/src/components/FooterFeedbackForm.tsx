import React, { useState, useRef, useEffect } from "react";
import { Star, UploadCloud, X, CheckCircle2, AlertCircle, Loader2, Video, ImageIcon } from "lucide-react";
import { api } from "../lib/api";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".mp4", ".webm", ".mov"];

export default function FooterFeedbackForm() {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [place, setPlace] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) {
      handleRemoveFile();
      return;
    }

    const ext = "." + selected.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTS.includes(ext)) {
      setFileError("Supported formats: PNG, JPG, WEBP, MP4, WEBM, MOV");
      handleRemoveFile();
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setFileError("File exceeds 15MB limit");
      handleRemoveFile();
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    setPreviewType(isVideo ? "video" : "image");
    setFile(selected);
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewType(null);
    setFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter your name");
      return;
    }
    if (!place.trim()) {
      setErrorMessage("Please enter your city / place");
      return;
    }

    // Review text is now completely optional! A user can submit star rating + media with or without text.
    setIsSubmitting(true);
    try {
      await api.submitFeedback({
        name: name.trim(),
        place: place.trim(),
        rating,
        review_text: reviewText.trim() ? reviewText.trim() : undefined,
        file,
      });

      setSuccessMessage(
        "Thank you! Your feedback has been received and will appear publicly after approval."
      );
      setName("");
      setPlace("");
      setReviewText("");
      setRating(5);
      handleRemoveFile();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-editorial-serif text-sm font-semibold uppercase tracking-wider text-[#2D222A]">
        Share Feedback
      </h4>
      <p className="text-xs text-[#695B64] leading-relaxed">
        Loved your keepsake book? Share your family's experience with us.
      </p>

      {successMessage ? (
        <div className="bg-[#EEF4ED] border border-[#8F9E8B]/40 text-[#4E7048] p-3 rounded-xl text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#8F9E8B] shrink-0" />
            <span>Feedback Submitted</span>
          </div>
          <p className="text-[11px] leading-relaxed">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-[10px] underline hover:text-[#2D222A] pt-1 block cursor-pointer"
          >
            Submit another review
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {errorMessage && (
            <div className="bg-[#FAEEED] border border-[#C98A84]/40 text-[#A35C56] p-2 rounded-lg text-[11px] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1-5 Star Rating */}
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C7A86]">
              Your Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating !== null ? hoverRating : rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    aria-label={`${star} star rating`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-0.5 text-[#C5A059] hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        isFilled ? "fill-[#C5A059] text-[#C5A059]" : "text-[#D8CCC0]"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-[11px] text-[#8C7A86] ml-1 font-medium">
                {rating} / 5
              </span>
            </div>
          </div>

          {/* Name & Place in 2 compact columns */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Your Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3D9] focus:border-[#C98A84] rounded-lg text-xs text-[#2D222A] placeholder-[#A2949E] focus:outline-none focus:ring-1 focus:ring-[#C98A84]/30"
            />
            <input
              type="text"
              placeholder="Place (e.g. Chennai) *"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              required
              maxLength={100}
              className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3D9] focus:border-[#C98A84] rounded-lg text-xs text-[#2D222A] placeholder-[#A2949E] focus:outline-none focus:ring-1 focus:ring-[#C98A84]/30"
            />
          </div>

          {/* Review text (optional) */}
          <textarea
            placeholder="Share your experience (optional)"
            rows={2}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={1000}
            className="w-full px-2.5 py-1.5 bg-white border border-[#EBE3D9] focus:border-[#C98A84] rounded-lg text-xs text-[#2D222A] placeholder-[#A2949E] focus:outline-none focus:ring-1 focus:ring-[#C98A84]/30 resize-none"
          />

          {/* Optional photo / video upload with preview */}
          <div className="space-y-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime"
              className="hidden"
              id="footer-feedback-file"
            />

            {!file ? (
              <label
                htmlFor="footer-feedback-file"
                className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-[#FAF7F2] border border-dashed border-[#C98A84]/40 hover:border-[#C98A84] rounded-lg text-[11px] text-[#695B64] cursor-pointer transition-colors"
              >
                <UploadCloud className="w-3.5 h-3.5 text-[#C98A84]" />
                <span>Add photo / video (optional, max 15MB)</span>
              </label>
            ) : (
              <div className="p-2 bg-white border border-[#EBE3D9] rounded-xl flex items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2 min-w-0">
                  {previewType === "image" && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="w-10 h-10 rounded-lg object-cover border border-[#EBE3D9] shrink-0"
                    />
                  ) : previewType === "video" && previewUrl ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-black/80 flex items-center justify-center shrink-0 border border-[#EBE3D9]">
                      <video
                        src={previewUrl}
                        muted
                        playsInline
                        className="w-full h-full object-cover opacity-80"
                      />
                      <Video className="w-4 h-4 text-white absolute" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#FAF7F2] flex items-center justify-center text-[#C98A84] shrink-0 border border-[#EBE3D9]">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0 text-left">
                    <p className="text-[11px] font-semibold text-[#2D222A] truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-[#8C7A86]">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • {previewType === "video" ? "Video preview" : "Photo preview"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  title="Remove file"
                  aria-label="Remove uploaded file"
                  className="p-1 rounded-full hover:bg-gray-100 text-[#8C7A86] hover:text-[#2D222A] transition cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {fileError && (
              <p className="text-[10px] text-[#A35C56] font-medium">{fileError}</p>
            )}
          </div>

          {/* Disclaimers */}
          <p className="text-[10px] text-[#8C7A86] leading-tight">
            Reviews & media appear publicly only after admin approval. No private contact info is published.
          </p>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Feedback</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

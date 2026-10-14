import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  Cpu
} from "lucide-react";
import { api, POCTestResult, AISettings } from "@/lib/api";

export default function POCTestPage() {
  const [pocResult, setPocResult] = useState<POCTestResult | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [childName, setChildName] = useState("Mia");
  const [reviewStates, setReviewStates] = useState<{ [key: number]: "approved" | "rejected" | "pending" }>({
    7: "pending",
    10: "pending",
    13: "pending",
  });

  // Load initial settings and run default POC
  useEffect(() => {
    api.getAISettings()
      .then((s) => setAiSettings(s))
      .catch((e) => console.error("Error loading AI settings:", e));

    runPOC("Mia");
  }, []);

  const runPOC = async (name: string) => {
    setLoading(true);
    try {
      const res = await api.runPOCTest(name);
      setPocResult(res);
      setReviewStates({
        7: "pending",
        10: "pending",
        13: "pending",
      });
    } catch (err: any) {
      console.error("POC error:", err);
      alert("Failed to run POC: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (pageNum: number, status: "approved" | "rejected") => {
    setReviewStates((prev) => ({ ...prev, [pageNum]: status }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header & Objectives */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEEED] text-xs font-semibold text-[#C98A84]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 5 Evaluation & Quality Assurance</span>
        </div>
        <h1 className="font-editorial-serif text-4xl sm:text-5xl font-bold text-[#2D222A]">
          3-Image Character Consistency Proof-of-Concept
        </h1>
        <p className="text-sm text-[#695B64] max-w-3xl leading-relaxed">
          Before generating an entire 26-page book, our architecture mandates evaluating three representative story beats from the actual Unicorn Story: a close-up portrait, a dynamic full-body action scene, and an emotional animal rescue scene with distinct poses.
        </p>
      </div>

      {/* Hardware Diagnostic Banner */}
      {aiSettings && (
        <div className="editorial-card p-6 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EEF4ED] flex items-center justify-center text-[#4E7048]">
              <Cpu className="w-5 h-5 text-[#8F9E8B]" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-[#695B64] font-medium block">
                Development Machine Hardware Diagnostic
              </span>
              <span className="text-sm font-semibold text-[#2D222A]">
                {aiSettings.hardware_acceleration}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#EBE3D9] text-[#4E424B]">
              Active Image Provider: <strong className="text-[#2D222A]">{aiSettings.active_image_provider}</strong>
            </div>
            <Link
              to="/admin"
              className="px-3.5 py-1.5 rounded-lg bg-[#C98A84] text-white font-medium hover:bg-[#B87A74] transition"
            >
              Configure in Admin
            </Link>
          </div>
        </div>
      )}

      {/* Interactive POC Runner Form */}
      <div className="editorial-card p-6 bg-[#F7F3EC] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <label htmlFor="pocChildName" className="text-xs font-semibold text-[#2D222A] shrink-0">
            Child Test Name:
          </label>
          <input
            id="pocChildName"
            type="text"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[#D8CCC0] bg-white text-xs text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
          />
        </div>

        <button
          onClick={() => runPOC(childName)}
          disabled={loading}
          className="px-6 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{loading ? "Evaluating 3 Scenes..." : "Re-run 3-Scene Proof-of-Concept"}</span>
        </button>
      </div>

      {/* Side-by-Side 3-Image Comparison Grid */}
      {pocResult && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pocResult.pages.map((page) => (
              <div key={page.page_number} className="editorial-card overflow-hidden bg-white flex flex-col">
                {/* Header Tag */}
                <div className="p-4 border-b border-[#EBE3D9] flex items-center justify-between bg-[#FAF7F2]">
                  <div>
                    <span className="text-[11px] font-semibold text-[#C98A84] block">
                      Page #{String(page.page_number).padStart(2, "0")} • {page.scene_type}
                    </span>
                    <span className="text-[10px] text-[#695B64]">
                      {page.is_simulated ? "Deterministic Mechanics Test" : "Live Diffusion Output"}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    reviewStates[page.page_number] === "approved"
                      ? "bg-[#EEF4ED] text-[#4E7048]"
                      : reviewStates[page.page_number] === "rejected"
                      ? "bg-[#FAEEED] text-[#C98A84]"
                      : "bg-[#F7F3EC] text-[#695B64]"
                  }`}>
                    {reviewStates[page.page_number].toUpperCase()}
                  </span>
                </div>

                {/* Rendered Artwork */}
                <div className="relative aspect-square bg-[#FAF7F2] overflow-hidden">
                  <img
                    src={page.image_url}
                    alt={page.scene_type}
                    className="w-full h-full object-cover"
                  />
                  {page.is_simulated && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium tracking-wider">
                      SIMULATED TEST
                    </div>
                  )}
                </div>

                {/* Scene & Prompt Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs text-[#2D222A] font-semibold">
                      Source Beat: <span className="font-normal text-[#695B64]">{page.source_description}</span>
                    </div>

                    <div className="text-[11px] text-[#695B64] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EBE3D9]">
                      <strong className="text-[#2D222A]">Prompt:</strong> {page.prompt.slice(0, 140)}...
                    </div>
                  </div>

                  {/* Metadata and Review Controls */}
                  <div className="pt-4 border-t border-[#EBE3D9] space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#695B64]">
                      <div>Latency: <strong className="text-[#2D222A]">{page.generation_time_sec}s</strong></div>
                      <div>Est. Cost: <strong className="text-[#2D222A]">${page.cost_estimate.toFixed(3)}</strong></div>
                    </div>

                    {/* Admin Approval Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleReview(page.page_number, "approved")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                          reviewStates[page.page_number] === "approved"
                            ? "bg-[#8F9E8B] text-white"
                            : "border border-[#8F9E8B] text-[#4E7048] hover:bg-[#EEF4ED]"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleReview(page.page_number, "rejected")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition ${
                          reviewStates[page.page_number] === "rejected"
                            ? "bg-[#C98A84] text-white"
                            : "border border-[#C98A84] text-[#C98A84] hover:bg-[#FAEEED]"
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Evaluation Summary Report */}
          <div className="editorial-card p-6 bg-white space-y-4">
            <h3 className="font-editorial-serif text-xl font-bold text-[#2D222A]">
              Character Consistency Evaluation Criteria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-1">
                <span className="font-semibold text-[#2D222A] block">1. Facial Likeness</span>
                <p className="text-[#695B64]">Recognizable facial structure, eye shape, and skin tone preserved from the reference photo.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-1">
                <span className="font-semibold text-[#2D222A] block">2. Style Consistency</span>
                <p className="text-[#695B64]">Matches the painterly 3D digital picture book aesthetic of the original Unicorn Story artwork.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-1">
                <span className="font-semibold text-[#2D222A] block">3. Attire & Motif</span>
                <p className="text-[#695B64]">Consistent fairytale pink gown and bun hairstyle maintained across poses.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3D9] space-y-1">
                <span className="font-semibold text-[#2D222A] block">4. Deterministic Typesetting</span>
                <p className="text-[#695B64]">Pure artwork separated from text; vector typography rendered by ReportLab layout engine.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  RefreshCw,
  Save,
  Cpu
} from "lucide-react";
import { api, StoryTemplate, StoryPage, AISettings } from "@/lib/api";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "stories" | "ai" | "jobs">("overview");

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [, setStories] = useState<StoryTemplate[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryTemplate | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit page state
  const [pageEditText, setPageEditText] = useState("");
  const [pageEditScene, setPageEditScene] = useState("");
  const [pageEditPrompt, setPageEditPrompt] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // AI settings form
  const [aiProvider, setAiProvider] = useState("huggingface");
  const [aiModel, setAiModel] = useState("stabilityai/stable-diffusion-xl-base-1.0");
  const [previewLimit, setPreviewLimit] = useState(5);
  const [budgetCap, setBudgetCap] = useState(2.50);
  const [savingAi, setSavingAi] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsData, storiesData, aiData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminStories(),
        api.getAISettings(),
      ]);
      setStats(statsData);
      setStories(storiesData);
      setAiSettings(aiData);

      if (aiData) {
        setAiProvider(aiData.active_image_provider);
        setAiModel(aiData.active_model);
        setPreviewLimit(aiData.preview_page_limit);
        setBudgetCap(aiData.per_book_budget);
      }

      if (storiesData.length > 0) {
        const s = storiesData[0];
        setSelectedStory(s);
        if (s.pages && s.pages.length > 0) {
          syncPageForm(s.pages[0]);
        }
      }
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const syncPageForm = (page: StoryPage) => {
    setPageEditText(page.story_text || "");
    setPageEditScene(page.scene_description || "");
    setPageEditPrompt(page.prompt_template || "");
    setSaveSuccess(false);
  };

  const handleSelectPage = (idx: number) => {
    setSelectedPageIndex(idx);
    if (selectedStory?.pages && selectedStory.pages[idx]) {
      syncPageForm(selectedStory.pages[idx]);
    }
  };

  const handleSavePage = async () => {
    if (!selectedStory || !selectedStory.pages[selectedPageIndex]) return;
    const page = selectedStory.pages[selectedPageIndex];
    setSavingPage(true);
    try {
      const updated = await api.updateStoryPage(page.id, {
        story_text: pageEditText,
        scene_description: pageEditScene,
        prompt_template: pageEditPrompt,
      });

      // Update local state
      const updatedPages = [...selectedStory.pages];
      updatedPages[selectedPageIndex] = updated;
      setSelectedStory({ ...selectedStory, pages: updatedPages });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert("Error saving page: " + err.message);
    } finally {
      setSavingPage(false);
    }
  };

  const handleSaveAiSettings = async () => {
    setSavingAi(true);
    try {
      const updated = await api.updateAISettings({
        active_image_provider: aiProvider,
        active_model: aiModel,
        preview_page_limit: Number(previewLimit),
        per_book_budget: Number(budgetCap),
      });
      setAiSettings(updated);
      alert("AI Provider Settings updated successfully.");
    } catch (err: any) {
      alert("Error updating AI settings: " + err.message);
    } finally {
      setSavingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#C98A84] font-medium">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Opening Admin Studio...</span>
        </div>
      </div>
    );
  }

  const activePage = selectedStory?.pages?.[selectedPageIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-[#C98A84] font-semibold">
            Administrative Atelier
          </div>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl font-bold text-[#2D222A]">
            Story Studio & Engine Control
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[#F7F3EC] p-1.5 rounded-full border border-[#EBE3D9] text-xs font-medium text-[#695B64]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-1.5 rounded-full transition ${activeTab === "overview" ? "bg-white text-[#2D222A] shadow-sm font-semibold" : "hover:text-[#2D222A]"}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`px-4 py-1.5 rounded-full transition ${activeTab === "stories" ? "bg-white text-[#2D222A] shadow-sm font-semibold" : "hover:text-[#2D222A]"}`}
          >
            Story & Page Editor
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-1.5 rounded-full transition ${activeTab === "ai" ? "bg-white text-[#2D222A] shadow-sm font-semibold" : "hover:text-[#2D222A]"}`}
          >
            AI Providers
          </button>
        </div>
      </div>

      {/* 1. Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-8">
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="editorial-card p-6 bg-white space-y-2">
              <span className="text-xs text-[#695B64] font-medium">Total Stories</span>
              <div className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
                {stats.total_stories}
              </div>
              <span className="text-[11px] text-[#8F9E8B] block font-medium">
                {stats.published_stories} Published • {stats.draft_stories} Drafts
              </span>
            </div>

            <div className="editorial-card p-6 bg-white space-y-2">
              <span className="text-xs text-[#695B64] font-medium">Personalization Jobs</span>
              <div className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
                {stats.total_jobs}
              </div>
              <span className="text-[11px] text-[#C98A84] block font-medium">
                {stats.generating_jobs} Currently Active
              </span>
            </div>

            <div className="editorial-card p-6 bg-white space-y-2">
              <span className="text-xs text-[#695B64] font-medium">Completed Books</span>
              <div className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
                {stats.completed_jobs}
              </div>
              <span className="text-[11px] text-[#8F9E8B] block font-medium">
                {stats.total_books} PDF Previews Rendered
              </span>
            </div>

            <div className="editorial-card p-6 bg-white space-y-2">
              <span className="text-xs text-[#695B64] font-medium">Failed / Flagged Jobs</span>
              <div className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
                {stats.failed_jobs}
              </div>
              <span className="text-[11px] text-[#A2949E] block font-medium">
                Recoverable via Page Retry
              </span>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="editorial-card p-8 bg-[#F7F3EC] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                3-Image Character Consistency Proof-of-Concept
              </h3>
              <p className="text-xs text-[#695B64]">
                Evaluate how well the current image generation pipeline preserves child facial likeness and style across portrait, action, and rescue scenes.
              </p>
            </div>
            <Link
              to="/poc"
              className="px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-sm transition"
            >
              Launch POC Test Suite
            </Link>
          </div>
        </div>
      )}

      {/* 2. Story & Page Editor Tab */}
      {activeTab === "stories" && selectedStory && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-[#695B64]">Editing Story Template:</span>
              <h2 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                {selectedStory.title} ({selectedStory.page_count} Pages)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Thumbnails Sidebar */}
            <div className="lg:col-span-4 editorial-card p-4 bg-white space-y-3 max-h-[750px] overflow-y-auto">
              <span className="text-xs font-semibold text-[#2D222A] block px-2">
                Pages & Beats List
              </span>
              <div className="space-y-2">
                {selectedStory.pages.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPage(idx)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center gap-3 border transition ${
                      selectedPageIndex === idx
                        ? "bg-[#FAEEED] border-[#C98A84] shadow-xs"
                        : "bg-white border-[#EBE3D9] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-[#FAF7F2] overflow-hidden shrink-0 border border-[#EBE3D9]">
                      <img src={p.original_image_url} alt={`P${p.page_number}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D222A]">Page {String(p.page_number).padStart(2, "0")}</span>
                        <span className="text-[10px] uppercase font-semibold text-[#C98A84]">{p.page_type}</span>
                      </div>
                      <p className="text-[11px] text-[#695B64] truncate">
                        {p.scene_description || "Scene illustration"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Large Preview & Form */}
            {activePage && (
              <div className="lg:col-span-8 editorial-card p-8 bg-white space-y-8">
                <div className="flex items-center justify-between border-b border-[#EBE3D9] pb-4">
                  <div>
                    <span className="text-xs text-[#C98A84] font-semibold">Page #{String(activePage.page_number).padStart(2, "0")} Inspector</span>
                    <h3 className="font-editorial-serif text-2xl font-bold text-[#2D222A]">
                      {activePage.page_type.toUpperCase()} • 210×210 mm Trim
                    </h3>
                  </div>

                  <button
                    onClick={handleSavePage}
                    disabled={savingPage}
                    className="px-5 py-2.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingPage ? "Saving..." : "Save Changes"}</span>
                  </button>
                </div>

                {saveSuccess && (
                  <div className="p-3 rounded-xl bg-[#EEF4ED] text-[#4E7048] text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Story page updated successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  {/* Page Image */}
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-[#2D222A] block">Source Artwork Image</span>
                    <div className="aspect-square rounded-2xl overflow-hidden border border-[#EBE3D9] bg-[#FAF7F2]">
                      <img src={activePage.original_image_url} alt="Source Artwork" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-5 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#2D222A] block">Story Text (Rendered by ReportLab)</label>
                      <textarea
                        rows={4}
                        value={pageEditText}
                        onChange={(e) => setPageEditText(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
                        placeholder="Typeset story narrative..."
                      />
                      <p className="text-[10px] text-[#695B64]">Use {'{child_name}'} for personalized child insertion.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#2D222A] block">Scene Narrative Beat</label>
                      <textarea
                        rows={3}
                        value={pageEditScene}
                        onChange={(e) => setPageEditScene(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
                        placeholder="Scene action and background description..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-[#2D222A] block">AI Prompt Template</label>
                      <textarea
                        rows={3}
                        value={pageEditPrompt}
                        onChange={(e) => setPageEditPrompt(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
                        placeholder="Base illustration prompt..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. AI Providers Tab */}
      {activeTab === "ai" && aiSettings && (
        <div className="editorial-card p-8 bg-white max-w-3xl mx-auto space-y-8">
          <div className="space-y-2 border-b border-[#EBE3D9] pb-4">
            <h2 className="font-editorial-serif text-3xl font-bold text-[#2D222A]">
              AI Provider Configuration
            </h2>
            <p className="text-xs text-[#695B64]">
              Manage the story analysis and image diffusion backends, preview generation limits, and per-book budgets.
            </p>
          </div>

          {/* Hardware Diagnostic Banner */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE3D9] flex items-center gap-3">
            <Cpu className="w-5 h-5 text-[#8F9E8B] shrink-0" />
            <div className="text-xs">
              <strong className="text-[#2D222A] block">Hardware Detection:</strong>
              <span className="text-[#695B64]">{aiSettings.hardware_acceleration}</span>
            </div>
          </div>

          <div className="space-y-6 text-xs">
            {/* Provider Switcher */}
            <div className="space-y-2">
              <label className="font-semibold text-[#2D222A] block">Active Image Generation Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
              >
                <option value="huggingface">Hugging Face Diffusers (Hosted Inference API / Serverless)</option>
                <option value="mock_poc">Deterministic Mock Provider (Simulated Mechanics for Offline/CI)</option>
                <option value="local_diffusers">Local Diffusers (GPU only - Disabled when no CUDA)</option>
              </select>
            </div>

            {/* Model Name */}
            <div className="space-y-2">
              <label className="font-semibold text-[#2D222A] block">Model Identifier</label>
              <input
                type="text"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
              />
            </div>

            {/* Preview Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-semibold text-[#2D222A] block">Preview Page Count Limit</label>
                <input
                  type="number"
                  value={previewLimit}
                  onChange={(e) => setPreviewLimit(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-[#2D222A] block">Per-Book Budget Cap ($ USD)</label>
                <input
                  type="number"
                  step="0.10"
                  value={budgetCap}
                  onChange={(e) => setBudgetCap(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-[#D8CCC0] bg-[#FAF7F2] text-[#2D222A] focus:outline-none focus:ring-1 focus:ring-[#C98A84]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveAiSettings}
              disabled={savingAi}
              className="w-full py-3.5 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {savingAi ? "Updating Settings..." : "Save AI Provider Configuration"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

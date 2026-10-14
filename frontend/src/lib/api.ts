const API_BASE = "/api/v1";

export interface StoryPage {
  id: string;
  story_id: string;
  page_index: number;
  page_number: number;
  page_type: string;
  story_text: string;
  extracted_text: string;
  scene_description: string;
  character_guidance: string;
  prompt_template: string;
  personalization_required: boolean;
  allow_illustration_generation: boolean;
  original_image_path: string;
  original_image_url: string;
}

export interface StoryTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  age_range: string;
  language: string;
  price_digital: number;
  price_print: number;
  currency: string;
  status: string;
  page_count: number;
  cover_image_path: string;
  cover_image_url: string;
  created_at: string;
  updated_at: string;
  pages: StoryPage[];
}

export interface GeneratedAsset {
  id: string;
  job_id: string;
  story_page_id: string;
  page_number: number;
  asset_version: number;
  storage_path: string;
  image_url: string;
  provider: string;
  model: string;
  prompt_used: string;
  generation_status: string;
  review_status: string;
  cost_estimate: number;
  generation_time_sec: number;
  error_message?: string;
  created_at: string;
}

export interface PersonalizationJob {
  id: string;
  user_id?: string;
  story_id: string;
  child_name: string;
  photo_path: string;
  photo_url: string;
  status: string;
  current_stage: string;
  total_pages: number;
  completed_pages: number;
  failed_pages: number;
  retry_count: number;
  error_details?: string;
  created_at: string;
  updated_at: string;
  assets: GeneratedAsset[];
}

export interface AISettings {
  active_story_provider: string;
  active_image_provider: string;
  active_model: string;
  preview_page_limit: number;
  max_retries: number;
  concurrency_limit: number;
  per_book_budget: number;
  is_paid_enabled: boolean;
  hardware_acceleration: string;
}

export interface POCTestResult {
  test_id: string;
  child_name: string;
  child_reference_url: string;
  provider_used: string;
  model_used: string;
  hardware_check: any;
  summary: string;
  status: string;
  pages: Array<{
    page_number: number;
    scene_type: string;
    source_description: string;
    prompt: string;
    saved_path: string;
    image_url: string;
    provider: string;
    model: string;
    generation_time_sec: number;
    cost_estimate: number;
    is_simulated: boolean;
    review_status: string;
  }>;
}

export const api = {
  async getStories(): Promise<StoryTemplate[]> {
    const res = await fetch(`${API_BASE}/stories`);
    if (!res.ok) throw new Error("Failed to fetch stories");
    return res.json();
  },

  async getStory(slugOrId: string): Promise<StoryTemplate> {
    const res = await fetch(`${API_BASE}/stories/${slugOrId}`);
    if (!res.ok) throw new Error("Failed to fetch story details");
    return res.json();
  },

  async startPersonalization(formData: FormData): Promise<PersonalizationJob> {
    const res = await fetch(`${API_BASE}/personalization`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to start personalization");
    }
    return res.json();
  },

  async getPersonalizationJob(jobId: string): Promise<PersonalizationJob> {
    const res = await fetch(`${API_BASE}/personalization/${jobId}`);
    if (!res.ok) throw new Error("Failed to fetch job progress");
    return res.json();
  },

  async retryAsset(assetId: string): Promise<GeneratedAsset> {
    const res = await fetch(`${API_BASE}/personalization/assets/${assetId}/retry`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to regenerate page");
    return res.json();
  },

  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    if (!res.ok) throw new Error("Failed to fetch admin stats");
    return res.json();
  },

  async getAdminStories(): Promise<StoryTemplate[]> {
    const res = await fetch(`${API_BASE}/admin/stories`);
    if (!res.ok) throw new Error("Failed to fetch admin stories");
    return res.json();
  },

  async updateStoryPage(pageId: string, data: Partial<StoryPage>): Promise<StoryPage> {
    const res = await fetch(`${API_BASE}/admin/pages/${pageId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update story page");
    return res.json();
  },

  async reviewAsset(assetId: string, reviewStatus: "approved" | "rejected") {
    const res = await fetch(`${API_BASE}/admin/assets/${assetId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_status: reviewStatus }),
    });
    if (!res.ok) throw new Error("Failed to update review status");
    return res.json();
  },

  async getAISettings(): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/admin/ai/settings`);
    if (!res.ok) throw new Error("Failed to fetch AI settings");
    return res.json();
  },

  async updateAISettings(data: Partial<AISettings>): Promise<AISettings> {
    const res = await fetch(`${API_BASE}/admin/ai/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update AI settings");
    return res.json();
  },

  async runPOCTest(childName: string = "Mia"): Promise<POCTestResult> {
    const res = await fetch(`${API_BASE}/admin/ai/poc-test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ child_name: childName }),
    });
    if (!res.ok) throw new Error("Failed to run character consistency POC");
    return res.json();
  },
};

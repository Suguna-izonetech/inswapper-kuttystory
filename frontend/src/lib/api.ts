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
  face_outline_points?: string;
  text_x?: number;
  text_y?: number;
  font_size?: number;
  font_family?: string;
  font_color?: string;
  letter_spacing?: number;
  stroke_color?: string;
  stroke_width?: number;
  has_shadow?: boolean;
  soft_line_break?: boolean;
  has_background_box?: boolean;
  warp_style?: string;
  gender_variant?: string;
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
  target_gender?: string;
  min_age?: number;
  max_age?: number;
}

export interface CreateBookPayload {
  title: string;
  slug?: string;
  category: string;
  min_age: number;
  max_age: number;
  age_range?: string;
  price_digital: number;
  price_print: number;
  currency?: string;
  page_count: number;
  description?: string;
  cover_image_url?: string;
  cover_image_path?: string;
  status?: string;
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
  story_text?: string;
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
  story_title?: string;
  story_slug?: string;
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
  pages_label?: string;
  is_purchased?: boolean;
  created_formatted?: string;
  pdf_download_url?: string;
  print_pdf_url?: string;
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

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email?: string;
  book_id?: string;
  job_id?: string;
  format_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_status: string;
  shipping_address?: string;
  created_at: string;
}

export interface AdminDashboardData {
  revenue: number;
  revenue_formatted: string;
  currency_symbol: string;
  currency: string;
  paid_orders: number;
  previews_created: number;
  live_stories: number;
  recent_orders: Order[];
  status_counts: Record<string, number>;
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

  async validatePhoto(fileOrBlob: Blob | File): Promise<any> {
    const formData = new FormData();
    formData.append("photo", fileOrBlob, "upload.jpg");
    const res = await fetch(`${API_BASE}/personalization/validate-photo`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Photo validation failed");
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

  async triggerFullGeneration(jobId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/personalization/${jobId}/generate-full`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to trigger full book generation");
    return res.json();
  },

  async retryAsset(assetId: string): Promise<GeneratedAsset> {
    const res = await fetch(`${API_BASE}/personalization/assets/${assetId}/retry`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to regenerate page");
    return res.json();
  },

  async getLanguages(): Promise<{ default: string; languages: Array<{ id: string; name: string; native: string; code: string }> }> {
    const res = await fetch(`${API_BASE}/personalization/languages`);
    if (!res.ok) throw new Error("Failed to fetch languages");
    return res.json();
  },

  async translateJob(jobId: string, targetLanguage: string): Promise<{ job_id: string; target_language: string; translations: Record<string, string> }> {
    const res = await fetch(`${API_BASE}/personalization/${jobId}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_language: targetLanguage }),
    });
    if (!res.ok) throw new Error("Failed to translate story");
    return res.json();
  },

  async getDashboard(): Promise<AdminDashboardData> {
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    if (!res.ok) throw new Error("Failed to fetch admin dashboard");
    return res.json();
  },

  async getOrders(params?: { status?: string; search?: string }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.search) query.append("search", params.search);
    const qs = query.toString();
    const res = await fetch(`${API_BASE}/admin/orders${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update order status");
    return res.json();
  },

  async deleteOrder(orderId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete order");
  },

  async reseedDashboard(): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/admin/seed`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reseed database");
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

  async createAdminStory(data: CreateBookPayload, pdfFile?: File | null): Promise<StoryTemplate> {
    if (pdfFile) {
      const formData = new FormData();
      formData.append("title", data.title);
      if (data.slug) formData.append("slug", data.slug);
      formData.append("category", data.category);
      formData.append("min_age", String(data.min_age));
      formData.append("max_age", String(data.max_age));
      if (data.age_range) formData.append("age_range", data.age_range);
      formData.append("price_digital", String(data.price_digital));
      formData.append("price_print", String(data.price_print));
      formData.append("currency", data.currency || "INR");
      formData.append("page_count", String(data.page_count));
      if (data.description) formData.append("description", data.description);
      if (data.cover_image_url) formData.append("cover_image_url", data.cover_image_url);
      formData.append("pdf_file", pdfFile);

      const res = await fetch(`${API_BASE}/admin/stories/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to import story from PDF");
      }
      return res.json();
    }

    const res = await fetch(`${API_BASE}/admin/stories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create book");
    }
    return res.json();
  },

  async updateAdminStory(storyId: string, data: Partial<StoryTemplate>): Promise<StoryTemplate> {
    const res = await fetch(`${API_BASE}/admin/stories/${storyId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update story");
    return res.json();
  },

  async toggleStoryStatus(storyId: string): Promise<StoryTemplate> {
    const res = await fetch(`${API_BASE}/admin/stories/${storyId}/toggle-status`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to toggle story status");
    return res.json();
  },

  async deleteAdminStory(storyId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/admin/stories/${storyId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete story");
    return res.json();
  },

  async getJobs(): Promise<PersonalizationJob[]> {
    const res = await fetch(`${API_BASE}/admin/jobs`);
    if (!res.ok) throw new Error("Failed to fetch jobs");
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

  async uploadPageBaseArt(pageId: string, file: File): Promise<StoryPage> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/admin/pages/${pageId}/upload-base-art`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload base illustration");
    return res.json();
  },

  async autoTracePage(pageId: string): Promise<StoryPage> {
    const res = await fetch(`${API_BASE}/admin/pages/${pageId}/auto-trace`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to auto-trace page");
    return res.json();
  },

  async autoTraceAllPages(storyId: string): Promise<{ status: string; message: string; count: number }> {
    const res = await fetch(`${API_BASE}/admin/stories/${storyId}/auto-trace-all`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to auto-trace all pages");
    return res.json();
  },

  async addStoryPage(storyId: string, data: Partial<StoryPage>): Promise<StoryPage> {
    const res = await fetch(`${API_BASE}/admin/stories/${storyId}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add page");
    return res.json();
  },

  async deleteStoryPage(pageId: string): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/admin/pages/${pageId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete page");
    return res.json();
  },

  async compareProviders(file?: File, presets?: string): Promise<{
    status: string;
    message: string;
    results: { provider: string; cost: string; url: string }[];
  }> {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (presets) formData.append("presets", presets);
    const res = await fetch(`${API_BASE}/admin/compare-providers`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to run provider comparison");
    return res.json();
  },

  async testRenderBook(data: { story_id: string; child_name: string; photo?: File }): Promise<PersonalizationJob> {
    const formData = new FormData();
    formData.append("story_id", data.story_id);
    formData.append("child_name", data.child_name);
    if (data.photo) formData.append("photo", data.photo);
    const res = await fetch(`${API_BASE}/personalization/test-render`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to create test render");
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

  async registerAdmin(data: {
    name: string;
    phone?: string;
    email: string;
    password: string;
    confirm_password: string;
  }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to create account");
    }
    return res.json();
  },

  async loginAdmin(data: { username: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Invalid username or password");
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to request password reset");
    }
    return res.json();
  },

  async resetPassword(data: {
    email: string;
    code: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to reset password");
    }
    return res.json();
  },

  async getCurrentUser(token?: string): Promise<UserProfile> {
    const authToken = token || localStorage.getItem("kutty_admin_token");
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  },
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
  email: string;
  smtp_sent: boolean;
}

export const authService = {
  saveSession(token: string, user: UserProfile) {
    localStorage.setItem("kutty_admin_token", token);
    localStorage.setItem("kutty_admin_user", JSON.stringify(user));
  },
  getUser(): UserProfile | null {
    try {
      const str = localStorage.getItem("kutty_admin_user");
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },
  getToken(): string | null {
    return localStorage.getItem("kutty_admin_token");
  },
  isAuthenticated(): boolean {
    return !!localStorage.getItem("kutty_admin_token");
  },
  logout() {
    localStorage.removeItem("kutty_admin_token");
    localStorage.removeItem("kutty_admin_user");
  },
};

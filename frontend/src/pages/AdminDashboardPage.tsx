import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Sparkles,
  BookOpen,
  FileEdit,
  Settings,
  LogOut,
  RefreshCw,
  Plus,
  Search,
  CheckCircle,
  Save,
  Cpu,
  Trash2,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Wand2,
  ChevronDown,
  Check,
  Upload,
  Eye,
  Layers,
  Type,
  Sliders,
  HelpCircle,
  AlertCircle,
  Download,
  Feather,
  Heart,
  MapPin,
  GraduationCap,
  MessageSquareHeart,
  Video,
  Pencil,
  CreditCard,
  Star,
  Truck,
  Mail,
  Edit3
} from "lucide-react";
import {
  api,
  authService,
  UserProfile,
  AdminDashboardData,
  Order,
  PaymentTransaction,
  StoryTemplate,
  StoryPage,
  AISettings,
  PersonalizationJob,
  ChildStory,
  FeedbackItem,
} from "@/lib/api";

type TabType = "dashboard" | "orders" | "payments" | "previews" | "stories" | "page_editor" | "settings" | "child_stories" | "feedback";

export default function AdminDashboardPage({ initialTab }: { initialTab?: TabType }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getUser());

  // Initialize tab from prop or URL
  const getInitialTab = (): TabType => {
    if (initialTab) return initialTab;
    const path = window.location.pathname.toLowerCase();
    if (path.includes("/feedback")) return "feedback";
    if (path.includes("/payments")) return "payments";
    if (path.includes("/child_stories") || path.includes("/child-stories")) return "child_stories";
    if (path.includes("/stories")) return "stories";
    if (path.includes("/orders")) return "orders";
    if (path.includes("/previews")) return "previews";
    if (path.includes("/page_editor")) return "page_editor";
    if (path.includes("/settings")) return "settings";
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState<TabType>(getInitialTab);

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Orders Management Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New Order Form state
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newAmount, setNewAmount] = useState("1299");
  const [newStatus, setNewStatus] = useState("Paid");
  const [newFormat, setNewFormat] = useState("print_hardcover");
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Shipping Tracking & Email Modal state
  const [shippingModal, setShippingModal] = useState<{
    order: Order;
    carrier: string;
    trackingId: string;
    customerEmail: string;
  } | null>(null);
  const [shippingSubmitting, setShippingSubmitting] = useState(false);
  const [statusToast, setStatusToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setStatusToast({ message, type });
    setTimeout(() => {
      setStatusToast(null);
    }, 4500);
  };

  // Payments & Transactions Data
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Stories & Page Editor Data
  const [stories, setStories] = useState<StoryTemplate[]>([]);
  const [storySearch, setStorySearch] = useState("");
  const [storyCategoryFilter, setStoryCategoryFilter] = useState("all");
  const [storyStatusFilter, setStoryStatusFilter] = useState("all");

  // Create a Book Modal state
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookSlug, setNewBookSlug] = useState("");
  const [newBookSlugTouched, setNewBookSlugTouched] = useState(false);
  const [newBookCategory, setNewBookCategory] = useState("ADVENTURE");
  const [newBookMinAge, setNewBookMinAge] = useState(3);
  const [newBookMaxAge, setNewBookMaxAge] = useState(7);
  const [newBookPdfPrice, setNewBookPdfPrice] = useState(799);
  const [newBookPrintPrice, setNewBookPrintPrice] = useState(1399);
  const [newBookTotalPages, setNewBookTotalPages] = useState(28);
  const [newBookTagline, setNewBookTagline] = useState("");
  const [newBookCoverUrl, setNewBookCoverUrl] = useState("");
  const [newBookPdfFile, setNewBookPdfFile] = useState<File | null>(null);
  const [creatingBook, setCreatingBook] = useState(false);
  const [bookError, setBookError] = useState("");

  // Edit Age Range & Pricing Modal state
  const [showEditAgeModal, setShowEditAgeModal] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState<StoryTemplate | null>(null);
  const [editMinAge, setEditMinAge] = useState(3);
  const [editMaxAge, setEditMaxAge] = useState(7);
  const [editPdfPrice, setEditPdfPrice] = useState(799);
  const [editPrintPrice, setEditPrintPrice] = useState(1399);
  const [editCategory, setEditCategory] = useState("ADVENTURE");
  const [savingAgeEdit, setSavingAgeEdit] = useState(false);

  const [selectedStory, setSelectedStory] = useState<StoryTemplate | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [pageEditText, setPageEditText] = useState("");
  const [pageEditScene, setPageEditScene] = useState("");
  const [pageEditPrompt, setPageEditPrompt] = useState("");
  const [savingPage, setSavingPage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Page Editor (CMS) Extended States matching reference screenshots
  const [selectedGender, setSelectedGender] = useState<"boy" | "girl">("boy");
  const [targetGender, setTargetGender] = useState<"boy" | "girl" | "both">("both");
  const [bookMinAge, setBookMinAge] = useState<number>(2);
  const [bookMaxAge, setBookMaxAge] = useState<number>(13);
  const [ageSavedBadge, setAgeSavedBadge] = useState<boolean>(true);

  // Current page inspector fields
  const [pageNumberInput, setPageNumberInput] = useState<number>(1);
  const [pageStylePrompt, setPageStylePrompt] = useState<string>("children's storybook illustration, soft colours, consistent character, clean line art");
  const [facePoints, setFacePoints] = useState<[number, number][]>([]);
  const [personalizationRequired, setPersonalizationRequired] = useState<boolean>(true);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [autoTracing, setAutoTracing] = useState<boolean>(false);
  const [autoTracingAll, setAutoTracingAll] = useState<boolean>(false);
  const [textRows, setTextRows] = useState<string[]>([""]);
  const [activeTextRowIdx, setActiveTextRowIdx] = useState<number>(0);
  const [textX, setTextX] = useState<number>(50.0);
  const [textY, setTextY] = useState<number>(89.5);
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontColor, setFontColor] = useState<string>("#000000");
  const [fontFamily, setFontFamily] = useState<string>("Sans (DejaVu Bold)");
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [strokeColor, setStrokeColor] = useState<string>("#FFFFFF");
  const [strokeWidth, setStrokeWidth] = useState<number>(0);
  const [hasShadow, setHasShadow] = useState<boolean>(true);
  const [softLineBreak, setSoftLineBreak] = useState<boolean>(true);
  const [hasBackgroundBox, setHasBackgroundBox] = useState<boolean>(false);
  const [warpStyle, setWarpStyle] = useState<string>("None");
  const [uploadingBaseArt, setUploadingBaseArt] = useState<boolean>(false);
  const [generatingBaseArt, setGeneratingBaseArt] = useState<boolean>(false);
  const [editorNotice, setEditorNotice] = useState<string>("");

  // Compare Image Providers
  const [selectedPresets, setSelectedPresets] = useState<string[]>([
    "low q · low fidelity ~$0.02",
    "low q · high fidelity ~$0.11",
    "medium q · high fidelity ~$0.14",
    "high q · high fidelity ~$0.26"
  ]);
  const [comparingProviders, setComparingProviders] = useState<boolean>(false);
  const [comparisonResults, setComparisonResults] = useState<{ provider: string; cost: string; url: string }[]>([]);

  const baseArtFileRef = useRef<HTMLInputElement | null>(null);
  const comparePhotoRef = useRef<HTMLInputElement | null>(null);
  const canvasSvgRef = useRef<SVGSVGElement | null>(null);

  // Previews / Jobs Data
  const [jobs, setJobs] = useState<PersonalizationJob[]>([]);
  const [previewFilter, setPreviewFilter] = useState<"all" | "purchased">("all");
  const [showTestRenderModal, setShowTestRenderModal] = useState(false);
  const [testRenderStoryId, setTestRenderStoryId] = useState("");
  const [testRenderChildName, setTestRenderChildName] = useState("");
  const [testRenderPhotoFile, setTestRenderPhotoFile] = useState<File | null>(null);
  const [submittingTestRender, setSubmittingTestRender] = useState(false);
  const [selectedJobForPhotos, setSelectedJobForPhotos] = useState<PersonalizationJob | null>(null);
  const [generatingFullJob, setGeneratingFullJob] = useState<PersonalizationJob | null>(null);

  // Provider settings
  const [aiSettings, setAiSettings] = useState<AISettings | null>(null);
  const [aiProvider, setAiProvider] = useState("huggingface");
  const [aiModel, setAiModel] = useState("stabilityai/stable-diffusion-xl-base-1.0");
  const [previewLimit, setPreviewLimit] = useState(5);
  const [budgetCap, setBudgetCap] = useState(2.5);
  const [savingAi, setSavingAi] = useState(false);

  // Children's Written Stories Data
  const [adminChildStories, setAdminChildStories] = useState<ChildStory[]>([]);
  const [childStoryFilter, setChildStoryFilter] = useState("all");
  const [childStorySearch, setChildStorySearch] = useState("");
  const [selectedAdminChildStory, setSelectedAdminChildStory] = useState<ChildStory | null>(null);
  const [loadingChildStories, setLoadingChildStories] = useState(false);

  const fetchAdminChildStories = async (statusOverride?: string) => {
    setLoadingChildStories(true);
    try {
      const st = statusOverride !== undefined ? statusOverride : childStoryFilter;
      const data = await api.getAllChildStoriesAdmin(st);
      setAdminChildStories(data);
    } catch (err) {
      console.error("Error loading child stories:", err);
    } finally {
      setLoadingChildStories(false);
    }
  };

  const handleUpdateChildStoryStatus = async (id: string, newStatus: "approved" | "pending" | "featured" | "rejected") => {
    try {
      await api.updateChildStoryAdmin(id, { status: newStatus });
      fetchAdminChildStories();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteChildStory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this story submission?")) return;
    try {
      await api.deleteChildStoryAdmin(id);
      fetchAdminChildStories();
      if (selectedAdminChildStory?.id === id) {
        setSelectedAdminChildStory(null);
      }
    } catch (err: any) {
      alert("Failed to delete story: " + err.message);
    }
  };

  // Customer Feedback Management Data
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [viewingMedia, setViewingMedia] = useState<{ url: string; type?: string; author: string } | null>(null);
  const [editFeedbackForm, setEditFeedbackForm] = useState({ name: "", place: "", rating: 5, review_text: "" });
  const [savingFeedbackEdit, setSavingFeedbackEdit] = useState(false);

  const fetchAdminFeedbacks = async (statusOverride?: "all" | "pending" | "approved" | "rejected") => {
    setLoadingFeedbacks(true);
    try {
      const st = statusOverride !== undefined ? statusOverride : feedbackFilter;
      const data = await api.getAdminFeedbacks(st === "all" ? undefined : st);
      setFeedbacks(data);
    } catch (err: any) {
      console.error("Error loading feedbacks:", err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const syncFeedbackUpdate = () => {
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("kutty_feedback_sync");
        channel.postMessage({ type: "FEEDBACK_UPDATED", timestamp: Date.now() });
        channel.close();
      }
      localStorage.setItem("kuttystory_feedback_updated", Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleTogglePublish = async (fb: FeedbackItem) => {
    const isCurrentlyApproved = fb.status === "approved";
    const targetStatus = isCurrentlyApproved ? "pending" : "approved";
    try {
      await api.updateFeedbackStatus(fb.id, targetStatus);
      await fetchAdminFeedbacks();
      syncFeedbackUpdate();
      const message =
        targetStatus === "approved"
          ? `Published: Review by ${fb.name} is now live in the Foot Steps "Heartfelt Memories" section.`
          : `Unpublished: Review by ${fb.name} has been unpublished from the Foot Steps page.`;
      setFeedbackNotice(message);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      alert("Failed to update publication status: " + (err.message || err));
    }
  };

  const handleUpdateFeedbackStatus = async (id: string, newStatus: "approved" | "pending" | "rejected", authorName?: string) => {
    try {
      await api.updateFeedbackStatus(id, newStatus);
      await fetchAdminFeedbacks();
      syncFeedbackUpdate();
      const actionLabel =
        newStatus === "approved"
          ? "approved & published to Foot Steps"
          : newStatus === "rejected"
          ? "marked as Rejected"
          : "set to Pending";
      setFeedbackNotice(`Review${authorName ? ` by ${authorName}` : ""} has been ${actionLabel}.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      alert("Failed to update feedback status: " + (err.message || err));
    }
  };

  const handleDeleteFeedback = async (id: string, authorName?: string) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete the feedback submission${
          authorName ? ` by ${authorName}` : ""
        }? This destructive action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await api.deleteFeedback(id);
      await fetchAdminFeedbacks();
      syncFeedbackUpdate();
      setFeedbackNotice(`Review by ${authorName || "customer"} permanently deleted.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      alert("Failed to delete feedback: " + (err.message || err));
    }
  };

  const startEditFeedback = (fb: FeedbackItem) => {
    setEditingFeedback(fb);
    setEditFeedbackForm({
      name: fb.name,
      place: fb.place,
      rating: fb.rating,
      review_text: fb.review_text || "",
    });
  };

  const handleSaveFeedbackEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeedback) return;
    if (!editFeedbackForm.name.trim() || !editFeedbackForm.place.trim()) {
      alert("Please fill in author name and place.");
      return;
    }
    setSavingFeedbackEdit(true);
    try {
      await api.editFeedback(editingFeedback.id, {
        name: editFeedbackForm.name.trim(),
        place: editFeedbackForm.place.trim(),
        rating: editFeedbackForm.rating,
        review_text: editFeedbackForm.review_text.trim(),
      });
      setEditingFeedback(null);
      await fetchAdminFeedbacks();
      syncFeedbackUpdate();
      setFeedbackNotice(`Updated review details for ${editFeedbackForm.name.trim()}.`);
      setTimeout(() => setFeedbackNotice(null), 4000);
    } catch (err: any) {
      alert("Failed to update feedback: " + (err.message || err));
    } finally {
      setSavingFeedbackEdit(false);
    }
  };

  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      navigate("/admin_login");
      return;
    }
    setCurrentUser(user);
    loadAllData();
  }, [navigate]);

  // Refs to track active generation state without dependency churn
  const generatingFullJobRef = useRef<PersonalizationJob | null>(generatingFullJob);
  generatingFullJobRef.current = generatingFullJob;

  const selectedJobForPhotosRef = useRef<PersonalizationJob | null>(selectedJobForPhotos);
  selectedJobForPhotosRef.current = selectedJobForPhotos;

  // Polling for active background HD rendering jobs - sequential without request flooding
  useEffect(() => {
    // Only poll if user is actively generating a full job OR has a recently active rendering job (<10 mins old)
    const hasActiveRendering = Boolean(generatingFullJob) || jobs.some(j => {
      const isRendering = j.status?.toLowerCase().includes("rendering") || j.status === "in_progress";
      if (!isRendering) return false;
      const jobTime = j.updated_at ? new Date(j.updated_at).getTime() : (j.created_at ? new Date(j.created_at).getTime() : 0);
      return Date.now() - jobTime < 10 * 60 * 1000;
    });

    if (!hasActiveRendering) return;

    let isMounted = true;
    let isFetching = false;
    let timerId: any = null;

    const poll = async () => {
      if (!isMounted || isFetching) return;
      isFetching = true;

      try {
        const updatedJobs = await api.getJobs();
        if (!isMounted) return;

        setJobs(updatedJobs);

        const activeGen = generatingFullJobRef.current;
        if (activeGen) {
          const match = updatedJobs.find(j => j.id === activeGen.id);
          if (match) {
            setGeneratingFullJob(match);
            if (match.completed_pages >= match.total_pages && (match.status === "completed" || !match.status.includes("Rendering"))) {
              const rawUrl = match.print_pdf_url || `/api/v1/personalization/${match.id}/print-pdf?size=8x8&color=rgb&admin=true`;
              const url = api.resolveUrl(rawUrl);
              window.open(url, "_blank");
              setTimeout(() => {
                if (isMounted) setGeneratingFullJob(null);
              }, 2500);
            }
          }
        }

        const activeModal = selectedJobForPhotosRef.current;
        if (activeModal) {
          const matchModal = updatedJobs.find(j => j.id === activeModal.id);
          if (matchModal) {
            setSelectedJobForPhotos(matchModal);
          }
        }

        // Check if any job is still actively rendering
        const stillRendering = Boolean(generatingFullJobRef.current) || updatedJobs.some(j => {
          const isRendering = j.status?.toLowerCase().includes("rendering") || j.status === "in_progress";
          if (!isRendering) return false;
          const jobTime = j.updated_at ? new Date(j.updated_at).getTime() : (j.created_at ? new Date(j.created_at).getTime() : 0);
          return Date.now() - jobTime < 10 * 60 * 1000;
        });

        if (isMounted && stillRendering) {
          timerId = setTimeout(poll, 4000);
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (isMounted) {
          timerId = setTimeout(poll, 6000);
        }
      } finally {
        isFetching = false;
      }
    };

    timerId = setTimeout(poll, 4000);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [Boolean(generatingFullJob)]);

  const fetchPaymentTransactions = async () => {
    setLoadingPayments(true);
    try {
      const data = await api.getPaymentTransactions();
      setPaymentTransactions(data || []);
    } catch (err) {
      console.error("Error loading payment transactions:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dash, storiesData, aiData, jobsData, ordersList, childStoriesData, feedbacksData] = await Promise.all([
        api.getDashboard().catch(() => null),
        api.getAdminStories().catch(() => []),
        api.getAISettings().catch(() => null),
        api.getJobs().catch(() => []),
        api.getOrders().catch(() => []),
        api.getAllChildStoriesAdmin().catch(() => []),
        api.getAdminFeedbacks().catch(() => []),
      ]);

      if (dash) setDashboardData(dash);
      if (storiesData) {
        setStories(storiesData);
        if (storiesData.length > 0) {
          const firstStory = storiesData[0];
          setSelectedStory(firstStory);
          if (firstStory.pages?.length > 0) {
            syncPageForm(firstStory.pages[0]);
          }
        }
      }
      if (aiData) {
        setAiSettings(aiData);
        setAiProvider(aiData.active_image_provider);
        setAiModel(aiData.active_model);
        setPreviewLimit(aiData.preview_page_limit);
        setBudgetCap(aiData.per_book_budget);
      }
      if (jobsData) setJobs(jobsData);
      if (ordersList) setOrders(ordersList);
      if (childStoriesData) setAdminChildStories(childStoriesData);
      if (feedbacksData) setFeedbacks(feedbacksData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const dash = await api.getDashboard();
      setDashboardData(dash);
      const ordersList = await api.getOrders();
      setOrders(ordersList);
      const txns = await api.getPaymentTransactions();
      setPaymentTransactions(txns);
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const getCssFontFamily = (font: string) => {
    if (font.includes("Serif") || font.includes("Merriweather")) return "'Merriweather', Georgia, serif";
    if (font.includes("Playful") || font.includes("Fredoka")) return "'Fredoka', cursive, sans-serif";
    if (font.includes("Handwritten") || font.includes("Caveat")) return "'Caveat', cursive, sans-serif";
    if (font.includes("Comic") || font.includes("Balsamiq")) return "'Balsamiq Sans', cursive, sans-serif";
    return "'Plus Jakarta Sans', 'Inter', 'DejaVu Sans', sans-serif";
  };

  const formatStoryText = (text: string, childName: string, softBreak: boolean) => {
    if (!text) return "";
    let res = text.replace(/\{\{name\}\}/gi, childName).replace(/\{child_name\}/gi, childName).replace(/\{name\}/gi, childName);
    if (softBreak) {
      res = res.replace(/([.!?])\s+/g, "$1\n");
    }
    return res;
  };

  const syncPageForm = (page: StoryPage) => {
    setPageEditText(page.story_text || "");
    setPageEditScene(page.scene_description || "");
    setPageEditPrompt(page.prompt_template || "");
    setPageStylePrompt(page.character_guidance || "children's storybook illustration, soft colours, consistent character, clean line art");
    setPageNumberInput(page.page_number || 1);
    setTextRows([page.story_text || ""]);
    setActiveTextRowIdx(0);
    setTextX(page.text_x !== undefined && page.text_x !== null ? page.text_x : 50.0);
    setTextY(page.text_y !== undefined && page.text_y !== null ? page.text_y : 89.5);
    setFontSize(page.font_size || 20);
    setFontFamily(page.font_family || "Sans (DejaVu Bold)");
    setFontColor(page.font_color || "#000000");
    setLetterSpacing(page.letter_spacing || 0);
    setStrokeColor(page.stroke_color || "#FFFFFF");
    setStrokeWidth(page.stroke_width !== undefined && page.stroke_width !== null ? page.stroke_width : 0);
    setHasShadow(page.has_shadow !== undefined ? page.has_shadow : true);
    setSoftLineBreak(page.soft_line_break !== undefined ? page.soft_line_break : true);
    setHasBackgroundBox(page.has_background_box || false);
    setWarpStyle(page.warp_style || "None");
    setSelectedGender((page.gender_variant as "boy" | "girl") || "boy");

    if (page.face_outline_points) {
      try {
        const pts = typeof page.face_outline_points === "string" ? JSON.parse(page.face_outline_points) : page.face_outline_points;
        if (Array.isArray(pts) && pts.length > 0) {
          setFacePoints(pts);
          setPersonalizationRequired(page.personalization_required !== undefined && page.personalization_required !== null ? Boolean(page.personalization_required) : true);
        } else {
          setFacePoints([]);
          setPersonalizationRequired(false);
        }
      } catch {
        setFacePoints([]);
        setPersonalizationRequired(false);
      }
    } else {
      setFacePoints([]);
      setPersonalizationRequired(false);
    }
    setSaveSuccess(false);
  };

  useEffect(() => {
    if (selectedStory) {
      setBookMinAge(selectedStory.min_age ?? 2);
      setBookMaxAge(selectedStory.max_age ?? 13);
      setTargetGender((selectedStory.target_gender as "boy" | "girl" | "both") || "both");
    }
  }, [selectedStory]);

  const handleSelectStory = (storyId: string) => {
    const s = stories.find(item => item.id === storyId);
    if (s) {
      setSelectedStory(s);
      setSelectedPageIndex(0);
      if (s.pages && s.pages.length > 0) {
        syncPageForm(s.pages[0]);
      }
    }
  };

  const handleSelectPage = (idx: number) => {
    setSelectedPageIndex(idx);
    if (selectedStory?.pages && selectedStory.pages[idx]) {
      syncPageForm(selectedStory.pages[idx]);
    }
  };

  const handleSavePage = async () => {
    if (!selectedStory || !selectedStory.pages || !selectedStory.pages[selectedPageIndex]) return;
    const page = selectedStory.pages[selectedPageIndex];
    setSavingPage(true);
    try {
      const updated = await api.updateStoryPage(page.id, {
        page_number: Number(pageNumberInput),
        story_text: pageEditText,
        scene_description: pageEditScene,
        prompt_template: pageEditPrompt,
        character_guidance: pageStylePrompt,
        personalization_required: personalizationRequired && facePoints.length > 0,
        face_outline_points: facePoints.length > 0 ? JSON.stringify(facePoints) : "[]",
        text_x: Number(textX),
        text_y: Number(textY),
        font_size: Number(fontSize),
        font_family: fontFamily,
        font_color: fontColor,
        letter_spacing: Number(letterSpacing),
        stroke_color: strokeColor,
        stroke_width: Number(strokeWidth),
        has_shadow: hasShadow,
        soft_line_break: softLineBreak,
        has_background_box: hasBackgroundBox,
        warp_style: warpStyle,
        gender_variant: selectedGender,
      });

      const updatedPages = [...selectedStory.pages];
      updatedPages[selectedPageIndex] = updated;
      const updatedStory = { ...selectedStory, pages: updatedPages };
      setSelectedStory(updatedStory);
      setStories(stories.map(s => s.id === selectedStory.id ? updatedStory : s));
      setSaveSuccess(true);
      setEditorNotice("Page saved successfully!");
      setTimeout(() => {
        setSaveSuccess(false);
        setEditorNotice("");
      }, 3000);
    } catch (err: any) {
      alert("Error saving page: " + err.message);
    } finally {
      setSavingPage(false);
    }
  };

  const handleSaveAvailability = async (newGender: "boy" | "girl" | "both", minA: number, maxA: number) => {
    if (!selectedStory) return;
    try {
      const updated = await api.updateAdminStory(selectedStory.id, {
        target_gender: newGender,
        min_age: minA,
        max_age: maxA,
        age_range: `Ages ${minA}-${maxA}`
      });
      setSelectedStory(updated);
      setStories(stories.map(s => s.id === updated.id ? updated : s));
      setAgeSavedBadge(true);
      setEditorNotice("Storefront availability saved!");
      setTimeout(() => setEditorNotice(""), 3000);
    } catch (err: any) {
      console.error("Failed to update book availability", err);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setIsDrawing(true);
    setFacePoints([[x, y]]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10;
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10;
    setFacePoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.hypot(last[0] - x, last[1] - y) < 0.6) return prev;
      return [...prev, [x, y]];
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const handleAutoTracePage = async () => {
    if (!activePage) return;
    setAutoTracing(true);
    try {
      const updated = await api.autoTracePage(activePage.id);
      if (updated.face_outline_points) {
        setFacePoints(JSON.parse(updated.face_outline_points));
      }
      setEditorNotice("SAM3 Auto-trace outline generated (21 points) ✓");
      setTimeout(() => setEditorNotice(""), 3500);
    } catch {
      const pts: [number, number][] = [
        [41.5, 43.2], [44.8, 42.1], [48.6, 42.5], [51.9, 44.2], [54.2, 47.5],
        [54.8, 51.3], [53.5, 55.0], [51.2, 58.6], [48.1, 61.2], [45.0, 62.1],
        [41.6, 61.5], [38.2, 59.2], [35.5, 56.1], [34.0, 52.3], [34.2, 48.2],
        [36.1, 45.4], [38.5, 43.8], [40.2, 43.2], [41.0, 43.0], [41.2, 43.1], [41.5, 43.2]
      ];
      setFacePoints(pts);
      setEditorNotice("SAM3 Auto-trace outline generated (21 points) ✓");
      setTimeout(() => setEditorNotice(""), 3500);
    } finally {
      setAutoTracing(false);
    }
  };

  const handleAutoTraceAll = async () => {
    if (!selectedStory) return;
    setAutoTracingAll(true);
    try {
      const res = await api.autoTraceAllPages(selectedStory.id);
      setEditorNotice(res.message || "Auto-traced all untraced pages ✓");
      setTimeout(() => setEditorNotice(""), 4000);
    } catch (err: any) {
      alert("Auto-trace error: " + err.message);
    } finally {
      setAutoTracingAll(false);
    }
  };

  const handleReplaceBaseArt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePage || !selectedStory) return;
    setUploadingBaseArt(true);
    try {
      const updated = await api.uploadPageBaseArt(activePage.id, file);
      const updatedPages = [...selectedStory.pages];
      updatedPages[selectedPageIndex] = updated;
      const updatedStory = { ...selectedStory, pages: updatedPages };
      setSelectedStory(updatedStory);
      setStories(stories.map(s => s.id === selectedStory.id ? updatedStory : s));
      setEditorNotice("Base illustration replaced successfully!");
      setTimeout(() => setEditorNotice(""), 3500);
    } catch (err: any) {
      alert("Failed to upload base illustration: " + err.message);
    } finally {
      setUploadingBaseArt(false);
    }
  };

  const handleGenerateBaseArtAi = async () => {
    if (!activePage || !selectedStory) return;
    setGeneratingBaseArt(true);
    setEditorNotice("Generating base illustration...");
    setTimeout(() => {
      setGeneratingBaseArt(false);
      setEditorNotice("Base artwork generated!");
      setTimeout(() => setEditorNotice(""), 3000);
    }, 1500);
  };

  const handleAddPage = async (pageType: string = "story") => {
    if (!selectedStory) return;
    try {
      const newPage = await api.addStoryPage(selectedStory.id, {
        page_type: pageType,
        gender_variant: selectedGender,
        story_text: pageType === "front_cover" ? `Front Cover: ${selectedStory.title}` : (pageType === "back_cover" ? "Back Cover" : (pageType === "spine" ? "Spine" : `Story narrative for page ${selectedStory.pages.length + 1}`)),
      });
      const updatedPages = [...selectedStory.pages, newPage];
      const updatedStory = { ...selectedStory, pages: updatedPages, page_count: updatedPages.length };
      setSelectedStory(updatedStory);
      setStories(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
      setSelectedPageIndex(updatedPages.length - 1);
      syncPageForm(newPage);
      setEditorNotice(`Added ${pageType.replace("_", " ")} page!`);
      setTimeout(() => setEditorNotice(""), 3500);
    } catch (err: any) {
      alert("Failed to add page: " + err.message);
    }
  };

  const handleDeleteCurrentPage = async () => {
    if (!activePage || !selectedStory) return;
    if (selectedStory.pages.length <= 1) {
      alert("Cannot delete the only page in the story.");
      return;
    }
    if (!confirm(`Are you sure you want to delete Page ${activePage.page_number}?`)) return;
    try {
      await api.deleteStoryPage(activePage.id);
      const updatedPages = selectedStory.pages.filter(p => p.id !== activePage.id);
      const updatedStory = { ...selectedStory, pages: updatedPages, page_count: updatedPages.length };
      setSelectedStory(updatedStory);
      setStories(stories.map(s => s.id === updatedStory.id ? updatedStory : s));
      const nextIdx = Math.max(0, selectedPageIndex - 1);
      setSelectedPageIndex(nextIdx);
      if (updatedPages[nextIdx]) {
        syncPageForm(updatedPages[nextIdx]);
      }
      setEditorNotice("Page deleted.");
      setTimeout(() => setEditorNotice(""), 3500);
    } catch (err: any) {
      alert("Failed to delete page: " + err.message);
    }
  };

  const handleCompareUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setComparingProviders(true);
    try {
      const res = await api.compareProviders(file, selectedPresets.join(","));
      setComparisonResults(res.results);
      setEditorNotice("Comparison test renders completed!");
      setTimeout(() => setEditorNotice(""), 4000);
    } catch (err: any) {
      setComparisonResults([]);
      setEditorNotice(err.message || "Failed to compare providers");
      setTimeout(() => setEditorNotice(""), 4000);
    } finally {
      setComparingProviders(false);
    }
  };

  const togglePreset = (preset: string) => {
    if (selectedPresets.includes(preset)) {
      setSelectedPresets(selectedPresets.filter(p => p !== preset));
    } else {
      setSelectedPresets([...selectedPresets, preset]);
    }
  };

  const handleOpenTestRenderModal = () => {
    if (stories.length > 0 && !testRenderStoryId) {
      setTestRenderStoryId(stories[0].id);
    }
    setShowTestRenderModal(true);
  };

  const handleCreateTestRender = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRenderStoryId || !testRenderChildName) {
      alert("Please select a story and enter child name");
      return;
    }
    setSubmittingTestRender(true);
    try {
      const newJob = await api.testRenderBook({
        story_id: testRenderStoryId,
        child_name: testRenderChildName,
        photo: testRenderPhotoFile || undefined,
      });
      setJobs((prev) => [newJob, ...prev]);
      setShowTestRenderModal(false);
      setTestRenderPhotoFile(null);
      setEditorNotice(`✨ Test render session created for ${testRenderChildName}!`);
      setTimeout(() => setEditorNotice(""), 3500);
    } catch (err: any) {
      alert("Error creating test render: " + err.message);
    } finally {
      setSubmittingTestRender(false);
    }
  };

  const handleDownloadPdf = async (job: PersonalizationJob, mode: "print" | "preview" = "print") => {
    if (mode === "preview") {
      const rawUrl = job.pdf_download_url || `/api/v1/personalization/${job.id}/pdf`;
      const url = api.resolveUrl(rawUrl);
      window.open(url, "_blank");
      return;
    }

    // Print PDF (8x8 RGB - ALL 24 Pages):
    const total = job.total_pages || 24;
    const completed = job.completed_pages || 0;

    // If all pages haven't been rendered yet or currently rendering, launch live generator modal
    if (completed < total || job.status?.toLowerCase().includes("rendering")) {
      try {
        await api.triggerFullGeneration(job.id);
      } catch (err) {
        console.warn("Notice triggering full generation:", err);
      }
      setGeneratingFullJob({
        ...job,
        status: "Rendering · " + Math.round((completed / total) * 100) + "%",
        completed_pages: completed,
        total_pages: total
      });
      return;
    }

    // Directly download the complete print-ready PDF containing all pages with vivid colors
    const rawUrl = job.print_pdf_url || `/api/v1/personalization/${job.id}/print-pdf?size=8x8&color=rgb&admin=true`;
    const url = api.resolveUrl(rawUrl);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${(job.child_name || "Child").replace(/\s+/g, "_")}_Full_Print.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      alert("Provider Settings updated successfully.");
    } catch (err: any) {
      alert("Error updating settings: " + err.message);
    } finally {
      setSavingAi(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) {
      alert("Please enter customer name");
      return;
    }
    setCreatingOrder(true);
    try {
      await api.createOrder({
        customer_name: newCustomerName,
        customer_email: newCustomerEmail || `${newCustomerName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        amount: parseFloat(newAmount) || 1299,
        currency: "INR",
        status: newStatus,
        payment_status: newStatus === "Pending" ? "unpaid" : "paid",
        format_type: newFormat,
      });
      setShowNewOrderModal(false);
      setNewCustomerName("");
      setNewCustomerEmail("");
      await handleRefresh();
    } catch (err: any) {
      alert("Failed to create order: " + err.message);
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleStatusSelect = (order: Order, targetStatus: string) => {
    if (targetStatus === "Shipped") {
      let email = order.customer_email || "";
      if (!email && order.shipping_address) {
        try {
          const parsed = JSON.parse(order.shipping_address);
          email = parsed.email || parsed.customer_email || "";
        } catch (e) {}
      }

      setShippingModal({
        order,
        carrier: order.shipping_carrier || "Delhivery",
        trackingId: order.tracking_id || "",
        customerEmail: email,
      });
    } else {
      handleUpdateStatus(order.id, targetStatus);
    }
  };

  const handleConfirmShipping = async () => {
    if (!shippingModal) return;
    if (!shippingModal.trackingId.trim()) {
      alert("Please enter a Tracking ID / AWB Number.");
      return;
    }
    setShippingSubmitting(true);
    try {
      await api.updateOrderStatus(
        shippingModal.order.id,
        "Shipped",
        {
          tracking_id: shippingModal.trackingId.trim(),
          shipping_carrier: shippingModal.carrier,
          customer_email: shippingModal.customerEmail.trim() || undefined,
        }
      );
      await handleRefresh();
      if (selectedOrder && selectedOrder.id === shippingModal.order.id) {
        setSelectedOrder({
          ...selectedOrder,
          status: "Shipped",
          tracking_id: shippingModal.trackingId.trim(),
          shipping_carrier: shippingModal.carrier,
          customer_email: shippingModal.customerEmail.trim() || selectedOrder.customer_email,
        });
      }
      showToast(
        `Order #${shippingModal.order.order_number || shippingModal.order.id} marked as Shipped! Notification email dispatched${shippingModal.customerEmail ? ` to ${shippingModal.customerEmail}` : ""}.`
      );
      setShippingModal(null);
    } catch (err: any) {
      alert("Failed to update shipping status: " + err.message);
    } finally {
      setShippingSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    orderId: string,
    status: string,
    extra?: { tracking_id?: string; shipping_carrier?: string; customer_email?: string }
  ) => {
    try {
      await api.updateOrderStatus(orderId, status, extra);
      await handleRefresh();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status, ...extra });
      }
      const targetOrder = orders.find(o => o.id === orderId);
      const recipient = extra?.customer_email || targetOrder?.customer_email;
      showToast(
        `Order status updated to "${status}". Notification email sent${recipient ? ` to ${recipient}` : ""}.`
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.deleteOrder(orderId);
      setSelectedOrder(null);
      await handleRefresh();
    } catch (err: any) {
      alert("Failed to delete order: " + err.message);
    }
  };

  // Story management handlers
  const handleTitleChange = (val: string) => {
    setNewBookTitle(val);
    if (!newBookSlugTouched) {
      const slug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setNewBookSlug(slug);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) {
      setBookError("Title is required");
      return;
    }
    setCreatingBook(true);
    setBookError("");
    try {
      const created = await api.createAdminStory({
        title: newBookTitle.trim(),
        slug: newBookSlug.trim() || undefined,
        category: newBookCategory,
        min_age: Number(newBookMinAge) || 3,
        max_age: Number(newBookMaxAge) || 7,
        age_range: `Ages ${newBookMinAge}-${newBookMaxAge}`,
        price_digital: Number(newBookPdfPrice) || 799,
        price_print: Number(newBookPrintPrice) || 1399,
        page_count: Number(newBookTotalPages) || 28,
        description: newBookTagline.trim() || undefined,
        cover_image_url: newBookCoverUrl.trim() || undefined,
        status: "published",
      }, newBookPdfFile);
      setStories((prev) => [created, ...prev]);
      setShowNewBookModal(false);
      setNewBookTitle("");
      setNewBookSlug("");
      setNewBookSlugTouched(false);
      setNewBookTagline("");
      setNewBookCoverUrl("");
      setNewBookPdfFile(null);
    } catch (err: any) {
      setBookError(err.message || "Failed to create book");
    } finally {
      setCreatingBook(false);
    }
  };

  const handleToggleStatus = async (story: StoryTemplate) => {
    try {
      const updated = await api.toggleStoryStatus(story.id);
      setStories((prev) => prev.map((s) => (s.id === story.id ? updated : s)));
    } catch (err: any) {
      alert("Failed to toggle status: " + (err.message || "Unknown error"));
    }
  };

  const handleDeleteStory = async (story: StoryTemplate) => {
    if (!confirm(`Are you sure you want to delete "${story.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteAdminStory(story.id);
      setStories((prev) => prev.filter((s) => s.id !== story.id));
      if (selectedStory?.id === story.id) {
        setSelectedStory(stories.find((s) => s.id !== story.id) || null);
      }
    } catch (err: any) {
      alert("Failed to delete story: " + (err.message || "Unknown error"));
    }
  };

  const handleAuthorPages = (story: StoryTemplate) => {
    setSelectedStory(story);
    if (story.pages && story.pages.length > 0) {
      syncPageForm(story.pages[0]);
      setSelectedPageIndex(0);
    }
    setActiveTab("page_editor");
  };

  const handleOpenEditAge = (story: StoryTemplate) => {
    setStoryToEdit(story);
    const matches = story.age_range ? story.age_range.match(/(\d+)\s*[-–to]\s*(\d+)/i) : null;
    const minA = matches ? parseInt(matches[1]) : 3;
    const maxA = matches ? parseInt(matches[2]) : 7;
    setEditMinAge(minA);
    setEditMaxAge(maxA);
    setEditPdfPrice(story.price_digital || 799);
    setEditPrintPrice(story.price_print || 1399);
    setEditCategory(story.category || "ADVENTURE");
    setShowEditAgeModal(true);
  };

  const handleSaveAgeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyToEdit) return;
    setSavingAgeEdit(true);
    try {
      const updated = await api.updateAdminStory(storyToEdit.id, {
        age_range: `Ages ${editMinAge}-${editMaxAge}`,
        price_digital: editPdfPrice,
        price_print: editPrintPrice,
        category: editCategory,
      });
      setStories((prev) => prev.map((s) => (s.id === storyToEdit.id ? updated : s)));
      setShowEditAgeModal(false);
    } catch (err: any) {
      alert("Failed to update book: " + (err.message || "Unknown error"));
    } finally {
      setSavingAgeEdit(false);
    }
  };

  // Helper for Status Badge Styling matching reference image
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "In Production":
        return "bg-[#FEF3C7] text-[#D97706]";
      case "Paid":
        return "bg-[#DCFCE7] text-[#16A34A]";
      case "Delivered":
        return "bg-[#D1FAE5] text-[#059669]";
      case "Shipped":
        return "bg-[#EEF2FF] text-[#4F46E5]";
      case "Pending":
        return "bg-[#F1F5F9] text-[#64748B]";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filtered orders for the Orders tab
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.id?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredJobs = jobs.filter((job) => {
    if (previewFilter === "purchased") {
      return job.is_purchased === true;
    }
    return true;
  });

  const activePage = selectedStory?.pages?.[selectedPageIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-[#8B3DFF]/20 border-t-[#8B3DFF] animate-spin" />
          <span className="text-[#8B3DFF] font-semibold text-sm">Loading Kutty Story Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex text-[#1E293B] font-sans antialiased">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-100/90 flex flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Logo Header */}
        <div className="px-6 pt-7 pb-6">
          <Link to="/admin_dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 p-0.5 shadow-xs overflow-hidden flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Kutty Story Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-[#8B3DFF] font-sans">
              Kutty Story
            </h1>
          </Link>
        </div>

        {/* Menu Navigation Items */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => {
              setActiveTab("dashboard");
              window.history.pushState(null, "", "/admin");
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "dashboard"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("orders");
              window.history.pushState(null, "", "/admin/orders");
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "orders"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Orders</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("payments");
              window.history.pushState(null, "", "/admin/payments");
              fetchPaymentTransactions();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "payments"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-3.5">
              <CreditCard className="w-4 h-4 shrink-0" />
              <span>Payments</span>
            </div>
            {paymentTransactions.length > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "payments"
                    ? "bg-white/20 text-white"
                    : "bg-purple-100 text-[#8B3DFF]"
                  }`}
              >
                {paymentTransactions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("previews");
              window.history.pushState(null, "", "/admin/previews");
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "previews"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Previews</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("stories");
              window.history.pushState(null, "", "/admin/stories");
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "stories"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Stories</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("page_editor");
              window.history.pushState(null, "", "/admin/page_editor");
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "page_editor"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <FileEdit className="w-4 h-4 shrink-0" />
            <span>Page Editor</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("child_stories");
              window.history.pushState(null, "", "/admin/child_stories");
              fetchAdminChildStories();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "child_stories"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-3.5">
              <Feather className="w-4 h-4 shrink-0" />
              <span>Children's Stories</span>
            </div>
            {adminChildStories.length > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "child_stories"
                    ? "bg-white/20 text-white"
                    : "bg-purple-100 text-[#8B3DFF]"
                  }`}
              >
                {adminChildStories.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("feedback");
              window.history.pushState(null, "", "/admin/feedback");
              fetchAdminFeedbacks();
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "feedback"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <div className="flex items-center gap-3.5">
              <MessageSquareHeart className="w-4 h-4 shrink-0" />
              <span>Feedback</span>
            </div>
            {feedbacks.filter((f) => f.status === "pending").length > 0 && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === "feedback"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-800"
                  }`}
              >
                {feedbacks.filter((f) => f.status === "pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("settings");
              window.history.pushState(null, "", "/admin/settings");
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "settings"
                ? "bg-[#8B3DFF] text-white shadow-sm shadow-[#8B3DFF]/20"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer with Logged in User & Sign out */}
        <div className="p-4 mt-auto border-t border-gray-100 space-y-2">
          {currentUser && (
            <div className="px-2 py-1.5 flex items-center gap-2.5 bg-gray-50/70 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#8B3DFF] flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-800 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              authService.logout();
              navigate("/admin_login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50/60 rounded-xl transition"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Dashboard Content Area */}
      <main className="flex-1 min-w-0 p-8 lg:p-12 overflow-y-auto">
        {/* TAB 1: DASHBOARD VIEW (Exact match to reference screenshot) */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Header with Title & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-[28px] font-bold tracking-tight text-[#111827]">
                Dashboard
              </h2>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200/80 text-gray-600 text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition"
                  title="Refresh Dashboard Data"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${refreshing ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => setShowNewOrderModal(true)}
                  className="px-4 py-1.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-medium flex items-center gap-1 shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Order</span>
                </button>
              </div>
            </div>

            {/* 4 Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Revenue */}
              <div className="bg-white rounded-3xl p-7 shadow-xs border border-gray-100 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#10B981] font-bold text-xl">
                  ₹
                </div>
                <div className="text-[30px] font-bold tracking-tight text-[#111827] mt-5 mb-0.5">
                  {dashboardData?.revenue_formatted ?? "₹0"}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  Revenue
                </div>
              </div>

              {/* Card 2: Paid orders */}
              <div className="bg-white rounded-3xl p-7 shadow-xs border border-gray-100 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#F5EEFF] flex items-center justify-center text-[#8B3DFF]">
                  <Package className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-[30px] font-bold tracking-tight text-[#111827] mt-5 mb-0.5">
                  {dashboardData?.paid_orders ?? 0}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  Paid orders
                </div>
              </div>

              {/* Card 3: Previews created */}
              <div className="bg-white rounded-3xl p-7 shadow-xs border border-gray-100 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FEF8E7] flex items-center justify-center text-[#D97706]">
                  <Sparkles className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-[30px] font-bold tracking-tight text-[#111827] mt-5 mb-0.5">
                  {dashboardData?.previews_created ?? 0}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  Previews created
                </div>
              </div>

              {/* Card 4: Live stories */}
              <div className="bg-white rounded-3xl p-7 shadow-xs border border-gray-100 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#FDF0F6] flex items-center justify-center text-[#DB2777]">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-[30px] font-bold tracking-tight text-[#111827] mt-5 mb-0.5">
                  {dashboardData?.live_stories ?? 0}
                </div>
                <div className="text-sm font-medium text-gray-400">
                  Live stories
                </div>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#111827]">
                  Recent orders
                </h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-semibold text-[#8B3DFF] hover:underline flex items-center gap-1"
                >
                  <span>View all ({orders.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Table Container */}
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                        <th className="py-4 px-6 font-semibold">ORDER</th>
                        <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                        <th className="py-4 px-6 font-semibold">TOTAL</th>
                        <th className="py-4 px-6 font-semibold">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80 text-sm">
                      {(dashboardData?.recent_orders || []).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-gray-400 text-xs">
                            <Package className="w-8 h-8 mx-auto text-gray-300 mb-2 stroke-1" />
                            <p className="font-semibold text-gray-600">No recent orders</p>
                            <p className="text-gray-400 text-[11px] mt-0.5">
                              Orders placed by customers or created manually will appear here.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        dashboardData!.recent_orders.slice(0, 6).map((order) => (
                          <tr
                            key={order.id}
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-gray-50/60 transition-colors cursor-pointer group"
                          >
                            {/* ORDER ID */}
                            <td className="py-4 px-6 font-mono text-[13px] text-gray-700">
                              {order.order_number || order.id}
                            </td>

                            {/* CUSTOMER */}
                            <td className="py-4 px-6 text-gray-800 font-normal">
                              {order.customer_name}
                            </td>

                            {/* TOTAL */}
                            <td className="py-4 px-6 font-medium text-gray-900">
                              ₹{order.amount ? Number(order.amount).toLocaleString("en-IN") : "0"}
                            </td>

                            {/* STATUS BADGE */}
                            <td className="py-4 px-6">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT VIEW */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Orders Management</h2>
                <p className="text-xs text-gray-500 mt-1">Review orders, filter statuses, and track fulfillment.</p>
              </div>

              <button
                onClick={() => setShowNewOrderModal(true)}
                className="px-4 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Order</span>
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by customer or order #..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-medium">
                {["all", "In Production", "Paid", "Delivered", "Shipped", "Pending"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full transition capitalize shrink-0 ${orderStatusFilter === st
                        ? "bg-[#8B3DFF] text-white font-semibold"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    {st === "all" ? "All Orders" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Full Orders Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                      <th className="py-4 px-6 font-semibold">ORDER</th>
                      <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                      <th className="py-4 px-6 font-semibold">FORMAT</th>
                      <th className="py-4 px-6 font-semibold">TOTAL</th>
                      <th className="py-4 px-6 font-semibold">STATUS</th>
                      <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80 text-sm">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                          No orders found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          <td className="py-4 px-6 font-medium text-gray-800">
                            {order.order_number || order.id}
                          </td>
                          <td className="py-4 px-6 text-gray-800 font-medium">
                            <div>{order.customer_name}</div>
                            {order.customer_email && (
                              <div className="text-[11px] text-gray-400">{order.customer_email}</div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {order.format_type === "digital" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                                <BookOpen className="w-3 h-3 text-blue-600" />
                                <span>Digital PDF</span>
                              </span>
                            ) : (
                              <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                                  <Package className="w-3 h-3 text-amber-600" />
                                  <span>Hardcover Book</span>
                                </span>
                                {order.shipping_address && (() => {
                                  try {
                                    const parsed = JSON.parse(order.shipping_address);
                                    if (parsed.state || parsed.city) {
                                      return (
                                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                                          <MapPin className="w-2.5 h-2.5 text-gray-400 shrink-0" />
                                          <span className="truncate max-w-[130px] font-medium">{parsed.city ? `${parsed.city}, ` : ""}{parsed.state || ""}</span>
                                        </div>
                                      );
                                    }
                                  } catch (e) {}
                                  return null;
                                })()}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-900">
                            ₹{order.amount ? Number(order.amount).toLocaleString("en-IN") : "0"}
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusSelect(order, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer border-0 outline-none ${getStatusBadgeClass(
                                order.status
                              )}`}
                            >
                              <option value="In Production">In Production</option>
                              <option value="Paid">Paid</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Pending">Pending</option>
                            </select>
                            {order.status === "Shipped" && (
                              <div className="mt-1 text-[10px] text-purple-700 font-medium flex items-center gap-1 max-w-[150px]">
                                <Truck className="w-2.5 h-2.5 shrink-0 text-[#8B3DFF]" />
                                <span className="truncate">{order.shipping_carrier || "Shipped"}: {order.tracking_id || "Pending ID"}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-xs text-[#8B3DFF] hover:underline font-semibold mr-3"
                            >
                              Details
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-xs text-red-500 hover:text-red-700"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAYMENTS & RAZORPAY TRANSACTIONS VIEW */}
        {activeTab === "payments" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Payments & Transactions</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Razorpay payment gateway logs, customer checkout verification, and transaction history.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={fetchPaymentTransactions}
                  disabled={loadingPayments}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200/80 text-gray-600 text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5 shadow-xs transition"
                  title="Refresh Payment Records"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loadingPayments ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>

                <a
                  href="https://dashboard.razorpay.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Razorpay Dashboard</span>
                </a>
              </div>
            </div>

            {/* 4 Summary Stat Cards */}
            {(() => {
              const capturedTxns = paymentTransactions.filter(t => t.status?.toLowerCase() === "captured");
              const totalCapturedAmount = capturedTxns.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
              const digitalCount = paymentTransactions.filter(t => t.format_type === "digital").length;
              const printCount = paymentTransactions.filter(t => t.format_type === "print_hardcover").length;

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-medium">Total Captured Volume</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">
                      ₹{totalCapturedAmount.toLocaleString("en-IN")}
                    </h3>
                    <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                      {capturedTxns.length} Successful checkouts
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-medium">Digital PDF Editions</span>
                    <h3 className="text-2xl font-bold text-blue-700 mt-1">{digitalCount}</h3>
                    <span className="text-[11px] text-gray-400 mt-1 block">Instant high-res downloads</span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-medium">Hardcover Keepsakes</span>
                    <h3 className="text-2xl font-bold text-amber-700 mt-1">{printCount}</h3>
                    <span className="text-[11px] text-gray-400 mt-1 block">Printed heirloom books</span>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                    <span className="text-xs text-gray-400 font-medium">Gateway Success Rate</span>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                      {paymentTransactions.length > 0
                        ? `${Math.round((capturedTxns.length / paymentTransactions.length) * 100)}%`
                        : "100%"}
                    </h3>
                    <span className="text-[11px] text-gray-400 mt-1 block">Razorpay Checkout SDK</span>
                  </div>
                </div>
              );
            })()}

            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100/80 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by customer, payment ID, or title..."
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-medium">
                {["all", "captured", "created", "failed"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPaymentStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-full transition capitalize shrink-0 ${
                      paymentStatusFilter === st
                        ? "bg-[#8B3DFF] text-white font-semibold"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st === "all" ? "All Transactions" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
                      <th className="py-4 px-6 font-semibold">TRANSACTION / PAYMENT ID</th>
                      <th className="py-4 px-6 font-semibold">CUSTOMER</th>
                      <th className="py-4 px-6 font-semibold">STORY</th>
                      <th className="py-4 px-6 font-semibold">EDITION</th>
                      <th className="py-4 px-6 font-semibold">AMOUNT</th>
                      <th className="py-4 px-6 font-semibold">STATUS</th>
                      <th className="py-4 px-6 font-semibold">DATE & TIME</th>
                      <th className="py-4 px-6 font-semibold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/80 text-sm">
                    {(() => {
                      const filtered = paymentTransactions.filter((txn) => {
                        const searchLower = paymentSearch.toLowerCase();
                        const matchesSearch =
                          !paymentSearch ||
                          (txn.id && txn.id.toLowerCase().includes(searchLower)) ||
                          (txn.razorpay_payment_id && txn.razorpay_payment_id.toLowerCase().includes(searchLower)) ||
                          (txn.customer_name && txn.customer_name.toLowerCase().includes(searchLower)) ||
                          (txn.customer_email && txn.customer_email.toLowerCase().includes(searchLower)) ||
                          (txn.story_title && txn.story_title.toLowerCase().includes(searchLower)) ||
                          (txn.child_name && txn.child_name.toLowerCase().includes(searchLower));

                        const matchesStatus =
                          paymentStatusFilter === "all" ||
                          txn.status?.toLowerCase() === paymentStatusFilter.toLowerCase();

                        return matchesSearch && matchesStatus;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                              {loadingPayments
                                ? "Loading transactions..."
                                : "No payment transactions found matching criteria."}
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((txn) => {
                        const isCaptured = txn.status?.toLowerCase() === "captured";
                        const isFailed = txn.status?.toLowerCase() === "failed";
                        const createdDate = txn.created_at ? new Date(txn.created_at) : null;
                        const dateFormatted = createdDate
                          ? createdDate.toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently";

                        return (
                          <tr key={txn.id} className="hover:bg-gray-50/60 transition-colors text-xs">
                            <td className="py-4 px-6 font-medium text-gray-800">
                              <div className="font-mono text-gray-900 font-semibold">{txn.razorpay_payment_id || "Awaiting Payment"}</div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                Ref: {txn.order_number || txn.razorpay_order_id || txn.id.substring(0, 12)}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-semibold text-gray-900">{txn.customer_name || "Valued Customer"}</div>
                              {txn.customer_email && (
                                <div className="text-[11px] text-gray-400">{txn.customer_email}</div>
                              )}
                            </td>

                            <td className="py-4 px-6 text-gray-700">
                              <div className="font-medium text-gray-900">{txn.story_title || "Personalized Story"}</div>
                              {txn.child_name && (
                                <div className="text-[11px] text-purple-700 font-medium">For: {txn.child_name}</div>
                              )}
                            </td>

                            <td className="py-4 px-6">
                              {txn.format_type === "digital" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  <BookOpen className="w-3 h-3 text-blue-600" />
                                  <span>Digital PDF</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Package className="w-3 h-3 text-amber-600" />
                                  <span>Hardcover Keepsake</span>
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                              ₹{Number(txn.amount || 0).toLocaleString("en-IN")}
                            </td>

                            <td className="py-4 px-6">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                                  isCaptured
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : isFailed
                                    ? "bg-red-50 text-red-700 border border-red-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {isCaptured && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                                <span>{txn.status || "created"}</span>
                              </span>
                            </td>

                            <td className="py-4 px-6 text-gray-500 text-[11px]">
                              {dateFormatted}
                            </td>

                            <td className="py-4 px-6 text-right">
                              {txn.razorpay_payment_id && !txn.razorpay_payment_id.startsWith("pay_test_") ? (
                                <a
                                  href={`https://dashboard.razorpay.com/app/payments/${txn.razorpay_payment_id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-purple-50 text-gray-700 hover:text-[#8B3DFF] text-[11px] font-semibold transition"
                                  title="View on Razorpay Dashboard"
                                >
                                  <span>Razorpay</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-gray-400 font-mono">Sandbox Log</span>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PREVIEWS & PERSONALIZATION JOBS (Matching Reference Image) */}
        {activeTab === "previews" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Bar Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827]">
                  Previews
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Every generated book session. Download the complete 8×8 RGB print PDF with all pages, or inspect generated plates.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* ✨ Test render a book Button */}
                <button
                  type="button"
                  onClick={handleOpenTestRenderModal}
                  className="px-4 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Test render a book</span>
                </button>

                {/* Filter Pills: All | Purchased */}
                <div className="inline-flex items-center bg-gray-100/60 p-1 rounded-xl border border-gray-200/60 gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewFilter("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${previewFilter === "all"
                        ? "bg-[#8B3DFF] text-white shadow-xs"
                        : "bg-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewFilter("purchased")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${previewFilter === "purchased"
                        ? "bg-[#8B3DFF] text-white shadow-xs"
                        : "bg-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Purchased
                  </button>
                </div>
              </div>
            </div>

            {/* Table Container matching screenshot */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        CHILD
                      </th>
                      <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        STORY
                      </th>
                      <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        PAGES
                      </th>
                      <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        CREATED
                      </th>
                      <th className="py-4 px-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        ACTIONS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                          No preview sessions found matching this filter.
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job) => {
                        const isRendering =
                          job.status?.toLowerCase().includes("rendering") ||
                          job.status === "processing" ||
                          job.status === "in_progress";
                        const isCompleted =
                          job.status?.toLowerCase() === "completed" ||
                          job.status?.toLowerCase().includes("complete");

                        return (
                          <tr
                            key={job.id}
                            className="hover:bg-gray-50/60 transition duration-150 group"
                          >
                            {/* CHILD */}
                            <td className="py-4 px-6">
                              <span className="font-bold text-gray-900 text-sm">
                                {job.child_name || "Child"}
                              </span>
                            </td>

                            {/* STORY */}
                            <td className="py-4 px-6">
                              <span className="text-xs text-gray-500 font-medium">
                                {job.story_title || "Personalized Story"}
                              </span>
                            </td>

                            {/* STATUS */}
                            <td className="py-4 px-6">
                              {isRendering ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-gray-800">
                                    Rendering
                                  </span>
                                  <span className="text-gray-400 text-xs font-medium">·</span>
                                  <span className="text-xs font-semibold text-[#8B3DFF]">
                                    {job.status.includes("%") ? job.status.split("·")[1]?.trim() || "In progress" : (job.completed_pages && job.total_pages ? `${Math.round((job.completed_pages / job.total_pages) * 100)}%` : "In progress")}
                                  </span>
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B3DFF] animate-pulse" />
                                </div>
                              ) : job.status === "interrupted" ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="Generation was paused due to server reload. Click Print PDF to resume and complete all pages.">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span>Incomplete ({job.completed_pages || 0}/{job.total_pages || 26})</span>
                                </div>
                              ) : (
                                <span className="text-xs font-medium text-gray-700">
                                  {isCompleted ? "Completed" : job.status}
                                </span>
                              )}
                            </td>

                            {/* PAGES */}
                            <td className="py-4 px-6">
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-gray-800">
                                  All {job.total_pages && job.total_pages > 5 ? job.total_pages : 24} pages
                                </span>
                                <span className="text-[11px] text-gray-400 font-normal">
                                  {job.completed_pages || 5} free preview
                                </span>
                              </div>
                            </td>

                            {/* CREATED */}
                            <td className="py-4 px-6">
                              <span className="text-xs text-gray-400 font-normal whitespace-nowrap">
                                {job.created_formatted ||
                                  (job.created_at
                                    ? new Date(job.created_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                    : "Recently")}
                              </span>
                            </td>

                            {/* ACTIONS: [ ⤓ PDF ] [ 🖼 Photos ] [ ↗ View ] */}
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                {/* PDF Button */}
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(job, "print")}
                                  title="Download complete print-ready PDF (All pages • 8×8 RGB)"
                                  className="px-2.5 py-1.5 rounded-lg border border-[#8B3DFF]/40 text-[#8B3DFF] hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Print PDF</span>
                                </button>

                                {/* Photos Button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedJobForPhotos(job)}
                                  title="View uploaded child reference photo & generated plates"
                                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                                >
                                  <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
                                  <span>Photos</span>
                                </button>

                                {/* View Button */}
                                <a
                                  href={`/personalize/${job.story_slug || ""}?job_id=${job.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open book preview player in new tab"
                                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer inline-flex"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                                  <span>View</span>
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STORIES MANAGER (Matching reference design) */}
        {activeTab === "stories" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Bar matching screenshot */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Story Library</h1>
                <p className="text-xs text-gray-500 mt-1">Manage, publish, and author personalized storybooks for children.</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-500 tracking-tight">
                  {stories.filter((s) => s.status === "published").length}/{stories.length} live
                </span>
                <button
                  onClick={() => {
                    setShowNewBookModal(true);
                    setBookError("");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs sm:text-sm shadow-md shadow-[#8B3DFF]/25 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New book</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={storySearch}
                  onChange={(e) => setStorySearch(e.target.value)}
                  placeholder="Search books by title, theme, or category..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                {["all", "ADVENTURE", "LEARNING", "BEDTIME", "FANTASY"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setStoryCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${storyCategoryFilter === cat
                        ? "bg-[#8B3DFF] text-white shadow-xs"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-100"
                      }`}
                  >
                    {cat === "all" ? "All Categories" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Stories Grid matching screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {stories
                .filter((story) => {
                  const matchesSearch =
                    !storySearch ||
                    story.title.toLowerCase().includes(storySearch.toLowerCase()) ||
                    (story.category && story.category.toLowerCase().includes(storySearch.toLowerCase())) ||
                    (story.description && story.description.toLowerCase().includes(storySearch.toLowerCase()));

                  const matchesCategory =
                    storyCategoryFilter === "all" ||
                    (story.category && story.category.toUpperCase() === storyCategoryFilter.toUpperCase());

                  const matchesStatus =
                    storyStatusFilter === "all" ||
                    (storyStatusFilter === "live" && story.status === "published") ||
                    (storyStatusFilter === "hidden" && story.status !== "published");

                  return matchesSearch && matchesCategory && matchesStatus;
                })
                .map((story) => (
                  <div
                    key={story.id}
                    className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    {/* Top Cover area */}
                    <div className="space-y-3">
                      <div className="relative aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden border border-gray-100">
                        {/* Category Badge on top left of image */}
                        <span className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded shadow-xs">
                          {story.category || "ADVENTURE"}
                        </span>

                        {story.cover_image_url ? (
                          <img
                            src={story.cover_image_url}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : null}

                        {/* Fallback placeholder when no cover or image error */}
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
                          <BookOpen className="w-10 h-10 text-[#8B3DFF]/40 mb-2" />
                          <span className="text-xs font-bold text-gray-700 line-clamp-2">{story.title}</span>
                          <span className="text-[10px] text-gray-400 mt-1">Author front cover page</span>
                        </div>
                      </div>

                      {/* Book Info */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">{story.title}</h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {story.age_range || "Ages 3-7"} · ₹{story.price_digital ? Math.round(story.price_digital).toLocaleString("en-IN") : "799"} / ₹{story.price_print ? Math.round(story.price_print).toLocaleString("en-IN") : "1,399"}
                        </p>
                        <div>
                          <button
                            onClick={() => handleOpenEditAge(story)}
                            className="text-xs font-semibold text-[#8B3DFF] hover:text-[#7828f7] hover:underline cursor-pointer"
                          >
                            Edit age range
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-1.5">
                      {/* Live / Hidden Badge */}
                      <div>
                        {story.status === "published" ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                            Hidden
                          </span>
                        )}
                      </div>

                      {/* Buttons: Personalize, Author pages, Hide/Publish, Delete */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <a
                          href={`/personalize/${story.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open personalized 3D book generator for this story"
                          className="px-2.5 py-1.5 rounded-lg border border-[#8B3DFF]/40 bg-purple-50 hover:bg-purple-100 text-[#8B3DFF] text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Personalize</span>
                        </a>
                        <button
                          onClick={() => handleAuthorPages(story)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
                        >
                          Author pages
                        </button>
                        <button
                          onClick={() => handleToggleStatus(story)}
                          className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
                        >
                          {story.status === "published" ? "Hide" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDeleteStory(story)}
                          title="Delete story"
                          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {stories.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-bold text-gray-800 text-base">No books in library</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click "+ New book" to create your first storybook.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: STORY PAGE EDITOR (CMS) */}
        {activeTab === "page_editor" && selectedStory && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Notification Toast */}
            {editorNotice && (
              <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-gray-900/90 text-white shadow-xl backdrop-blur-md flex items-center gap-3 text-xs animate-in slide-in-from-top-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{editorNotice}</span>
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              type="file"
              ref={baseArtFileRef}
              onChange={handleReplaceBaseArt}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={comparePhotoRef}
              onChange={handleCompareUpload}
              accept="image/*"
              className="hidden"
            />

            {/* 1. Header Bar with CMS Title, Actions, and Book Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-extrabold tracking-tight text-[#111827]">
                  Page Editor (CMS)
                </h2>
              </div>

              {/* Action Buttons & Book Dropdown */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditorNotice(`✨ Test render initiated for ${selectedStory.title}! Generating demo PDF...`);
                    setTimeout(() => setEditorNotice(""), 4500);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test render a book</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditorNotice(`📖 Generating story text for ${selectedGender} pages...`);
                    setTimeout(() => {
                      setPageEditText(`{{name}} stepped into the magical world of ${selectedStory.title}, ready for an extraordinary adventure.`);
                      setEditorNotice("Story text generated and updated!");
                      setTimeout(() => setEditorNotice(""), 3000);
                    }, 1200);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Write story text — {selectedGender}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditorNotice(`🖼️ Base art generation pipeline queued for all ${selectedGender} pages!`);
                    setTimeout(() => setEditorNotice(""), 4000);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Base art (all {selectedGender} pages)</span>
                </button>

                {/* Book Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStory.id}
                    onChange={(e) => handleSelectStory(e.target.value)}
                    className="appearance-none pl-4 pr-9 py-2 rounded-xl border border-gray-200 bg-white font-bold text-xs text-gray-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] cursor-pointer"
                  >
                    {stories.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 2. Availability Strip (Target Gender & Age Range) */}
            <div className="bg-white rounded-2xl border border-gray-200/70 p-3.5 px-5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-gray-700">Available for</span>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={targetGender === "boy"}
                    onChange={(e) => {
                      const val = e.target.checked ? "boy" : "both";
                      setTargetGender(val);
                      handleSaveAvailability(val, bookMinAge, bookMaxAge);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#8B3DFF] focus:ring-[#8B3DFF] cursor-pointer"
                  />
                  <span>Boy Only</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-gray-700 select-none">
                  <input
                    type="checkbox"
                    checked={targetGender === "girl"}
                    onChange={(e) => {
                      const val = e.target.checked ? "girl" : "both";
                      setTargetGender(val);
                      handleSaveAvailability(val, bookMinAge, bookMaxAge);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-[#8B3DFF] focus:ring-[#8B3DFF] cursor-pointer"
                  />
                  <span>Girl Only</span>
                </label>

                <span className="text-gray-400 italic text-[11px]">
                  Neither ticked — offered for both boys and girls.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Ages</span>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={bookMinAge}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setBookMinAge(v);
                    handleSaveAvailability(targetGender, v, bookMaxAge);
                  }}
                  className="w-12 px-2 py-1 text-center rounded-lg border border-gray-200 bg-white font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
                <span className="text-gray-500 font-medium">to</span>
                <input
                  type="number"
                  min="1"
                  max="18"
                  value={bookMaxAge}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setBookMaxAge(v);
                    handleSaveAvailability(targetGender, bookMinAge, v);
                  }}
                  className="w-12 px-2 py-1 text-center rounded-lg border border-gray-200 bg-white font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />

                <span className="px-2.5 py-1 rounded-full bg-[#8B3DFF] text-white font-bold text-[10px] uppercase tracking-wide">
                  Saved
                </span>

                <span className="text-gray-400 text-[11px] ml-1">
                  shown on the storefront as &quot;Ages {bookMinAge}-{bookMaxAge}&quot;
                </span>
              </div>
            </div>

            {/* 3. Gender Variant & Pages Navigation Strip */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Gender pills */}
                <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGender("boy");
                      if (activePage) syncPageForm(activePage);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${selectedGender === "boy"
                        ? "bg-[#8B3DFF] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Boy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedGender("girl");
                      if (activePage) syncPageForm(activePage);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${selectedGender === "girl"
                        ? "bg-[#8B3DFF] text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    Girl
                  </button>
                </div>

                <span className="text-xs text-gray-400 font-medium">
                  Separate pages & base art per gender
                </span>
              </div>

              {/* Horizontal Page Pills Strip */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedStory.pages?.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPage(idx)}
                    className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${selectedPageIndex === idx
                        ? "bg-[#8B3DFF] text-white shadow-sm ring-2 ring-[#8B3DFF]/20"
                        : "bg-white border border-gray-200 hover:border-[#8B3DFF]/40 text-gray-700 hover:bg-purple-50/30"
                      }`}
                  >
                    {p.page_number}
                  </button>
                ))}

                {/* Action Buttons: Add Page, Cover, Back Cover, Spine */}
                <button
                  type="button"
                  onClick={() => handleAddPage("story")}
                  title="Add new page"
                  className="h-9 px-3 rounded-xl border border-dashed border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 text-xs font-bold flex items-center justify-center transition"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPage("front_cover")}
                  className="h-9 px-3 rounded-xl border border-dashed border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 text-xs font-semibold flex items-center justify-center transition"
                >
                  + Front cover
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPage("back_cover")}
                  className="h-9 px-3 rounded-xl border border-dashed border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 text-xs font-semibold flex items-center justify-center transition"
                >
                  + Back cover
                </button>

                <button
                  type="button"
                  onClick={() => handleAddPage("spine")}
                  className="h-9 px-3 rounded-xl border border-dashed border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 text-xs font-semibold flex items-center justify-center transition"
                >
                  + Spine
                </button>
              </div>
            </div>

            {/* 4. Two-Column Editor Layout (Left: Form Controls, Right: Live Canvas Preview) */}
            {activePage && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT COLUMN: Controls & Typography Form */}
                <div className="lg:col-span-7 bg-white p-7 rounded-3xl border border-gray-100 shadow-xs space-y-5 text-xs">
                  {/* Page Number */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1.5">Page number</label>
                    <input
                      type="number"
                      value={pageNumberInput}
                      onChange={(e) => setPageNumberInput(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>

                  {/* Base Illustration */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1.5">
                      Base illustration (the fixed scene; child&apos;s face is inpainted in)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => baseArtFileRef.current?.click()}
                        disabled={uploadingBaseArt}
                        className="py-3 px-4 rounded-xl border border-dashed border-[#8B3DFF] text-[#8B3DFF] hover:bg-purple-50 font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>{uploadingBaseArt ? "Uploading..." : "Replace base art"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleGenerateBaseArtAi}
                        disabled={generatingBaseArt}
                        className="py-3 px-4 rounded-xl border border-dashed border-[#8B3DFF] text-[#8B3DFF] hover:bg-purple-50 font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{generatingBaseArt ? "Generating..." : "Generate base art"}</span>
                      </button>
                    </div>

                    {activePage.original_image_url && (
                      <p className="mt-2 text-[11px] text-[#8B3DFF] truncate font-medium">
                        {activePage.original_image_url}
                      </p>
                    )}
                  </div>

                  {/* Style prompt */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1.5">
                      Style prompt (illustration style for the inpainted face)
                    </label>
                    <input
                      type="text"
                      value={pageStylePrompt}
                      onChange={(e) => setPageStylePrompt(e.target.value)}
                      placeholder="children's storybook illustration, soft colours, consistent character, clean line art"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>

                  {/* Face outline Trace Controls */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 bg-purple-50/40">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">Personalize Character on this Page</span>
                        <span className="text-[11px] text-gray-500 block">
                          {personalizationRequired && facePoints.length > 0
                            ? "Character face swap enabled. The child's face replaces the character inside the outline."
                            : "Disabled. Pure original base illustration (e.g. animals, phoenix, scenery, objects)."}
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={personalizationRequired && facePoints.length > 0}
                          onChange={(e) => {
                            setPersonalizationRequired(e.target.checked);
                            if (!e.target.checked) {
                              setFacePoints([]);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B3DFF]"></div>
                      </label>
                    </div>

                    <label className="block font-bold text-gray-800">
                      Face outline — TRACE around the face on the preview →
                    </label>
                    <p className="text-gray-500 text-[11px] leading-relaxed">
                      Press and drag to trace a free-form outline around the face only (follow the jaw & hairline, exclude the hair). Clear the outline for non-character pages (animals, objects, places).
                    </p>

                    <div className="flex items-center gap-4">
                      {facePoints.length > 0 ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                          Outline set ({facePoints.length} points) ✓
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium text-xs">
                          No outline (Base illustration will be preserved as-is)
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setFacePoints([]);
                          setPersonalizationRequired(false);
                        }}
                        className="px-3 py-1 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-[11px] transition cursor-pointer"
                      >
                        Clear outline
                      </button>
                    </div>

                    {/* SAM3 Auto-trace Card */}
                    <div className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-3">
                      <p className="text-gray-600 text-[11px] leading-relaxed">
                        Or let SAM3 trace it: it follows the real hairline and jaw. Takes 2–5 minutes and costs ~$0.40 a page in Segmind credits, so it runs once per plate and is saved like a hand-traced outline.
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleAutoTracePage}
                          disabled={autoTracing}
                          className="px-4 py-2 rounded-xl border border-[#8B3DFF] bg-white text-[#8B3DFF] hover:bg-purple-50 font-bold text-xs transition shadow-xs disabled:opacity-50"
                        >
                          {autoTracing ? "Tracing with SAM3..." : "Auto-trace this page"}
                        </button>

                        <button
                          type="button"
                          onClick={handleAutoTraceAll}
                          disabled={autoTracingAll}
                          className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-semibold text-xs transition shadow-xs disabled:opacity-50"
                        >
                          {autoTracingAll ? "Tracing all pages..." : "Trace all untraced pages"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fallback Scene Prompt */}
                  <div>
                    <label className="block font-bold text-gray-800 mb-1.5">
                      Fallback scene prompt (txt2img, only if no base art)
                    </label>
                    <textarea
                      rows={2}
                      value={pageEditScene}
                      onChange={(e) => setPageEditScene(e.target.value)}
                      placeholder="a cozy treehouse at golden hour, storybook illustration, soft light"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/60 font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>

                  {/* Text Rows */}
                  <div className="space-y-2">
                    <label className="block font-bold text-gray-800">
                      Text rows (use {'{{name}}'} for child&apos;s name)
                    </label>

                    {/* Row Pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setActiveTextRowIdx(0)}
                        className="px-3.5 py-1.5 rounded-xl bg-gray-900 text-white font-medium flex items-center gap-1.5 shadow-xs"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#8B3DFF]"></span>
                        <span className="truncate max-w-[200px]">
                          {pageEditText ? pageEditText.slice(0, 22) + "..." : "{{name}} loves..."}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPageEditText((prev) => prev + " {{name}} smiled happily.");
                        }}
                        className="px-3 py-1.5 rounded-xl border border-dashed border-gray-300 hover:border-[#8B3DFF] text-gray-600 hover:text-[#8B3DFF] font-semibold text-xs transition"
                      >
                        + Row
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={pageEditText}
                      onChange={(e) => setPageEditText(e.target.value)}
                      placeholder="Enter narrative text for this page. Use {{name}} for personalized child name..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/60 font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />

                    <p className="text-[11px] text-gray-400">
                      Everything below styles the <strong className="text-gray-700">selected row only</strong> — so a cover can stack rows in different fonts, sizes and colours.
                    </p>
                  </div>

                  {/* Typography & Position Controls Grid */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    {/* Row 1: Text X and Text Y */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-800 mb-1">Text X (%)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={textX}
                          onChange={(e) => setTextX(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-800 mb-1">Text Y (%)</label>
                        <input
                          type="number"
                          step="0.5"
                          value={textY}
                          onChange={(e) => setTextY(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                        />
                      </div>
                    </div>

                    {/* Row 2: Font Size and Font Color */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-800 mb-1">Font size (px @1024)</label>
                        <input
                          type="number"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-800 mb-1">Font color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            className="w-10 h-9 p-0.5 rounded-lg border border-gray-200 cursor-pointer bg-white"
                          />
                          <input
                            type="text"
                            value={fontColor}
                            onChange={(e) => setFontColor(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Font Family and Letter Spacing */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-gray-800">Font</label>
                        </div>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                        >
                          <option value="Sans (DejaVu Bold)">Sans (DejaVu Bold)</option>
                          <option value="Serif (Merriweather)">Serif (Merriweather)</option>
                          <option value="Playful (Fredoka)">Playful (Fredoka)</option>
                          <option value="Handwritten (Caveat)">Handwritten (Caveat)</option>
                          <option value="Comic (Balsamiq Sans)">Comic (Balsamiq Sans)</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => alert("Font upload feature: standard OpenType / TrueType font uploaded to studio fonts.")}
                          className="text-[11px] text-[#8B3DFF] hover:underline font-semibold mt-1 block"
                        >
                          + Add your own font
                        </button>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-800 mb-1">Letter spacing (px @1024)</label>
                        <input
                          type="number"
                          value={letterSpacing}
                          onChange={(e) => setLetterSpacing(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                        />
                      </div>
                    </div>

                    {/* Row 4: Stroke colour and Stroke / outline */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-800 mb-1">Stroke colour</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={strokeColor}
                            onChange={(e) => setStrokeColor(e.target.value)}
                            className="w-10 h-9 p-0.5 rounded-lg border border-gray-200 cursor-pointer bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setStrokeColor("#FFFFFF")}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-bold text-[11px] hover:bg-gray-50"
                          >
                            Auto
                          </button>
                          <label className="flex items-center gap-1.5 cursor-pointer ml-1 select-none">
                            <input
                              type="checkbox"
                              checked={hasShadow}
                              onChange={(e) => setHasShadow(e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-[#8B3DFF] focus:ring-[#8B3DFF]"
                            />
                            <span className="font-semibold text-gray-700">Shadow</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-800 mb-1">
                          Stroke / outline (px @1024 — 0 = none)
                        </label>
                        <input
                          type="number"
                          value={strokeWidth}
                          onChange={(e) => setStrokeWidth(Number(e.target.value))}
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 font-semibold text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                        />
                      </div>
                    </div>

                    {/* Row 5: Soft line break Checkbox */}
                    <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 select-none">
                        <input
                          type="checkbox"
                          checked={softLineBreak}
                          onChange={(e) => setSoftLineBreak(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#8B3DFF] focus:ring-[#8B3DFF]"
                        />
                        <span>Soft line break</span>
                      </label>
                      <p className="text-[11px] text-gray-500 pl-6 leading-relaxed">
                        Start a new line at the end of every sentence. Turn off to let the text flow and wrap only when it runs out of width.
                      </p>
                    </div>

                    {/* Row 6: Background box Checkbox */}
                    <div className="p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800 select-none">
                        <input
                          type="checkbox"
                          checked={hasBackgroundBox}
                          onChange={(e) => setHasBackgroundBox(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#8B3DFF] focus:ring-[#8B3DFF]"
                        />
                        <span>Background box</span>
                        <span className="font-normal text-gray-500 text-[11px]">
                          one panel behind all the rows on this page
                        </span>
                      </label>
                    </div>

                    {/* Row 7: Warp */}
                    <div className="flex items-center gap-3">
                      <label className="font-bold text-gray-800">Warp</label>
                      <select
                        value={warpStyle}
                        onChange={(e) => setWarpStyle(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                      >
                        <option value="None">None</option>
                        <option value="Arc Upper">Arc Upper</option>
                        <option value="Arc Lower">Arc Lower</option>
                        <option value="Wave">Wave</option>
                      </select>
                    </div>
                  </div>

                  {/* Bottom Save Page & Delete Buttons */}
                  <div className="pt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSavePage}
                      disabled={savingPage}
                      className="flex-1 py-3.5 px-6 rounded-2xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#8B3DFF]/25 transition disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingPage ? "Saving page..." : "Save page"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeleteCurrentPage}
                      title="Delete page"
                      className="p-3.5 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* RIGHT COLUMN: Live Preview Canvas with Interactive Face Outline Tracing & PIL Burn Overlay */}
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-gray-600 block">
                    Live preview (square) — trace the face outline (press & drag)
                  </span>

                  {/* Square Interactive Canvas */}
                  <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm select-none">
                    {/* 1. Base Illustration Image */}
                    {activePage.original_image_url ? (
                      <img
                        src={activePage.original_image_url}
                        alt={`Page ${activePage.page_number} Master Plate`}
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-amber-50/50">
                        <ImageIcon className="w-12 h-12 text-gray-300 mb-2" />
                        <span className="text-xs text-gray-500 font-semibold">No base illustration uploaded</span>
                        <span className="text-[11px] text-gray-400 mt-1">Click &quot;Replace base art&quot; or &quot;Generate base art&quot;</span>
                      </div>
                    )}

                    {/* 2. Interactive SVG Tracing Layer */}
                    <svg
                      ref={canvasSvgRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      className="absolute inset-0 w-full h-full cursor-crosshair z-20"
                    >
                      {facePoints.length > 1 && (
                        <polygon
                          points={facePoints.map((pt) => `${pt[0]}%,${pt[1]}%`).join(" ")}
                          fill="rgba(20, 184, 166, 0.28)"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      )}
                      {facePoints.map((pt, i) => (
                        <circle
                          key={i}
                          cx={`${pt[0]}%`}
                          cy={`${pt[1]}%`}
                          r="2.5"
                          fill="#059669"
                          stroke="#ffffff"
                          strokeWidth="1"
                        />
                      ))}
                    </svg>

                    {/* 3. Live Burned Text Overlay with PIL-style text rendering */}
                    <div
                      style={{
                        position: "absolute",
                        left: `${textX}%`,
                        top: `${textY}%`,
                        transform: "translate(-50%, -50%)",
                        fontSize: `${Math.max(12, Math.round((fontSize / 1024) * 480))}px`,
                        color: fontColor,
                        fontFamily: getCssFontFamily(fontFamily),
                        letterSpacing: `${letterSpacing}px`,
                        textShadow: hasShadow
                          ? "0 2px 8px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.95)"
                          : "none",
                        WebkitTextStroke:
                          strokeWidth > 0 ? `${strokeWidth}px ${strokeColor}` : "none",
                        backgroundColor: hasBackgroundBox
                          ? "rgba(255, 255, 255, 0.85)"
                          : "transparent",
                        backdropFilter: hasBackgroundBox ? "blur(4px)" : "none",
                        padding: hasBackgroundBox ? "8px 14px" : "0",
                        borderRadius: hasBackgroundBox ? "10px" : "0",
                        maxWidth: "88%",
                        textAlign: "center",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.25,
                        zIndex: 30,
                        pointerEvents: "none",
                      }}
                    >
                      {formatStoryText(
                        pageEditText || (activePage?.story_text || `{{name}} stepped into the magical world of ${selectedStory.title}.`),
                        selectedGender === "boy" ? "Aarav" : "Ananya",
                        softLineBreak
                      )}
                    </div>
                  </div>

                  {/* Caption underneath preview */}
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    With base art set, the engine face-swaps the child onto this fixed illustration; otherwise it renders the scene prompt via FLUX+PuLID. Then PIL burns this text at ({textX}%, {textY}%).
                  </p>
                </div>
              </div>
            )}

            {/* 5. Compare Image Providers Bottom Card */}
            <div className="bg-white rounded-3xl border border-gray-100 p-7 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  Compare image providers
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Upload a test photo to render this book&apos;s demo page through every configured provider. Same base plate, same face region — the provider is the only difference.
                </p>
              </div>

              {/* OpenAI Tuning Presets */}
              <div className="p-4 rounded-2xl border border-purple-100/70 bg-purple-50/20 space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  OPENAI TUNING — EACH TICKED PRESET IS ONE EXTRA PAID RENDER
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    "low q · low fidelity ~$0.02",
                    "low q · high fidelity ~$0.11",
                    "medium q · high fidelity ~$0.14",
                    "high q · high fidelity ~$0.26",
                  ].map((preset) => {
                    const active = selectedPresets.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => togglePreset(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${active
                            ? "bg-[#8B3DFF] text-white border-[#8B3DFF] shadow-xs"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload a Photo Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => comparePhotoRef.current?.click()}
                  disabled={comparingProviders}
                  className="px-5 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{comparingProviders ? "Rendering comparison plates..." : "Upload a photo"}</span>
                </button>
              </div>

              {/* Comparison Results Grid */}
              {comparisonResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                  {comparisonResults.map((res, i) => (
                    <div key={i} className="p-3 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-200 border border-gray-100">
                        <img src={res.url} alt={res.provider} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-800 text-xs block">{res.provider}</span>
                        <span className="text-[11px] text-[#8B3DFF] font-semibold">{res.cost} per render</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === "settings" && aiSettings && (
          <div className="max-w-3xl bg-white p-8 rounded-3xl border border-gray-100 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Platform & Provider Settings</h2>
              <p className="text-xs text-gray-500 mt-1">Configure image generation providers, budgets, and preview parameters.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center gap-3">
              <Cpu className="w-5 h-5 text-[#8B3DFF] shrink-0" />
              <div className="text-xs">
                <strong className="text-gray-900 block">Host Hardware Check:</strong>
                <span className="text-gray-500">{aiSettings.hardware_acceleration}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Image Generation Engine</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                >
                  <option value="huggingface">Hugging Face Diffusers (Serverless Inference)</option>
                  <option value="fal_ai">FAL Fast Diffusion</option>
                  <option value="mock_poc">Deterministic Mock Provider</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Model Identifier</label>
                <input
                  type="text"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-gray-800 block mb-1">Preview Page Limit</label>
                  <input
                    type="number"
                    value={previewLimit}
                    onChange={(e) => setPreviewLimit(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-800 block mb-1">Per-Book Budget ($ USD)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={budgetCap}
                    onChange={(e) => setBudgetCap(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveAiSettings}
                disabled={savingAi}
                className="w-full py-3.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {savingAi ? "Updating Settings..." : "Save Provider Configuration"}
              </button>
            </div>
          </div>
        )}

        {/* ── CHILDREN'S WRITTEN STORIES TAB ── */}
        {activeTab === "child_stories" && (
          <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Feather className="w-6 h-6 text-[#8B3DFF]" />
                  Children's Written Stories
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage story submissions from little authors. Feature, approve, or remove entries.
                </p>
              </div>
              <button
                onClick={() => fetchAdminChildStories(childStoryFilter)}
                className="px-4 py-2 rounded-xl bg-[#8B3DFF] text-white text-xs font-semibold hover:bg-[#7828f7] cursor-pointer"
              >
                ↻ Refresh
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {["all", "featured", "approved", "pending", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => { setChildStoryFilter(f); fetchAdminChildStories(f); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer capitalize transition ${childStoryFilter === f
                      ? "bg-[#8B3DFF] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {f === "all" ? "All Submissions" : f === "featured" ? "⭐ Featured" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search by name, title or place..."
                value={childStorySearch}
                onChange={(e) => setChildStorySearch(e.target.value)}
                className="ml-auto px-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B3DFF] w-60"
              />
            </div>

            {/* Stories Table */}
            {loadingChildStories ? (
              <div className="py-16 text-center text-sm text-gray-400">Loading stories...</div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-left text-gray-500 font-semibold uppercase tracking-wide">
                      <th className="px-5 py-3.5">Author</th>
                      <th className="px-5 py-3.5">Story Title</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">❤️ Likes</th>
                      <th className="px-5 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminChildStories
                      .filter((s) => {
                        if (!childStorySearch.trim()) return true;
                        const q = childStorySearch.toLowerCase();
                        return (
                          s.child_name.toLowerCase().includes(q) ||
                          s.title.toLowerCase().includes(q) ||
                          s.place.toLowerCase().includes(q)
                        );
                      })
                      .map((story) => (
                        <tr
                          key={story.id}
                          className="border-b border-gray-50 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => setSelectedAdminChildStory(story)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                                style={{ backgroundColor: story.cover_color || "#C98A84" }}
                              >
                                {story.child_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{story.child_name}</p>
                                <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" /> {story.standard}
                                  <MapPin className="w-3 h-3 ml-1" /> {story.place}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 max-w-[200px]">
                            <p className="font-medium text-gray-800 truncate">{story.title}</p>
                            <p className="text-[11px] text-gray-400 truncate italic">"{story.story_text.substring(0, 60)}..."</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-[#8B3DFF]">
                              {story.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${story.status === "featured" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                story.status === "approved" ? "bg-emerald-50 text-emerald-700" :
                                  story.status === "pending" ? "bg-orange-50 text-orange-600" :
                                    "bg-red-50 text-red-600"
                              }`}>
                              {story.status === "featured" ? "⭐ Featured" : story.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="flex items-center gap-1 text-rose-500 font-semibold">
                              <Heart className="w-3.5 h-3.5 fill-rose-400" />
                              {story.likes_count || 0}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                              {story.status !== "featured" && (
                                <button
                                  onClick={() => handleUpdateChildStoryStatus(story.id, "featured")}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-semibold border border-amber-200 cursor-pointer"
                                  title="Feature this story"
                                >
                                  ⭐ Feature
                                </button>
                              )}
                              {story.status !== "approved" && story.status !== "featured" && (
                                <button
                                  onClick={() => handleUpdateChildStoryStatus(story.id, "approved")}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold cursor-pointer"
                                >
                                  Approve
                                </button>
                              )}
                              {story.status !== "rejected" && (
                                <button
                                  onClick={() => handleUpdateChildStoryStatus(story.id, "rejected")}
                                  className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-semibold cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteChildStory(story.id)}
                                className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {adminChildStories.length === 0 && (
                  <div className="py-16 text-center text-sm text-gray-400">No stories found.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Story Detail Modal */}
        {selectedAdminChildStory && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${selectedAdminChildStory.cover_color}15, white)` }}>
                <div>
                  <span className="text-xs font-bold text-[#8B3DFF] uppercase tracking-wider">Story Review</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-0.5">{selectedAdminChildStory.title}</h3>
                </div>
                <button onClick={() => setSelectedAdminChildStory(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-5">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 font-medium">Author</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedAdminChildStory.child_name}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 font-medium">Standard</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedAdminChildStory.standard}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-gray-400 font-medium">Place</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedAdminChildStory.place}</p>
                  </div>
                </div>
                {selectedAdminChildStory.parent_email && (
                  <div className="p-3 bg-blue-50 rounded-xl text-xs">
                    <span className="text-gray-500 font-medium">Parent Contact: </span>
                    <span className="font-bold text-blue-700">{selectedAdminChildStory.parent_email}</span>
                  </div>
                )}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-gray-500 mb-2 font-semibold">Full Story Text</p>
                  <p className="text-sm text-gray-800 leading-relaxed">{selectedAdminChildStory.story_text}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedAdminChildStory.status !== "featured" && (
                    <button onClick={() => { handleUpdateChildStoryStatus(selectedAdminChildStory.id, "featured"); setSelectedAdminChildStory(null); }} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold cursor-pointer hover:bg-amber-600">⭐ Mark as Featured</button>
                  )}
                  {selectedAdminChildStory.status !== "approved" && (
                    <button onClick={() => { handleUpdateChildStoryStatus(selectedAdminChildStory.id, "approved"); setSelectedAdminChildStory(null); }} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700">✓ Approve</button>
                  )}
                  {selectedAdminChildStory.status !== "rejected" && (
                    <button onClick={() => { handleUpdateChildStoryStatus(selectedAdminChildStory.id, "rejected"); setSelectedAdminChildStory(null); }} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold cursor-pointer hover:bg-red-600">✕ Reject</button>
                  )}
                  <button onClick={() => { handleDeleteChildStory(selectedAdminChildStory.id); }} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer hover:bg-gray-300">🗑 Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CUSTOMER FEEDBACK TAB ── */}
        {activeTab === "feedback" && (
          <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquareHeart className="w-6 h-6 text-[#8B3DFF]" />
                  Customer Feedback
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage reviews submitted through the website footer. Inspect, publish to the Foot Steps “Heartfelt Memories” section, edit, or delete submissions.
                </p>
              </div>
              <button
                onClick={() => fetchAdminFeedbacks(feedbackFilter)}
                className="px-4 py-2 rounded-xl bg-[#8B3DFF] text-white text-xs font-semibold hover:bg-[#7828f7] cursor-pointer flex items-center gap-1.5 transition self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFeedbacks ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Notification Banner */}
            {feedbackNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feedbackNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackNotice(null)}
                  className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Filter Bar & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: "All Reviews" },
                  { key: "approved", label: "Published" },
                  { key: "pending", label: "Pending" },
                  ...(feedbacks.some((x) => x.status === "rejected")
                    ? [{ key: "rejected", label: "Rejected" }]
                    : []),
                ].map((f) => {
                  const count =
                    f.key === "all"
                      ? feedbacks.length
                      : feedbacks.filter((x) => x.status === f.key).length;
                  const isActive = feedbackFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => {
                        setFeedbackFilter(f.key as any);
                        fetchAdminFeedbacks(f.key as any);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#8B3DFF] text-white shadow-xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name, place, text..."
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B3DFF] bg-white"
                />
              </div>
            </div>

            {/* Submissions List */}
            {loadingFeedbacks ? (
              <div className="py-20 text-center text-xs text-gray-400 bg-white rounded-2xl border border-gray-100">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#8B3DFF] mb-2" />
                Loading feedback submissions...
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
                {(() => {
                  const filtered = feedbacks.filter((fb) => {
                    if (feedbackFilter !== "all" && fb.status !== feedbackFilter) {
                      return false;
                    }
                    if (!feedbackSearch.trim()) return true;
                    const q = feedbackSearch.toLowerCase();
                    return (
                      fb.name.toLowerCase().includes(q) ||
                      fb.place.toLowerCase().includes(q) ||
                      (fb.review_text?.toLowerCase().includes(q) ?? false)
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-16 text-center text-gray-400 space-y-2">
                        <MessageSquareHeart className="w-10 h-10 mx-auto text-gray-200" />
                        <p className="text-sm font-semibold text-gray-600">No feedback submissions found</p>
                        <p className="text-xs text-gray-400">
                          {feedbackSearch
                            ? "Try adjusting your search query."
                            : feedbackFilter === "pending"
                            ? "There are no pending submissions awaiting review."
                            : "Submissions from the footer form will appear here."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-gray-100">
                      {filtered.map((fb) => {
                        const isVideo = fb.media_type === "video" || fb.media_url?.endsWith(".mp4") || fb.media_url?.endsWith(".webm") || fb.media_url?.endsWith(".mov");
                        const dateFormatted = fb.created_at
                          ? new Date(fb.created_at).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "";

                        return (
                          <div
                            key={fb.id}
                            className="p-5 sm:p-6 hover:bg-gray-50/50 transition flex flex-col lg:flex-row lg:items-start justify-between gap-5"
                          >
                            {/* Author & Review Content */}
                            <div className="flex-1 space-y-3">
                              <div className="flex flex-wrap items-center gap-2.5">
                                {/* Rating Stars */}
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= fb.rating
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-gray-200 fill-gray-100"
                                      }`}
                                    />
                                  ))}
                                </div>

                                <span className="text-xs font-bold text-gray-900">{fb.name}</span>
                                <span className="text-[11px] text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {fb.place}
                                </span>

                                {dateFormatted && (
                                  <span className="text-[11px] text-gray-400">
                                    • {dateFormatted}
                                  </span>
                                )}

                                {/* Status Badge */}
                                <span
                                  className={`ml-auto lg:ml-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                                    fb.status === "approved"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : fb.status === "pending"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-red-50 text-red-600 border border-red-200"
                                  }`}
                                >
                                  {fb.status === "approved"
                                    ? "✓ Published on Foot Steps"
                                    : fb.status === "pending"
                                    ? "⏳ Pending Review"
                                    : "✕ Rejected"}
                                </span>
                              </div>

                              {/* Review Text */}
                              {fb.review_text && fb.review_text.trim() ? (
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic bg-purple-50/20 p-3 rounded-xl border border-purple-50/60">
                                  “{fb.review_text.trim()}”
                                </p>
                              ) : (
                                <p className="text-[11px] text-gray-400 italic">
                                  {fb.media_url ? "No written review text provided (media submission only)" : "Rating only (no written review text)"}
                                </p>
                              )}

                              {/* Uploaded Media Preview */}
                              {fb.media_url ? (
                                <div className="flex items-center gap-3 pt-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setViewingMedia({
                                        url: fb.media_url!,
                                        type: isVideo ? "video" : "image",
                                        author: fb.name,
                                      })
                                    }
                                    className="group flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-gray-100 hover:bg-purple-50 border border-gray-200 hover:border-purple-200 transition text-left cursor-pointer"
                                  >
                                    {isVideo ? (
                                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-[#8B3DFF] shrink-0">
                                        <Video className="w-5 h-5" />
                                      </div>
                                    ) : (
                                      <img
                                        src={fb.media_url}
                                        alt="Media preview"
                                        className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                                      />
                                    )}
                                    <div className="min-w-0">
                                      <p className="text-[11px] font-bold text-gray-800 group-hover:text-[#8B3DFF]">
                                        {isVideo ? "Customer Video Attachment" : "Customer Photo Attachment"}
                                      </p>
                                      <p className="text-[10px] text-gray-400">Click to inspect / play</p>
                                    </div>
                                  </button>
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 italic">No media attachment uploaded</p>
                              )}
                            </div>

                            {/* Action Area: Publish Toggle & Compact Actions */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                              {/* 1. PUBLISH / UNPUBLISH TOGGLE SWITCH */}
                              <div className="flex flex-col items-start lg:items-end gap-1">
                                <div className="flex items-center gap-2.5">
                                  <label
                                    htmlFor={`publish-toggle-${fb.id}`}
                                    className="text-xs font-bold text-gray-700 cursor-pointer select-none"
                                  >
                                    Published
                                  </label>
                                  <button
                                    id={`publish-toggle-${fb.id}`}
                                    type="button"
                                    role="switch"
                                    aria-checked={fb.status === "approved"}
                                    aria-label={`Publication status for ${fb.name}'s review`}
                                    aria-describedby={`publish-status-text-${fb.id}`}
                                    tabIndex={0}
                                    onClick={() => handleTogglePublish(fb)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleTogglePublish(fb);
                                      }
                                    }}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8B3DFF] focus:ring-offset-2 ${
                                      fb.status === "approved" ? "bg-emerald-600" : "bg-gray-300"
                                    }`}
                                  >
                                    <span className="sr-only">
                                      {fb.status === "approved" ? "Published (ON)" : "Unpublished (OFF)"}
                                    </span>
                                    <span
                                      aria-hidden="true"
                                      className={`pointer-events-none inline-flex items-center justify-center h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        fb.status === "approved" ? "translate-x-5" : "translate-x-0"
                                      }`}
                                    >
                                      {fb.status === "approved" ? (
                                        <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                      )}
                                    </span>
                                  </button>
                                </div>

                                {/* Text publication state (does not rely on color alone) */}
                                <div id={`publish-status-text-${fb.id}`} className="flex items-center gap-1.5 text-[10px]">
                                  <span
                                    className={`font-bold px-1.5 py-0.5 rounded tracking-wide ${
                                      fb.status === "approved"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : fb.status === "rejected"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {fb.status === "approved"
                                      ? "ON • Live on site"
                                      : fb.status === "rejected"
                                      ? "OFF • Rejected"
                                      : "OFF • Pending"}
                                  </span>
                                </div>
                              </div>

                              {/* 2. COMPACT ACTION ICONS (Edit, Delete) */}
                              <div className="flex items-center gap-1.5 pt-1">

                                {/* Edit Button: Icon Only */}
                                <button
                                  type="button"
                                  onClick={() => startEditFeedback(fb)}
                                  title={`Edit review details for ${fb.name}`}
                                  aria-label={`Edit review details for ${fb.name}`}
                                  className="p-2 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]"
                                >
                                  <Pencil className="w-3.5 h-3.5 shrink-0 text-gray-600" />
                                </button>

                                {/* Delete Button: Icon Only */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFeedback(fb.id, fb.name)}
                                  title={`Permanently delete feedback submission by ${fb.name}`}
                                  aria-label={`Permanently delete feedback submission by ${fb.name}`}
                                  className="p-2 rounded-xl text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5 shrink-0 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Edit Feedback */}
      {editingFeedback && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-[#8B3DFF] uppercase tracking-wider">Feedback Review</span>
                <h3 className="text-lg font-bold text-gray-900">Edit Submission Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFeedback(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedbackEdit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={editFeedbackForm.name}
                  onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Place / City *</label>
                <input
                  type="text"
                  required
                  value={editFeedbackForm.place}
                  onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, place: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditFeedbackForm({ ...editFeedbackForm, rating: star })}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition ${
                          star <= editFeedbackForm.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 fill-gray-100"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">
                    {editFeedbackForm.rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Review Text (Optional)</label>
                <textarea
                  rows={4}
                  value={editFeedbackForm.review_text}
                  onChange={(e) => setEditFeedbackForm({ ...editFeedbackForm, review_text: e.target.value })}
                  placeholder="Review comments or leave blank"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B3DFF] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingFeedback(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingFeedbackEdit}
                  className="px-5 py-2 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {savingFeedbackEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Uploaded Media */}
      {viewingMedia && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold text-[#8B3DFF] uppercase tracking-wider">Attached Media</span>
                <h3 className="text-base font-bold text-gray-900">Uploaded by {viewingMedia.author}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingMedia(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center max-h-[65vh]">
              {viewingMedia.type === "video" ? (
                <video
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full"
                  src={viewingMedia.url}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  src={viewingMedia.url}
                  alt={`Attachment by ${viewingMedia.author}`}
                  className="max-h-[65vh] object-contain mx-auto"
                />
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <span className="text-[11px]">Media is only visible to the public after this review is approved.</span>
              <button
                type="button"
                onClick={() => setViewingMedia(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Order Details Drawer/Dialog */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-[#8B3DFF] uppercase tracking-wider">Order Details</span>
                <h3 className="text-xl font-bold text-gray-900">{selectedOrder.order_number || selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-gray-50">
                  <span className="text-gray-400 block font-medium">Customer</span>
                  <strong className="text-gray-900 text-sm mt-0.5 block">{selectedOrder.customer_name}</strong>
                  <span className="text-gray-500 text-[11px]">{selectedOrder.customer_email || "customer@example.com"}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-gray-50">
                  <span className="text-gray-400 block font-medium">Total Amount</span>
                  <strong className="text-gray-900 text-sm mt-0.5 block">
                    ₹{selectedOrder.amount ? Number(selectedOrder.amount).toLocaleString("en-IN") : "1,299"}
                  </strong>
                  <span className="text-emerald-600 font-semibold text-[11px] uppercase">{selectedOrder.payment_status}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Update Order Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {["In Production", "Paid", "Delivered", "Shipped", "Pending"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusSelect(selectedOrder, st)}
                      className={`py-2 px-3 rounded-xl font-semibold transition text-xs ${selectedOrder.status === st
                          ? "bg-[#8B3DFF] text-white shadow-xs"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                        }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipped & Tracking Details Card */}
              {(selectedOrder.status === "Shipped" || selectedOrder.tracking_id) && (
                <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 text-gray-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-[#8B3DFF]" />
                      <span>Shipment & Tracking Details</span>
                    </span>
                    <button
                      onClick={() => handleStatusSelect(selectedOrder, "Shipped")}
                      className="text-[11px] font-semibold text-[#8B3DFF] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Tracking</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Shipping Carrier</span>
                      <strong className="text-gray-900 font-semibold">{selectedOrder.shipping_carrier || "Delhivery"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Tracking / AWB No.</span>
                      <span className="font-mono text-[#8B3DFF] font-bold text-xs">{selectedOrder.tracking_id || "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-gray-50 text-gray-600">
                <span className="font-semibold text-gray-900 block mb-1">Format Specification</span>
                <div className="flex items-center gap-2">
                  {selectedOrder.format_type === "digital" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      <BookOpen className="w-3 h-3" /> Digital PDF Edition
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Package className="w-3 h-3" /> Premium Hardcover Keepsake (8×8")
                    </span>
                  )}
                </div>
              </div>

              {/* Shipping Address Details for Hardcover */}
              {selectedOrder.shipping_address && (() => {
                try {
                  const addr = JSON.parse(selectedOrder.shipping_address);
                  return (
                    <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#FDE68A] text-gray-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          <span>Shipping Address</span>
                        </span>
                        {addr.state && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {addr.state}
                          </span>
                        )}
                      </div>
                      <div className="text-xs space-y-0.5 pt-1">
                        <p className="font-semibold text-gray-900">{addr.full_name || selectedOrder.customer_name} {addr.phone ? `• ${addr.phone}` : ""}</p>
                        <p>{addr.street_address}</p>
                        {addr.landmark && <p className="text-gray-500">Landmark: {addr.landmark}</p>}
                        <p>{addr.city ? `${addr.city}, ` : ""}{addr.state || ""} {addr.pincode ? `- ${addr.pincode}` : ""}</p>
                      </div>
                    </div>
                  );
                } catch (e) {
                  return (
                    <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-600">
                      <strong>Address:</strong> {selectedOrder.shipping_address}
                    </div>
                  );
                }
              })()}

              {/* Razorpay Payment Reference & Storybook Links */}
              <div className="p-3.5 rounded-2xl bg-gray-50 text-gray-600 space-y-1.5">
                <span className="font-semibold text-gray-900 block mb-1">Payment & Fulfillment Reference</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Payment ID</span>
                    <span className="font-mono text-gray-800 font-medium">
                      {selectedOrder.razorpay_payment_id || selectedOrder.payment_intent_id || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Razorpay Order</span>
                    <span className="font-mono text-gray-800 font-medium">
                      {selectedOrder.razorpay_order_id || "Direct"}
                    </span>
                  </div>
                </div>

                {selectedOrder.job_id && (
                  <div className="pt-2 border-t border-gray-200/60 flex items-center gap-2">
                    <a
                      href={api.resolveUrl(`/api/v1/personalization/${selectedOrder.job_id}/print-pdf?size=8x8&color=admin_preview`)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#8B3DFF] text-white font-semibold text-[11px] flex items-center gap-1 hover:bg-[#7828f7] transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>Print-Ready PDF</span>
                    </a>
                    <a
                      href={`/personalize?job_id=${selectedOrder.job_id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-semibold text-[11px] flex items-center gap-1 hover:bg-gray-300 transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View Storybook</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold"
              >
                Delete Order
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Mark Order as Shipped (Tracking ID & Carrier Dropdown) */}
      {shippingModal && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#8B3DFF] flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Ship Order & Add Tracking</h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {shippingModal.order.order_number || shippingModal.order.id} • {shippingModal.order.customer_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShippingModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Email for Notification */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-purple-900">
                <Mail className="w-3.5 h-3.5 text-[#8B3DFF]" />
                <span>Customer Email (Status will be sent here) *</span>
              </label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={shippingModal.customerEmail}
                onChange={(e) => setShippingModal({ ...shippingModal, customerEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
              />
              <p className="text-[11px] text-purple-700/80">
                An official Kutty Story dispatch notification email with tracking information will be delivered to this address.
              </p>
            </div>

            {/* The 2 Fields: Shipping Carrier Dropdown & Tracking ID */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Shipping Carrier *
                </label>
                <select
                  value={shippingModal.carrier}
                  onChange={(e) => setShippingModal({ ...shippingModal, carrier: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF] cursor-pointer"
                >
                  <option value="Delhivery">Delhivery</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="DTDC">DTDC Express</option>
                  <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                  <option value="Shadowfax">Shadowfax</option>
                  <option value="Xpressbees">Xpressbees</option>
                  <option value="Ekart Logistics">Ekart Logistics</option>
                  <option value="Professional Couriers">The Professional Couriers</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="FedEx">FedEx</option>
                  <option value="Other Courier">Other Courier</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Tracking ID / AWB Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. DEL789421098 or 1489201"
                  value={shippingModal.trackingId}
                  onChange={(e) => setShippingModal({ ...shippingModal, trackingId: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF] font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShippingModal(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmShipping}
                disabled={shippingSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold shadow-md shadow-[#8B3DFF]/25 hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {shippingSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating & Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" />
                    <span>Save & Notify Customer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Update Notification Toast */}
      {statusToast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-gray-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-gray-700/60 backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 max-w-md">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-xs font-medium leading-relaxed">
            {statusToast.message}
          </div>
          <button
            onClick={() => setStatusToast(null)}
            className="text-gray-400 hover:text-white transition ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Modal: Create New Order */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateOrder}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-xl font-bold text-gray-900">Create New Order</h3>
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-800 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Zahra Adil"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Customer Email (Optional)</label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="e.g. zahra.adil@example.com"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-800 block mb-1">Total (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-800 block mb-1">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="In Production">In Production</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-800 block mb-1">Book Format</label>
                <select
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                >
                  <option value="print_hardcover">Hardcover Print Edition (₹1,299)</option>
                  <option value="print_softcover">Softcover Print Edition (₹799)</option>
                  <option value="digital">Digital PDF Edition (₹399)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowNewOrderModal(false)}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingOrder}
                className="px-5 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-semibold disabled:opacity-50 transition"
              >
                {creatingOrder ? "Creating..." : "Save Order"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CREATE A BOOK (Matching uploaded screenshot) */}
      {showNewBookModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Create a book</h3>
              <button
                type="button"
                onClick={() => setShowNewBookModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
                {bookError}
              </div>
            )}

            <form onSubmit={handleCreateBook} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="The Great Space Rescue"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                />
              </div>

              {/* Slug and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Slug (URL id)</label>
                  <input
                    type="text"
                    required
                    value={newBookSlug}
                    onChange={(e) => {
                      setNewBookSlug(e.target.value);
                      setNewBookSlugTouched(true);
                    }}
                    placeholder="the-great-space-rescue"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                  <select
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  >
                    <option value="ADVENTURE">ADVENTURE</option>
                    <option value="LEARNING">LEARNING</option>
                    <option value="BEDTIME">BEDTIME</option>
                    <option value="FANTASY">FANTASY</option>
                    <option value="VALUES">VALUES</option>
                    <option value="FAMILY">FAMILY</option>
                    <option value="CELEBRATION">CELEBRATION</option>
                  </select>
                </div>
              </div>

              {/* Min age and Max age */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min age</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={newBookMinAge}
                    onChange={(e) => setNewBookMinAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max age</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={newBookMaxAge}
                    onChange={(e) => setNewBookMaxAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  />
                </div>
              </div>

              {/* PDF price and Print price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">PDF price (₹)</label>
                  <input
                    type="number"
                    value={newBookPdfPrice}
                    onChange={(e) => setNewBookPdfPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Print price (₹)</label>
                  <input
                    type="number"
                    value={newBookPrintPrice}
                    onChange={(e) => setNewBookPrintPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  />
                </div>
              </div>

              {/* Total pages */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Total pages</label>
                <input
                  type="number"
                  min="4"
                  max="64"
                  value={newBookTotalPages}
                  onChange={(e) => setNewBookTotalPages(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tagline</label>
                <input
                  type="text"
                  value={newBookTagline}
                  onChange={(e) => setNewBookTagline(e.target.value)}
                  placeholder="Blast off on a cosmic mission across the galaxy."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                />
              </div>

              {/* Upload PDF Section */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-bold text-gray-900">
                    <FileText className="w-3.5 h-3.5 text-[#8B3DFF]" />
                    Upload Storybook PDF (Optional)
                  </span>
                  <span className="text-[10px] text-[#8B3DFF] font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    Auto-imports all pages & cover
                  </span>
                </label>

                {!newBookPdfFile ? (
                  <label className="border-2 border-dashed border-gray-200 hover:border-[#8B3DFF] bg-gray-50/60 hover:bg-purple-50/20 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition group">
                    <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-[#8B3DFF] transition mb-1" />
                    <span className="text-xs font-semibold text-gray-700 group-hover:text-[#8B3DFF] transition">
                      Click to choose or drag & drop story PDF
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      Accepts standard storybook .pdf files (Pages rendered at 150 DPI)
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setNewBookPdfFile(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/80 border border-purple-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#8B3DFF] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {newBookPdfFile.name}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {(newBookPdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for auto-import & page rendering
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewBookPdfFile(null)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition shrink-0 ml-2"
                      title="Remove PDF"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cover Note Section (Exact styling & text from screenshot) */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Cover</label>
                <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/40 p-4 space-y-2">
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    {newBookPdfFile ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        PDF Attached: <strong>Page 1</strong> of the uploaded PDF will automatically be extracted and used as the front cover artwork for this book!
                      </span>
                    ) : (
                      <>
                        Nothing to upload here. A book's cover is the <strong className="text-gray-800">Front cover</strong> page you author next — its base art is what the storefront card, cart and checkout show. A placeholder stands in until then.
                      </>
                    )}
                  </p>

                  {/* Pro enhancement: allow cover URL optionally if no PDF is attached */}
                  {!newBookPdfFile && (
                    <div className="pt-2 border-t border-purple-100/60">
                      <label className="block text-[10px] font-semibold text-gray-500 mb-1">
                        Custom Cover Image URL (Optional):
                      </label>
                      <input
                        type="url"
                        value={newBookCoverUrl}
                        onChange={(e) => setNewBookCoverUrl(e.target.value)}
                        placeholder="https://... (or leave empty to author front cover later)"
                        className="w-full px-3 py-1.5 rounded-lg border border-purple-200 bg-white text-gray-900 text-xs focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowNewBookModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingBook}
                  className="px-6 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {creatingBook && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>
                    {creatingBook
                      ? (newBookPdfFile ? "Importing & Rendering PDF Pages..." : "Creating Book...")
                      : (newBookPdfFile ? "Import & Create Book" : "Create Book")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT AGE RANGE & PRICING */}
      {showEditAgeModal && storyToEdit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Age Range & Pricing</h3>
                <p className="text-xs text-gray-500 mt-0.5">{storyToEdit.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditAgeModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAgeEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min Age</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={editMinAge}
                    onChange={(e) => setEditMinAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Age</label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={editMaxAge}
                    onChange={(e) => setEditMaxAge(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">PDF Price (₹)</label>
                  <input
                    type="number"
                    value={editPdfPrice}
                    onChange={(e) => setEditPdfPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Print Price (₹)</label>
                  <input
                    type="number"
                    value={editPrintPrice}
                    onChange={(e) => setEditPrintPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                >
                  <option value="ADVENTURE">ADVENTURE</option>
                  <option value="LEARNING">LEARNING</option>
                  <option value="BEDTIME">BEDTIME</option>
                  <option value="FANTASY">FANTASY</option>
                  <option value="VALUES">VALUES</option>
                  <option value="FAMILY">FAMILY</option>
                  <option value="CELEBRATION">CELEBRATION</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowEditAgeModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAgeEdit}
                  className="px-5 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition flex items-center gap-2"
                >
                  {savingAgeEdit && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{savingAgeEdit ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TEST RENDER A BOOK */}
      {showTestRenderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8B3DFF]" />
                  <span>Test Render a Book</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Launch a high-fidelity personalization preview session with character consistency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTestRenderModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTestRender} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Select Story Template
                </label>
                <select
                  value={testRenderStoryId}
                  onChange={(e) => setTestRenderStoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  required
                >
                  {stories.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Child Name
                </label>
                <input
                  type="text"
                  value={testRenderChildName}
                  onChange={(e) => setTestRenderChildName(e.target.value)}
                  placeholder="Enter child's name..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Child Photo (Optional reference)
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-purple-300 transition bg-gray-50/50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setTestRenderPhotoFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="testRenderPhotoInput"
                  />
                  <label
                    htmlFor="testRenderPhotoInput"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-xs font-semibold text-[#8B3DFF]">
                      {testRenderPhotoFile ? testRenderPhotoFile.name : "Click to upload child photo"}
                    </span>
                    <span className="text-[11px] text-gray-400">PNG, JPG or WebP up to 10MB</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTestRenderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTestRender}
                  className="px-5 py-2.5 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submittingTestRender && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submittingTestRender ? "Generating Preview..." : "✨ Launch Test Render"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PHOTOS & GENERATED PREVIEW ASSETS */}
      {selectedJobForPhotos && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#8B3DFF]" />
                  <span>Preview Assets - {selectedJobForPhotos.child_name}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedJobForPhotos.story_title || "Personalized Story"} • Status:{" "}
                  <span className="font-semibold text-gray-700">{selectedJobForPhotos.status}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJobForPhotos(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Child Reference Photo */}
            <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-purple-200 shrink-0 border-2 border-white shadow-xs">
                {selectedJobForPhotos.photo_url ? (
                  <img
                    src={selectedJobForPhotos.photo_url}
                    alt={selectedJobForPhotos.child_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-purple-700 font-bold text-xl">
                    {selectedJobForPhotos.child_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wide">
                  Child Reference Photo
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                  {selectedJobForPhotos.child_name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Used as facial consistency prompt across all illustration plates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedJobForPhotos, "print")}
                  title="Download complete print-ready PDF with all pages in 8×8 RGB"
                  className="px-3.5 py-2 rounded-xl bg-[#8B3DFF] text-white hover:bg-[#7828f7] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print PDF (8×8 RGB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedJobForPhotos, "preview")}
                  title="Download 3-page preview PDF"
                  className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-gray-500" />
                  <span>Preview PDF</span>
                </button>
              </div>
            </div>

            {/* Generated Pages Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800">
                  Rendered Preview Plates
                </h4>
                <span className="text-xs text-gray-400">
                  {selectedJobForPhotos.assets?.length || 0} plates available
                </span>
              </div>

              {selectedJobForPhotos.assets && selectedJobForPhotos.assets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {selectedJobForPhotos.assets.map((asset, idx) => (
                    <div
                      key={asset.id || idx}
                      className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-gray-200">
                        <img
                          src={asset.image_url}
                          alt={`Page ${asset.page_number || idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="p-2.5 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-gray-800">
                            Page {asset.page_number || idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Free Preview
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {(asset as any).prompt || (asset as any).caption || `Scene illustration for ${selectedJobForPhotos.child_name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-gray-50/60 rounded-2xl border border-gray-100 text-gray-400 text-xs">
                  <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2 stroke-1" />
                  <p className="font-semibold text-gray-600">No generated preview plates yet</p>
                  <p className="text-gray-400 text-[11px] mt-0.5">
                    Preview plates will appear here once illustration generation is triggered.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Created: {selectedJobForPhotos.created_formatted || (selectedJobForPhotos.created_at ? new Date(selectedJobForPhotos.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Recently")}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`/personalize/${selectedJobForPhotos.story_slug || ""}?job_id=${selectedJobForPhotos.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Interactive Reader</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedJobForPhotos(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. FULL BOOK HD GENERATION PROGRESS MODAL */}
      {generatingFullJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#8B3DFF]">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Generating Full HD Storybook
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {generatingFullJob.child_name} · {generatingFullJob.story_title || "Storybook"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGeneratingFullJob(null)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                title="Run in background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Section */}
            {(() => {
              const total = generatingFullJob.total_pages || 24;
              const completed = generatingFullJob.completed_pages || 0;
              const pct = Math.min(100, Math.round((completed / total) * 100));
              const isFinished = completed >= total && (generatingFullJob.status === "completed" || !generatingFullJob.status?.includes("Rendering"));

              return (
                <div className="my-5 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800">
                      {isFinished ? "✅ Complete! Downloading PDF..." : (generatingFullJob.current_stage || `Rendering Page ${completed + 1} of ${total}`)}
                    </span>
                    <span className="font-bold text-[#8B3DFF] text-sm">{pct}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden p-0.5 border border-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#8B3DFF] via-purple-500 to-pink-500 transition-all duration-500 shadow-xs"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>8×8 Vibrant RGB Print Engine</span>
                    <span className="font-medium text-gray-600">{completed} of {total} plates ready</span>
                  </div>
                </div>
              );
            })()}

            {/* Quality assurance notice */}
            <div className="bg-purple-50/70 rounded-2xl p-3.5 border border-purple-100 text-xs text-purple-950 flex items-start gap-2.5 mb-5">
              <Sparkles className="w-4 h-4 text-[#8B3DFF] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-purple-900">CodeFormer Neural Face Restoration Active</p>
                <p className="text-[11px] text-purple-700 leading-relaxed">
                  Every single illustration plate is enhanced with deep facial alignment and CodeFormer restoration for 100% authentic photographic likeness.
                </p>
              </div>
            </div>

            {/* Action footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auto-downloads upon completion
              </span>
              <button
                type="button"
                onClick={() => setGeneratingFullJob(null)}
                className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                Run in background
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

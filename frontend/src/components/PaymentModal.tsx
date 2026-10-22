import React, { useState } from "react";
import {
  X,
  Sparkles,
  BookOpen,
  Package,
  Check,
  ShieldCheck,
  Truck,
  Download,
  ArrowRight,
  ChevronLeft,
  CreditCard,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  PartyPopper
} from "lucide-react";
import { api, StoryTemplate, PersonalizationJob } from "@/lib/api";
import PdfDownloadModal from "./PdfDownloadModal";

// 28 Indian States + UTs mapped to the IDs expected by backend State Sales analytics
export const INDIAN_STATES = [
  { id: "tn", name: "Tamil Nadu" },
  { id: "kl", name: "Kerala" },
  { id: "ka", name: "Karnataka" },
  { id: "ap", name: "Andhra Pradesh" },
  { id: "tg", name: "Telangana" },
  { id: "mh", name: "Maharashtra" },
  { id: "dl", name: "Delhi (NCR)" },
  { id: "gj", name: "Gujarat" },
  { id: "up", name: "Uttar Pradesh" },
  { id: "wb", name: "West Bengal" },
  { id: "rj", name: "Rajasthan" },
  { id: "pb", name: "Punjab" },
  { id: "hr", name: "Haryana" },
  { id: "mp", name: "Madhya Pradesh" },
  { id: "br", name: "Bihar" },
  { id: "or", name: "Odisha" },
  { id: "as", name: "Assam" },
  { id: "jh", name: "Jharkhand" },
  { id: "ct", name: "Chhattisgarh" },
  { id: "ut", name: "Uttarakhand" },
  { id: "hp", name: "Himachal Pradesh" },
  { id: "ga", name: "Goa" },
  { id: "tr", name: "Tripura" },
  { id: "ml", name: "Meghalaya" },
  { id: "mn", name: "Manipur" },
  { id: "nl", name: "Nagaland" },
  { id: "mz", name: "Mizoram" },
  { id: "ar", name: "Arunachal Pradesh" },
  { id: "sk", name: "Sikkim" },
];

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: PersonalizationJob;
  story?: StoryTemplate | null;
  selectedLanguage?: string;
  onPaymentSuccess: (orderInfo: {
    order_number: string;
    format_type: string;
    amount: number;
  }) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  job,
  story,
  selectedLanguage = "english",
  onPaymentSuccess,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const [selectedFormat, setSelectedFormat] = useState<"digital" | "print_hardcover">("digital");
  const [step, setStep] = useState<"select_product" | "shipping_address" | "processing" | "success">("select_product");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Shipping form fields
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [stateId, setStateId] = useState("tn");
  const [pincode, setPincode] = useState("");

  // Success state details
  const [completedOrder, setCompletedOrder] = useState<{
    order_number: string;
    format_type: string;
    amount: number;
  } | null>(null);

  // PDF Download loading animation modal state
  const [downloadModal, setDownloadModal] = useState<{
    isOpen: boolean;
    url: string | null;
    filename?: string;
    formatTitle?: string;
  }>({
    isOpen: false,
    url: null,
  });

  const digitalPrice = story?.price_digital || 799;
  const printPrice = story?.price_print || 1399;
  const childName = job.child_name || "Your Child";

  // Validate shipping details for physical book
  const validateShipping = () => {
    if (!fullName.trim()) return "Please enter your full name.";
    if (!phoneNumber.trim() || phoneNumber.replace(/\D/g, "").length < 10) {
      return "Please enter a valid 10-digit mobile number.";
    }
    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      return "Please enter a complete delivery address.";
    }
    if (!city.trim()) return "Please enter your city/town.";
    if (!pincode.trim() || pincode.replace(/\D/g, "").length !== 6) {
      return "Please enter a valid 6-digit Indian PIN code.";
    }
    return null;
  };

  const handleProceedToPayment = async () => {
    setErrorMessage("");

    if (selectedFormat === "print_hardcover" && step === "select_product") {
      setStep("shipping_address");
      return;
    }

    let shippingData = null;
    if (selectedFormat === "print_hardcover") {
      const valError = validateShipping();
      if (valError) {
        setErrorMessage(valError);
        return;
      }
      const stObj = INDIAN_STATES.find((s) => s.id === stateId);
      shippingData = {
        full_name: fullName.trim(),
        phone: phoneNumber.trim(),
        street_address: streetAddress.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: stObj?.name || "Tamil Nadu",
        state_id: stateId,
        pincode: pincode.trim(),
      };
    }

    setLoading(true);

    try {
      // 1. Create Order on Backend
      const orderRes = await api.createPaymentOrder({
        job_id: job.id,
        format_type: selectedFormat,
        shipping_address: shippingData,
        customer_name: fullName || `${childName}'s Family`,
        customer_phone: phoneNumber,
      });

      // 2. Launch Razorpay Checkout
      const isRazorpayAvailable = typeof (window as any).Razorpay === "function";

      if (isRazorpayAvailable) {
        const options = {
          key: orderRes.razorpay_key,
          amount: orderRes.amount,
          currency: orderRes.currency,
          name: "Kutty Story Atelier",
          description: `${selectedFormat === "digital" ? "Digital Edition" : "Hardcover Heirloom"} • ${story?.title || "Enchanted Storybook"}`,
          image: "/logo.png",
          order_id: orderRes.razorpay_order_id.startsWith("order_sim_") ? undefined : orderRes.razorpay_order_id,
          handler: async function (response: any) {
            try {
              setLoading(true);
              const verifyRes = await api.verifyPayment({
                job_id: job.id,
                format_type: selectedFormat,
                razorpay_order_id: response.razorpay_order_id || orderRes.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 10)}`,
                razorpay_signature: response.razorpay_signature || `simulated_sig_${Date.now()}`,
                shipping_address: shippingData,
                customer_name: fullName || `${childName}'s Family`,
                customer_phone: phoneNumber,
              });

              setCompletedOrder({
                order_number: verifyRes.order_number,
                format_type: verifyRes.format_type,
                amount: verifyRes.amount,
              });
              setStep("success");
              onPaymentSuccess({
                order_number: verifyRes.order_number,
                format_type: verifyRes.format_type,
                amount: verifyRes.amount,
              });
            } catch (err: any) {
              setErrorMessage(err.message || "Payment verification failed. Please contact support.");
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: fullName || `${childName}'s Family`,
            contact: phoneNumber || "9876543210",
          },
          theme: {
            color: "#8B3DFF",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        try {
          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            setErrorMessage(response.error?.description || "Payment failed or cancelled.");
            setLoading(false);
          });
          rzp.open();
          setLoading(false);
          return;
        } catch (rzpErr: any) {
          console.warn("Notice: Razorpay modal initialization error, falling back to instant sandbox verification:", rzpErr);
        }
      }

      // Offline / Test sandbox simulation fallback
      const verifyRes = await api.verifyPayment({
        job_id: job.id,
        format_type: selectedFormat,
        razorpay_order_id: orderRes.razorpay_order_id,
        razorpay_payment_id: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
        razorpay_signature: `simulated_sig_${Date.now()}`,
        shipping_address: shippingData,
        customer_name: fullName || `${childName}'s Family`,
        customer_phone: phoneNumber,
      });

      setCompletedOrder({
        order_number: verifyRes.order_number,
        format_type: verifyRes.format_type,
        amount: verifyRes.amount,
      });
      setStep("success");
      onPaymentSuccess({
        order_number: verifyRes.order_number,
        format_type: verifyRes.format_type,
        amount: verifyRes.amount,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden relative my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#2D222A] via-[#3E2B38] to-[#2D222A] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C98A84] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kutty Story Keepsake Edition</span>
          </div>

          <h2 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-[#FAF7F2]">
            {step === "success"
              ? "Storybook Unlocked! 🎉"
              : `Unlock ${childName}'s Full Adventure`}
          </h2>
          <p className="text-xs text-[#EBE3D9] mt-1 max-w-lg leading-relaxed">
            {step === "success"
              ? `Your order has been recorded. All 26+ pages of "${story?.title || "The Storybook"}" are now ready for instant download.`
              : `You have viewed the first 5 preview pages. Complete checkout to unlock all 26+ pages with high-definition realistic face fusion.`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: PRODUCT SELECTION */}
          {step === "select_product" && (
            <div className="space-y-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Select Your Storybook Edition
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OPTION 1: DIGITAL EDITION */}
                <div
                  onClick={() => setSelectedFormat("digital")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedFormat === "digital"
                      ? "border-[#8B3DFF] bg-[#FAF5FF] shadow-md shadow-[#8B3DFF]/10 ring-2 ring-[#8B3DFF]/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#8B3DFF] flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      {selectedFormat === "digital" && (
                        <span className="w-6 h-6 rounded-full bg-[#8B3DFF] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-editorial-serif text-lg font-bold text-gray-900">
                        Digital Storybook Edition
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Instant High-Resolution PDF
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="font-editorial-serif text-2xl font-bold text-gray-900">
                        ₹{Number(digitalPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-500 ml-1.5 line-through">
                        ₹1,199
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Instant access to all 26+ pages</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Print-ready 8×8 RGB PDF format</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>All Indian regional languages</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 text-[11px] font-semibold text-[#8B3DFF] flex items-center gap-1">
                    <span>Instant delivery via download</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>

                {/* OPTION 2: PREMIUM HARDCOVER BOOK */}
                <div
                  onClick={() => setSelectedFormat("print_hardcover")}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedFormat === "print_hardcover"
                      ? "border-[#C98A84] bg-[#FAEEED]/40 shadow-md shadow-[#C98A84]/15 ring-2 ring-[#C98A84]/25"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-[#C98A84] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                    Heirloom Keepsake
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#FAEEED] text-[#C98A84] flex items-center justify-center font-bold">
                        <Package className="w-5 h-5" />
                      </div>
                      {selectedFormat === "print_hardcover" && (
                        <span className="w-6 h-6 rounded-full bg-[#C98A84] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-editorial-serif text-lg font-bold text-gray-900">
                        Premium Hardcover Keepsake
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Printed Book + Instant Digital PDF
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="font-editorial-serif text-2xl font-bold text-gray-900">
                        ₹{Number(printPrice).toLocaleString("en-IN")}
                      </span>
                      <span className="text-xs text-gray-500 ml-1.5 line-through">
                        ₹1,999
                      </span>
                    </div>

                    <ul className="space-y-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Premium matte-laminated hardcover</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Free doorstep shipping across India</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Includes full Digital PDF edition</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-3 text-[11px] font-semibold text-[#C98A84] flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    <span>Free shipping (3-5 business days)</span>
                  </div>
                </div>
              </div>

              {/* Secure Checkout Note & CTA */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-bit SSL encrypted • Powered by Razorpay</span>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#8B3DFF]/25 hover:shadow-xl transition cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {selectedFormat === "digital"
                      ? `Pay ₹${Number(digitalPrice).toLocaleString("en-IN")} & Download Instantly`
                      : `Continue to Shipping (₹${Number(printPrice).toLocaleString("en-IN")})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SHIPPING ADDRESS FORM (For Physical Hardcover Book) */}
          {step === "shipping_address" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("select_product")}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Editions</span>
                </button>
                <span className="text-xs font-bold text-[#C98A84] flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Free Doorstep Delivery Across India</span>
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Narmadha M"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Contact Phone Number (For Courier Tracking) *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">
                    Street Address / House No. / Flat *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Lotus Orchid, Gandhi Nagar"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Near Bus Stand"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chennai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">
                      State *
                    </label>
                    <select
                      value={stateId}
                      onChange={(e) => setStateId(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF] cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="max-w-xs">
                  <label className="font-semibold text-gray-700 block mb-1">
                    6-Digit PIN Code *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="600001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8B3DFF]"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-gray-500">
                  Total Payable: <strong className="text-gray-900 text-sm">₹{Number(printPrice).toLocaleString("en-IN")}</strong>
                </div>

                <button
                  onClick={handleProceedToPayment}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#8B3DFF]/25 hover:shadow-xl transition cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {loading ? "Launching Payment Gateway..." : `Pay ₹${Number(printPrice).toLocaleString("en-IN")} via Razorpay`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CELEBRATION / SUCCESS MODAL */}
          {step === "success" && completedOrder && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Payment Verified Successfully
                </span>
                <h3 className="font-editorial-serif text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome to {childName}'s Adventure!
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Your storybook has been unlocked and full book generation is active. You can now download your high-resolution storybook.
                </p>
              </div>

              {/* Order summary card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 max-w-md mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <strong className="font-mono text-gray-900">{completedOrder.order_number}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Edition:</span>
                  <span className="capitalize font-semibold text-gray-800">
                    {completedOrder.format_type === "digital" ? "Digital Illustrated Edition" : "Heirloom Hardcover Keepsake"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <strong className="text-emerald-700">₹{Number(completedOrder.amount).toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Paid & Unlocked
                  </span>
                </div>
              </div>

              {/* Direct Download Actions with Rich Loading Animation */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setDownloadModal({
                      isOpen: true,
                      url: `/api/v1/personalization/${job.id}/pdf?mode=full&lang=${selectedLanguage}`,
                      filename: `${(job.child_name || "Child").replace(/\s+/g, "_")}_${(story?.title || "Storybook").replace(/\s+/g, "_")}_Full_Storybook.pdf`,
                      formatTitle: `Full Illustrated Storybook PDF (${selectedLanguage.toUpperCase()})`
                    })
                  }
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#8B3DFF] hover:bg-[#7828f7] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Full PDF ({selectedLanguage.toUpperCase()})</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDownloadModal({
                      isOpen: true,
                      url: `/api/v1/personalization/${job.id}/print-pdf?size=8x8&color=rgb&lang=${selectedLanguage}`,
                      filename: `${(job.child_name || "Child").replace(/\s+/g, "_")}_${(story?.title || "Storybook").replace(/\s+/g, "_")}_Print_8x8.pdf`,
                      formatTitle: "Print-Ready 8×8 Keepsake PDF"
                    })
                  }
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#C98A84] hover:bg-[#B87A74] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                >
                  <Package className="w-4 h-4" />
                  <span>Print-Ready 8×8 PDF</span>
                </button>
              </div>

              <div>
                <button
                  onClick={onClose}
                  className="text-xs text-gray-500 hover:text-gray-800 font-semibold underline cursor-pointer"
                >
                  Return to Storybook Viewer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PDF Download Loading Animation & Progress Modal */}
      <PdfDownloadModal
        isOpen={downloadModal.isOpen}
        onClose={() => setDownloadModal((prev) => ({ ...prev, isOpen: false }))}
        downloadUrl={downloadModal.url}
        filename={downloadModal.filename}
        childName={job.child_name}
        storyTitle={story?.title}
        formatTitle={downloadModal.formatTitle}
        language={selectedLanguage}
      />
    </div>
  );
}

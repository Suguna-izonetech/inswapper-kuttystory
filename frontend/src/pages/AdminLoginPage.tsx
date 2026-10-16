import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { api, authService } from "@/lib/api";

type AuthMode = "login" | "register" | "forgot" | "reset_code";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");

  // Show/hide password states (eye icon)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states - Login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Form states - Register (Create Account: name, phone, email, password, confirm password)
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Form states - Forgot / Reset Password (SMTP)
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages when switching modes
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // 1. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.loginAdmin({
        username: loginUsername.trim(),
        password: loginPassword,
      });

      authService.saveSession(res.access_token, res.user);
      navigate("/admin_dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Create Account
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.registerAdmin({
        name: regName.trim(),
        phone: regPhone.trim() || undefined,
        email: regEmail.trim(),
        password: regPassword,
        confirm_password: regConfirmPassword,
      });

      authService.saveSession(res.access_token, res.user);
      setSuccessMsg("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/admin_dashboard");
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Forgot Password (Sends OTP via SMTP)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setSuccessMsg(`Verification code sent to ${res.email || forgotEmail} via SMTP. Please check your email inbox.`);
      setResetCode(""); // Never prefill OTP - user must check their registered email inbox
      setMode("reset_code");
    } catch (err: any) {
      setErrorMsg(err.message || "Could not send verification code via SMTP. Please check your registered email or server configuration.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Reset Password (Verify OTP & Set New Password)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmNewPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        new_password: newPassword,
        confirm_password: confirmNewPassword,
      });

      setSuccessMsg(res.message || "Password reset successfully!");
      setTimeout(() => {
        setLoginUsername(forgotEmail);
        setLoginPassword("");
        switchMode("login");
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please check your code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-[#1E293B]">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2.5 group mb-3">
          <div className="w-10 h-10 rounded-2xl bg-[#8B3DFF] text-white flex items-center justify-center shadow-md shadow-[#8B3DFF]/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-[#8B3DFF]">
            Kutty Story
          </span>
        </Link>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {mode === "login" && "Admin Dashboard Sign In"}
          {mode === "register" && "Create Admin Account"}
          {mode === "forgot" && "Forgot Password"}
          {mode === "reset_code" && "Set New Password"}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {mode === "login" && "Enter your admin credentials to access the management studio."}
          {mode === "register" && "Register a new administrator profile to manage orders and storybooks."}
          {mode === "forgot" && "We'll send a 6-digit verification code to your email via SMTP."}
          {mode === "reset_code" && "Enter the verification code and your new password."}
        </p>
      </div>

      {/* Main Form Container Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-sm border border-gray-100/90 space-y-6">
          {/* Notification Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {/* Username / Email */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="admin@kuttystory.com or username"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                </div>
              </div>

              {/* Password with Eye Icon */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-gray-700 block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-[11px] font-semibold text-[#8B3DFF] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8B3DFF]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Signing in..." : "Sign In to Dashboard"}</span>
              </button>

              {/* Toggle to Create Account */}
              <div className="text-center pt-3 border-t border-gray-100">
                <span className="text-gray-500 text-[11px]">Don't have an admin account? </span>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-[11px] font-bold text-[#8B3DFF] hover:underline"
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          {/* 2. CREATE ACCOUNT FORM (name, phone, email, password, confirm password) */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              {/* 1: Name */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Zahra Adil"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                </div>
              </div>

              {/* 2: Phone */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                </div>
              </div>

              {/* 3: Email */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="admin@kuttystory.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                </div>
              </div>

              {/* 4: Password with Eye Icon */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8B3DFF]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 5: Confirm Password with Eye Icon */}
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8B3DFF]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Creating account..." : "Create Admin Account"}</span>
              </button>

              {/* Toggle to Sign In */}
              <div className="text-center pt-2 border-t border-gray-100">
                <span className="text-gray-500 text-[11px]">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[11px] font-bold text-[#8B3DFF] hover:underline"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD (SMTP) */}
          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@kuttystory.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  An SMTP verification code will be dispatched to this address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Sending Code via SMTP..." : "Send Verification Code"}</span>
              </button>

              <div className="text-center pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* 4. VERIFY CODE & SET NEW PASSWORD (RESET) */}
          {mode === "reset_code" && (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 tracking-widest font-mono text-center text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8B3DFF]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B3DFF]/20 focus:border-[#8B3DFF] text-xs transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-0.5"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#8B3DFF]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#8B3DFF] hover:bg-[#7828f7] text-white font-semibold text-xs shadow-md shadow-[#8B3DFF]/25 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{loading ? "Updating Password..." : "Set New Password"}</span>
              </button>

              <div className="text-center pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>PBKDF2 SHA-256 Salted Security • SMTP Verified</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.", { autoClose: 2000 });
      setLoading(false);
      return;
    }

    try {
      await login(formData);
      toast.success("Welcome back!", {
        autoClose: 1500,
        toastId: "login-success",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed. Please check your credentials.", {
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Navigate only after AuthContext updates currentUser
  useEffect(() => {
    if (!currentUser) return;
    if ((currentUser.role || "").toString().toLowerCase().includes("admin")) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg,#6b39c9 0%, #7a48d6 20%, #4da6d8 60%, #2fa8c9 100%)",
      }}
    >
      <main className="w-full max-w-2xl p-6">
        <div
          className="mx-auto rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.90) 100%)",
            borderRadius: "28px",
            maxWidth: 900,
          }}
        >
          <div className="flex flex-col md:flex-row">
            {/* Left tall decorative column to mimic large rounded corner */}
            <div
              aria-hidden
              className="hidden md:block md:w-1/2"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                borderTopLeftRadius: 28,
                borderBottomLeftRadius: 28,
              }}
            />

            {/* Right: form area */}
            <section className="w-full md:w-1/2 px-8 py-12">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1b1b1b] mb-3 text-center">
                Sign in
              </h1>
              <p className="text-center text-sm text-slate-600 mb-8">
                Enter your details to continue
              </p>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Email */}
                <div>
                  <label className="text-sm text-slate-700 block mb-1">Email</label>
                  <input
                    type="text"
                    name="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-full border-2 border-black/40 bg-white/70 px-5 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#C9BEB3]/30 transition"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="text-sm text-slate-700 block mb-1">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-full border-2 border-black/40 bg-white/70 px-5 py-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#C9BEB3]/30 transition pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#7A6C5D] transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M6.25 6.25C3.8 8.04 2.25 10.4 2.25 12c0 1.6 1.55 3.96 4 5.75 2.45 1.79 5.2 2.75 7.75 2.75 2.55 0 5.3-.96 7.75-2.75 1.12-.81 2.04-1.72 2.75-2.75M14.12 14.12A3 3 0 019.88 9.88M12 3c2.55 0 5.3.96 7.75 2.75 2.45 1.79 4 4.15 4 5.75s-1.55 3.96-4 5.75C17.3 20.04 14.55 21 12 21c-2.55 0-5.3-.96-7.75-2.75C1.8 16.96.25 14.6.25 13c0-1.6 1.55-3.96 4-5.75C6.7 5.96 9.45 5 12 5z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12c0-1.6 1.55-3.96 4-5.75C8.7 4.46 11.45 3.5 14 3.5c2.55 0 5.3.96 7.75 2.75 2.45 1.79 4 4.15 4 5.75s-1.55 3.96-4 5.75C19.3 20.54 16.55 21.5 14 21.5c-2.55 0-5.3-.96-7.75-2.75C3.8 15.96 2.25 13.6 2.25 12z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between text-sm mt-1">
                  <label className="inline-flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={() => setRemember((r) => !r)}
                      className="w-4 h-4 rounded border border-slate-300"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-[#7A6C5D] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Login button (matches width & pill shape of inputs) */}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-full py-3 text-lg font-bold transition flex items-center justify-center ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-[#1f2937] hover:bg-black text-[#5ea0ff]"
                    }`}
                    aria-live="polite"
                  >
                    {loading ? "Signing in..." : "LOGIN"}
                  </button>
                </div>

                {/* Register link */}
                <p className="text-center text-sm text-slate-600 mt-2">
                  Don’t have an account?{" "}
                  <a
                    href="/register"
                    className="text-[#7A6C5D] font-medium hover:underline"
                  >
                    Register
                  </a>
                </p>
              </form>
            </section>
          </div>
        </div>
      </main>

      <ToastContainer position="top-center" />
    </div>
  );
}

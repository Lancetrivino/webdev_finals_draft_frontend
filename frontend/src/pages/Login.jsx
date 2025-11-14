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

  useEffect(() => {
    if (!currentUser) return;
    if ((currentUser.role || "").toLowerCase().includes("admin")) {
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
      <main className="w-full max-w-2xl px-6">
        <div
          className="mx-auto rounded-3xl shadow-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.90) 100%)",
            borderRadius: "28px",
            maxWidth: 850,
          }}
        >
          <div className="flex justify-center">
            <section className="w-full max-w-md px-8 py-12">
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

                  {/* Eye button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#7A6C5D] transition"
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
                          d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88..."
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
                          d="M2.25 12c0-1.6 1.55-3.96..."
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

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-full py-3 text-lg font-bold transition flex items-center justify-center ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-[#1f2937] hover:bg-black text-[#5ea0ff]"
                  }`}
                >
                  {loading ? "Signing in..." : "LOGIN"}
                </button>

                {/* Register */}
                <p className="text-center text-sm text-slate-600">
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

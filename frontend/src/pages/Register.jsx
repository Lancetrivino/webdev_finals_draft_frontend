import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address.";
    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      toast.success("Account created. Redirecting to login...", { autoClose: 1500 });
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Registration failed. Please try again.", { autoClose: 2500 });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrengthLabel = () => {
    const len = formData.password.length;
    if (len >= 12) return { label: "Strong", color: "text-green-600" };
    if (len >= 8) return { label: "Medium", color: "text-yellow-600" };
    if (len > 0) return { label: "Weak", color: "text-red-600" };
    return { label: "", color: "" };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 py-12 px-4">
      <main className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-violet-100">
          <div className="h-2 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500" />
          <div className="p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 text-gray-900">
              Create Account
            </h1>
            <p className="text-center text-sm text-gray-600 mb-6">
              Join Eventure and start creating or joining events
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
                  {errors.general}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full rounded-xl border px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition ${
                    errors.name ? "border-red-300" : "border-violet-100"
                  }`}
                />
                {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition ${
                    errors.email ? "border-red-300" : "border-violet-100"
                  }`}
                />
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className={`w-full rounded-xl border px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition pr-12 ${
                      errors.password ? "border-red-300" : "border-violet-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-violet-600 transition"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    className={`w-full rounded-xl border px-4 py-3 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 transition pr-12 ${
                      errors.confirmPassword ? "border-red-300" : "border-violet-100"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-violet-600 transition"
                    aria-label="toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>

              {formData.password && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${formData.password.length >= level * 3 ? (formData.password.length >= 12 ? "bg-green-500" : formData.password.length >= 8 ? "bg-yellow-500" : "bg-red-500") : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength: <span className={`font-semibold ${passwordStrengthLabel().color}`}>{passwordStrengthLabel().label}</span>
                  </p>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                <span className="text-sm text-gray-600">
                  I agree to the <a href="#" className="text-violet-600 hover:underline font-medium">Terms of Service</a> and <a href="#" className="text-violet-600 hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-xl py-3 text-lg font-semibold transition-all duration-200 transform shadow-md ${loading ? "bg-gray-300 cursor-not-allowed text-gray-700" : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"}`}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-violet-600 font-medium hover:underline">Sign in</button>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          By creating an account you agree to our <a href="#" className="text-violet-600 hover:underline">Terms</a> and <a href="#" className="text-violet-600 hover:underline">Privacy Policy</a>.
        </div>
      </main>

      <ToastContainer position="top-center" />
    </div>
  );
}

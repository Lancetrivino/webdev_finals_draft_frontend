import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Register() {
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear field error on typing
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full name is required.";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) newErrors.email = "Email is required.";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Please enter a valid email address.";

    if (!formData.password) newErrors.password = "Password is required.";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters.";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password.";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors({ general: "Registration failed. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #7B4CF6 0%, #5E6FE8 30%, #35B8D8 100%)",
      }}
    >
      <div
        className="w-[760px] max-w-full mx-4 rounded-2xl shadow-2xl"
        style={{
          borderRadius: "18px",
          boxShadow: "0 20px 50px rgba(16,24,40,0.25)",
        }}
      >
        <div
          className="bg-white rounded-2xl p-10 md:p-12"
          style={{
            borderRadius: "18px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,250,255,0.98))",
            boxShadow:
              "0 10px 30px rgba(16,24,40,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[#111827]">Create account</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your details to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
            {errors.general && (
              <p className="text-red-500 text-sm text-center">{errors.general}</p>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full rounded-full px-6 py-3 bg-[#eef6fb] border ${
                  errors.name ? "border-red-400" : "border-[#c6d7e8]"
                } placeholder-gray-500 outline-none focus:ring-0 focus:shadow-[0_0_0_4px_rgba(78,161,255,0.06)]`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-full px-6 py-3 bg-[#eef6fb] border ${
                  errors.email ? "border-red-400" : "border-[#c6d7e8]"
                } placeholder-gray-500 outline-none focus:ring-0 focus:shadow-[0_0_0_4px_rgba(78,161,255,0.06)]`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-2">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-full px-6 py-3 bg-[#eef6fb] border ${
                  errors.password ? "border-red-400" : "border-[#c6d7e8]"
                } placeholder-gray-500 outline-none focus:ring-0 focus:shadow-[0_0_0_4px_rgba(78,161,255,0.06)]`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">Verify Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full rounded-full px-6 py-3 bg-[#eef6fb] border ${
                  errors.confirmPassword ? "border-red-400" : "border-[#c6d7e8]"
                } placeholder-gray-500 outline-none focus:ring-0 focus:shadow-[0_0_0_4px_rgba(78,161,255,0.06)]`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Register Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-full py-3 font-extrabold text-lg transition ${
                  loading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#111827] hover:shadow-lg text-[#4EA1FF]"
                }`}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="text-[#4EA1FF] font-semibold hover:underline">
                  Login
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext"; // ✅ Correct relative path

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.", { autoClose: 2000 });
      setLoading(false);
      return;
    }

    try {
      const user = await login(formData);

      // ✅ Show toast
      toast.success("Welcome back!", { autoClose: 1500, toastId: "login-success" });

      // ✅ Navigate immediately
      if (user.role === "Admin") navigate("/admin", { replace: true });
      else navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed. Please check your credentials.", { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EDE9E6]">
      <div className="flex w-[950px] max-w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left Section */}
        <div
          className="w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/bg.jpg')" }}
        ></div>

        {/* Right Section */}
        <div className="w-1/2 p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">Eventure</h1>
          <p className="text-sm text-gray-500 mb-8">
            Please enter your details to continue
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#C9BEB3]"
              />
            </div>

            <div className="relative">
              <label className="text-sm text-gray-600">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#C9BEB3]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-[#7A6C5D]"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#7A6C5D] hover:bg-[#5F5245] text-white"
              }`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-sm text-[#7A6C5D] mt-2 cursor-pointer hover:underline">
              Forgot Password?
            </p>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Don’t have an account?{" "}
            <a
              href="/register"
              className="text-[#7A6C5D] font-medium hover:underline"
            >
              Register
            </a>
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default Login;

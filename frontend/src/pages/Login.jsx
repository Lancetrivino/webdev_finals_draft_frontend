import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const user = await login({
        email: formData.email,
        password: formData.password,
      });

      toast.success("Welcome back!", {
        autoClose: 1500,
        toastId: "login-success",
      });

      // Navigate based on role
      const role = (user.role || "").toString().toLowerCase();
      if (role.includes("admin")) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed. Please check credentials.", {
        autoClose: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect instantly
  useEffect(() => {
    if (!currentUser) return;
    const role = (currentUser.role || "").toString().toLowerCase();
    if (role.includes("admin")) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [currentUser, navigate]);

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
          <h1 className="text-3xl font-semibold text-[#2C2C2C] mb-2">
            Eventure
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Please enter your details to continue
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 mt-1 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#C9BEB3]"
              />
            </div>

            {/* Password */}
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
                className="absolute right-3 top-9 text-gray-500 hover:text-[#7A6C5D] transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // eye-off
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M6.25 6.25C3.8 8.04 2.25 10.4 2.25 12c0 1.6 1.55 3.96 4 5.75 2.45 1.79 5.2 2.75 7.75 2.75 2.55 0 5.3-.96 7.75-2.75 1.12-.81 2.04-1.72 2.75-2.75M14.12 14.12A3 3 0 019.88 9.88" />
                  </svg>
                ) : (
                  // eye
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-1.6 1.55-3.96 4-5.75C8.7 4.46 11.45 3.5 14 3.5c2.55 0 5.3.96 7.75 2.75 2.45 1.79 4 4.15 4 5.75s-1.55 3.96-4 5.75C19.3 20.54 16.55 21.5 14 21.5c-2.55 0-5.3-.96-7.75-2.75C3.8 15.96 2.25 13.6 2.25 12z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
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

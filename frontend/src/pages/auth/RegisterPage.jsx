
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import api from "../../services/api";

function RegisterPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);

    const name = formData.get("name").trim();
    const email = formData.get("email").trim().toLowerCase();
    const password = formData.get("password");

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess(
        response.data.message || "Agent account created successfully."
      );

      e.currentTarget.reset();

      setTimeout(() => {
        navigate("/agent/login", { replace: true });
      }, 1200);

    } catch (error) {
      setError(
        error.response?.data?.message ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Navbar */}
      <header className="px-6 md:px-12 py-7">
        <Link to="/support" className="flex items-center gap-3 w-fit">
          <div className="w-10 h-10 rounded-xl bg-[#6650d9] text-white flex items-center justify-center">
            <MessageCircle size={22} />
          </div>

          <span className="text-xl font-extrabold tracking-tight text-[#17172a]">
            BulkChat
          </span>
        </Link>
      </header>

      {/* Agent Registration */}
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md bg-white border border-[#e9eaf0] rounded-2xl p-7 sm:p-10 shadow-[0_15px_50px_rgba(30,25,70,0.06)]">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-[#6650d9] mb-5">
              <ShieldCheck size={17} />
              <span className="text-xs font-bold tracking-[2px]">
                AGENT WORKSPACE
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#17172a]">
              Create your account.
            </h1>

            <p className="text-sm text-[#77788c] mt-3 leading-6">
              Join your support team and start managing customer
              conversations with BulkChat.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#17172a] mb-2"
              >
                Full name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                required
                className="w-full h-12 px-4 rounded-lg border border-[#e9eaf0] outline-none text-sm focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10 transition"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#17172a] mb-2"
              >
                Work email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                required
                className="w-full h-12 px-4 rounded-lg border border-[#e9eaf0] outline-none text-sm focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10 transition"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#17172a] mb-2"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full h-12 px-4 rounded-lg border border-[#e9eaf0] outline-none text-sm focus:border-[#6650d9] focus:ring-4 focus:ring-[#6650d9]/10 transition"
              />

              <p className="text-xs text-[#9999a8] mt-2">
                Use at least 8 characters.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#6650d9] hover:bg-[#5140b5] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition duration-200 hover:-translate-y-0.5"
            >
              {loading ? "Creating account..." : "Create agent account"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="text-center text-sm text-[#77788c] mt-7">
            Already have an account?{" "}
            <Link
              to="/agent/login"
              className="font-semibold text-[#6650d9] hover:underline"
            >
              Sign in
            </Link>
          </p>

          <div className="border-t border-[#eeeef3] mt-7 pt-5 text-center">
            <p className="text-xs text-[#9999a8]">
              Looking for customer support?{" "}
              <Link
                to="/support"
                className="font-semibold text-[#6650d9] hover:underline"
              >
                Visit support
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-xs text-[#9999a8] py-5">
        © 2026 BulkChat. All rights reserved.
      </footer>
    </div>
  );
}

export default RegisterPage;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate("/");
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600" />

          <div className="p-10 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                <Lock className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mt-4">Welcome Back</h1>
              <p className="text-slate-500">Sign in to your LuxeCart account</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 bg-red-50 text-red-600 px-4 py-3.5 rounded-2xl text-sm font-medium border border-red-100"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 transition-all outline-none text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 transition-all outline-none text-sm"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/15 disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-slate-500 text-sm pt-2">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-600 font-bold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

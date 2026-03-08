import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted", { email });
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
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-slate-500">Sign in to your LuxeCart account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-xl shadow-slate-900/10 ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-emerald-600"
            }`}
          >
            <span>{isSubmitting ? "Signing In..." : "Sign In"}</span>
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="text-center pt-4 space-y-4">
          <button
            onClick={() => {
              setEmail("admin@luxecart.com");
              setPassword("admin123");
            }}
            className="w-full py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all"
          >
            Auto-fill Admin Credentials
          </button>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Admin Demo Access</p>
            <p className="text-xs text-slate-600">Email: <span className="font-mono font-bold">admin@luxecart.com</span></p>
            <p className="text-xs text-slate-600">Pass: <span className="font-mono font-bold">admin123</span></p>
          </div>
          
          <p className="text-slate-500 text-sm">
            Don't have an account?{" "}
            <Link to="/register" className="text-emerald-600 font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

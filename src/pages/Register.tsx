import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import {
  Mail, Lock, User, ArrowRight, Eye, EyeOff,
  CheckCircle, AlertCircle, Sparkles, ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE } from "../api/api.ts";

// Password strength helper
function getStrength(p: string) {
  let s = 0;
  if (p.length >= 6) s++;
  if (p.length >= 10) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
const STRENGTH_LABEL = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const STRENGTH_COLOR = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-600"];
const STRENGTH_TEXT = ["", "text-red-500", "text-orange-500", "text-yellow-600", "text-emerald-600", "text-emerald-700"];

const PERKS = [
  { icon: Sparkles, text: "Exclusive member deals & early access" },
  { icon: ShieldCheck, text: "Secure checkout & order tracking" },
  { icon: CheckCircle, text: "30-day easy returns, no questions asked" },
];

export default function Register() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = getStrength(password);
  const isStep1Valid = name.trim().length >= 2 && /\S+@\S+\.\S+/.test(email);
  const isStep2Valid = password.length >= 6 && password === confirm;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep2Valid) { setError("Passwords don't match or are too short."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data);
        navigate("/");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-0 shadow-2xl shadow-slate-200/60 rounded-[32px] overflow-hidden">

        {/* ── Left Panel — Perks ── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-10 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              Join the<br />
              <span className="text-emerald-400">LuxeCart</span> family
            </h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">
              Create your free account and unlock a world of premium shopping experiences.
            </p>
          </div>

          <div className="relative z-10 space-y-5 mt-8">
            {PERKS.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 + 0.3 }}
                className="flex items-center space-x-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </motion.div>
            ))}
          </div>

          <div className="relative z-10 mt-8">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Already a member?</p>
            <Link to="/login" className="text-emerald-400 font-bold text-sm hover:underline mt-1 inline-block">
              Sign in instead →
            </Link>
          </div>
        </div>

        {/* ── Right Panel — Form ── */}
        <div className="bg-white p-10 flex flex-col justify-center">
          {/* Step indicator */}
          <div className="flex items-center space-x-3 mb-8">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${step === s ? "bg-emerald-600 text-white scale-110 shadow-md shadow-emerald-500/30"
                  : step > s ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </div>
                {s === 1 && <div className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? "bg-emerald-400" : "bg-slate-100"}`} />}
              </React.Fragment>
            ))}
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {step === 1 ? "Create your account" : "Set your password"}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {step === 1 ? "Step 1 of 2 — Your basic details" : "Step 2 of 2 — Almost there!"}
            </p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2 bg-red-50 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium border border-red-100 mb-4"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ── Step 1 ── */}
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleNext}
                className="space-y-4"
              >
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      minLength={2}
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 outline-none transition-all text-sm"
                    />
                    {name.trim().length >= 2 && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 outline-none transition-all text-sm"
                    />
                    {/\S+@\S+\.\S+/.test(email) && (
                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isStep1Valid}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/15 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-slate-500 text-sm pt-1 md:hidden">
                  Already have an account?{" "}
                  <Link to="/login" className="text-emerald-600 font-bold hover:underline">Sign in</Link>
                </p>
              </motion.form>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {/* New password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 outline-none transition-all text-sm"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password && (
                    <div className="space-y-1 pt-0.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLOR[strength] : "bg-slate-100"}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-bold ${STRENGTH_TEXT[strength]}`}>{STRENGTH_LABEL[strength]}</p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15 outline-none transition-all text-sm"
                    />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && (
                    <p className={`text-xs font-bold flex items-center space-x-1 ${password === confirm ? "text-emerald-600" : "text-red-500"}`}>
                      {password === confirm
                        ? <><CheckCircle className="w-3.5 h-3.5" /><span>Passwords match</span></>
                        : <><AlertCircle className="w-3.5 h-3.5" /><span>Does not match</span></>}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] transition-all text-sm"
                  >
                    ← Back
                  </button>
                  <button type="submit" disabled={isSubmitting || !isStep2Valid}
                    className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><span>Create Account</span><CheckCircle className="w-5 h-5" /></>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

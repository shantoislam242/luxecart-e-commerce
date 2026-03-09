import React, { useState } from "react";
import { motion } from "motion/react";
import {
    Lock, Eye, EyeOff, ShieldCheck, CheckCircle, AlertCircle, KeyRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.tsx";

type Status = "idle" | "loading" | "success" | "error";

export default function AdminSettings() {
    const { user } = useAuth();
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.newPassword !== form.confirmPassword) {
            setStatus("error");
            setMessage("New passwords do not match.");
            return;
        }
        if (form.newPassword.length < 6) {
            setStatus("error");
            setMessage("New password must be at least 6 characters.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "Password changed successfully!");
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                setStatus("error");
                setMessage(data.message || "Failed to change password.");
            }
        } catch {
            setStatus("error");
            setMessage("Network error. Please try again.");
        }
    };

    const strength = (() => {
        const p = form.newPassword;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 6) s++;
        if (p.length >= 10) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][strength];
    const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-600"][strength];

    const Field = ({
        id, label, value, visible, onToggle, onChange, placeholder, autoComplete,
    }: {
        id: string; label: string; value: string; visible: boolean;
        onToggle: () => void; onChange: (v: string) => void; placeholder: string; autoComplete: string;
    }) => (
        <div>
            <label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    autoComplete={autoComplete}
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-slate-200 outline-none focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 transition-all text-sm bg-slate-50 focus:bg-white"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                >
                    {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8 px-4">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <KeyRound className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Settings</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your account security</p>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl select-none">
                    {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                    <p className="font-bold text-slate-900">{user?.name || "Admin"}</p>
                    <p className="text-slate-500 text-sm">{user?.email}</p>
                    <span className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3" /> <span>{user?.role || "admin"}</span>
                    </span>
                </div>
            </div>

            {/* Change Password Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                        <p className="text-slate-400 text-xs">Choose a strong password to secure your account</p>
                    </div>
                </div>

                {/* Success / Error Banner */}
                {status === "success" && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center space-x-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-4 rounded-2xl"
                    >
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{message}</span>
                    </motion.div>
                )}
                {status === "error" && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center space-x-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium">{message}</span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Field
                        id="currentPassword" label="Current Password"
                        value={form.currentPassword} visible={show.current}
                        onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
                        onChange={(v) => setForm((f) => ({ ...f, currentPassword: v }))}
                        placeholder="Enter your current password"
                        autoComplete="current-password"
                    />

                    <Field
                        id="newPassword" label="New Password"
                        value={form.newPassword} visible={show.newPwd}
                        onToggle={() => setShow((s) => ({ ...s, newPwd: !s.newPwd }))}
                        onChange={(v) => { setForm((f) => ({ ...f, newPassword: v })); setStatus("idle"); }}
                        placeholder="Enter a strong new password"
                        autoComplete="new-password"
                    />

                    {/* Strength meter */}
                    {form.newPassword && (
                        <div className="space-y-1.5 -mt-2">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : "bg-slate-100"}`} />
                                ))}
                            </div>
                            <p className={`text-xs font-bold ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</p>
                        </div>
                    )}

                    <Field
                        id="confirmPassword" label="Confirm New Password"
                        value={form.confirmPassword} visible={show.confirm}
                        onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                        onChange={(v) => { setForm((f) => ({ ...f, confirmPassword: v })); setStatus("idle"); }}
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
                    />

                    {/* Match indicator */}
                    {form.confirmPassword && (
                        <p className={`text-xs font-bold flex items-center space-x-1 ${form.newPassword === form.confirmPassword ? "text-emerald-600" : "text-red-500"}`}>
                            {form.newPassword === form.confirmPassword
                                ? <><CheckCircle className="w-3.5 h-3.5" /><span>Passwords match</span></>
                                : <><AlertCircle className="w-3.5 h-3.5" /><span>Passwords do not match</span></>}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-60 mt-2 shadow-lg shadow-emerald-600/20"
                    >
                        {status === "loading" ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <><Lock className="w-4 h-4" /><span>Update Password</span></>
                        )}
                    </button>
                </form>

                {/* Tips */}
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password Tips</p>
                    {[
                        "At least 6 characters long",
                        "Mix uppercase and lowercase letters",
                        "Include numbers and special characters",
                        "Avoid using common words or personal info",
                    ].map((tip) => (
                        <p key={tip} className="text-xs text-slate-400 flex items-center space-x-2">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block flex-shrink-0" />
                            <span>{tip}</span>
                        </p>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

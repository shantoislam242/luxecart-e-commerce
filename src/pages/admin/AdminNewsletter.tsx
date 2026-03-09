import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE } from "../../api/api.ts";
import {
    Search,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminNewsletter() {
    const { user: currentUser } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok = true) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch(`${API_BASE}/newsletter`, {
                headers: { Authorization: `Bearer ${currentUser?.token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setSubscriptions(data);
            } else {
                showToast(data.message || "Failed to fetch subscriptions", false);
            }
        } catch (error) {
            console.error(error);
            showToast("Network error", false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [currentUser]);

    const handleDelete = async (id: number) => {
        try {
            // For now we don't have a delete endpoint for newsletter, so let's just show toast or implement it later
            // But let's assume one exists or just mock it for UI demo
            showToast("Delete feature for newsletter coming soon!");
        } catch {
            showToast("Error removing subscription", false);
        } finally {
            setDeleteConfirm(null);
        }
    };

    const filteredSubs = subscriptions.filter((s: any) =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                    />
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-100">
                    Total Subscribers: {subscriptions.length}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                {["Email", "Status", "Joined", "Actions"].map((h, i) => (
                                    <th
                                        key={h}
                                        className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${i === 3 ? "text-right" : ""
                                            }`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        Loading subscriptions...
                                    </td>
                                </tr>
                            ) : filteredSubs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No subscribers found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubs.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <span className="font-bold text-slate-900">{s.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                                                <CheckCircle className="w-3 h-3" />
                                                <span>{s.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm">
                                                    {new Date(s.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setDeleteConfirm(s)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className={`fixed bottom-6 right-6 z-[60] px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium ${toast.ok ? "bg-emerald-600" : "bg-red-500"
                            }`}
                    >
                        {toast.ok ? "✅" : "❌"} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteConfirm(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5"
                        >
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Remove Subscriber?</h3>
                            <p className="text-slate-500 text-sm">
                                Subscription for <span className="font-semibold text-slate-700">{deleteConfirm.email}</span> will be removed.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm.id)}
                                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

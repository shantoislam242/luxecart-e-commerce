import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { API_BASE } from "../../api/api.ts";
import {
    Mail, Trash2, CheckCheck, Search, Eye, EyeOff,
    MessageSquare, Clock, User, AlertCircle,
} from "lucide-react";

interface Message {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: number;
    createdAt: string;
}

export default function AdminMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Message | null>(null);
    const [searchQ, setSearchQ] = useState("");
    const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const fetchMessages = async () => {
        setLoading(true);
        const res = await fetch(`${API_BASE}/messages`);
        const data = await res.json();
        setMessages(data.messages || []);
        setUnread(data.unread || 0);
        setLoading(false);
    };

    useEffect(() => { fetchMessages(); }, []);

    const handleMarkRead = async (msg: Message) => {
        if (msg.isRead) return;
        await fetch(`${API_BASE}/messages/${msg.id}/read`, { method: "PUT" });
        fetchMessages();
        if (selected?.id === msg.id) setSelected({ ...msg, isRead: 1 });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this message permanently?")) return;
        await fetch(`${API_BASE}/messages/${id}`, { method: "DELETE" });
        if (selected?.id === id) setSelected(null);
        showToast("Message deleted");
        fetchMessages();
    };

    const openMessage = (msg: Message) => {
        setSelected(msg);
        handleMarkRead(msg);
    };

    const filtered = messages.filter((m) => {
        const matchQ = m.name.toLowerCase().includes(searchQ.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQ.toLowerCase()) ||
            m.subject?.toLowerCase().includes(searchQ.toLowerCase());
        const matchFilter = filter === "all" || (filter === "unread" ? m.isRead === 0 : m.isRead === 1);
        return matchQ && matchFilter;
    });

    const formatDate = (d: string) => {
        const dt = new Date(d);
        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
                        <p className="text-slate-500 text-sm mt-0.5">{messages.length} total · {unread} unread</p>
                    </div>
                    {unread > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                            {unread} new
                        </span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total", count: messages.length, icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
                    { label: "Unread", count: unread, icon: AlertCircle, color: "bg-red-50 text-red-600" },
                    { label: "Read", count: messages.length - unread, icon: CheckCheck, color: "bg-emerald-50 text-emerald-600" },
                ].map(({ label, count, icon: Icon, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{count}</p>
                            <p className="text-xs text-slate-400 font-medium">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[600px]">
                {/* Left: Message List */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-100 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search messages..."
                                value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(["all", "unread", "read"] as const).map((f) => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 text-center text-slate-400">Loading...</div>
                        ) : filtered.length === 0 ? (
                            <div className="p-10 text-center">
                                <Mail className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 text-sm">No messages</p>
                            </div>
                        ) : (
                            filtered.map((msg) => (
                                <button key={msg.id} onClick={() => openMessage(msg)}
                                    className={`w-full text-left px-4 py-4 border-b border-slate-50 hover:bg-slate-50 transition-colors group relative ${selected?.id === msg.id ? "bg-emerald-50 border-l-4 border-l-emerald-500" : ""}`}>
                                    {/* Unread indicator */}
                                    {!msg.isRead && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
                                    )}
                                    <div className="ml-2">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate ${!msg.isRead ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
                                                {msg.name}
                                            </p>
                                            <p className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                                                {new Date(msg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            </p>
                                        </div>
                                        <p className="text-xs text-slate-400 truncate">{msg.email}</p>
                                        <p className={`text-xs mt-1 truncate ${!msg.isRead ? "text-slate-700 font-medium" : "text-slate-400"}`}>
                                            {msg.subject || "(No subject)"}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Message Detail */}
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 flex flex-col overflow-hidden">
                    {!selected ? (
                        <div className="flex-1 flex items-center justify-center flex-col text-center p-10">
                            <MessageSquare className="w-14 h-14 text-slate-200 mb-4" />
                            <p className="text-slate-400 font-medium">Select a message to read</p>
                        </div>
                    ) : (
                        <>
                            {/* Detail Header */}
                            <div className="p-6 border-b border-slate-100">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">
                                            {selected.subject || "(No subject)"}
                                        </h3>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                                            <span className="flex items-center space-x-1.5">
                                                <User className="w-4 h-4" /><span className="font-medium text-slate-700">{selected.name}</span>
                                            </span>
                                            <a href={`mailto:${selected.email}`}
                                                className="flex items-center space-x-1.5 hover:text-emerald-600 transition-colors">
                                                <Mail className="w-4 h-4" /><span>{selected.email}</span>
                                            </a>
                                        </div>
                                        <div className="flex items-center space-x-1.5 mt-1 text-xs text-slate-400">
                                            <Clock className="w-3.5 h-3.5" /><span>{formatDate(selected.createdAt)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                                            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-500 transition-all">
                                            <Mail className="w-3.5 h-3.5" /><span>Reply</span>
                                        </a>
                                        <button onClick={() => handleDelete(selected.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Message body */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="bg-slate-50 rounded-2xl p-6">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                                        {selected.message}
                                    </p>
                                </div>

                                {/* Quick Reply */}
                                <div className="mt-6">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Reply via Email</p>
                                    <a href={`mailto:${selected.email}?subject=Re: ${selected.subject || "Your message"}`}
                                        className="flex items-center justify-center space-x-2 w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all">
                                        <Mail className="w-5 h-5" /><span>Open in Email Client</span>
                                    </a>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium">
                        ✅ {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

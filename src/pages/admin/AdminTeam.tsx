import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Pencil, Trash2, X, Save, Users, User, Briefcase, AlignLeft, ArrowUp, ArrowDown } from "lucide-react";
import ImageUpload from "../../components/ImageUpload.tsx";

interface TeamMember {
    id: number;
    name: string;
    role: string;
    bio: string;
    img: string;
    displayOrder: number;
}

const EMPTY: Omit<TeamMember, "id"> = { name: "", role: "", bio: "", img: "", displayOrder: 0 };

export default function AdminTeam() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [form, setForm] = useState<Omit<TeamMember, "id">>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchMembers = async () => {
        setLoading(true);
        const res = await fetch("/api/team");
        const data = await res.json();
        setMembers(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchMembers(); }, []);

    const openCreate = () => {
        setEditingMember(null);
        setForm({ ...EMPTY, displayOrder: members.length + 1 });
        setShowModal(true);
    };

    const openEdit = (m: TeamMember) => {
        setEditingMember(m);
        setForm({ name: m.name, role: m.role, bio: m.bio, img: m.img, displayOrder: m.displayOrder });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.role.trim()) return showToast("Name and role required", "err");
        setSaving(true);
        const method = editingMember ? "PUT" : "POST";
        const url = editingMember ? `/api/team/${editingMember.id}` : "/api/team";
        const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
        if (res.ok) { showToast(editingMember ? "Member updated!" : "Member added!"); setShowModal(false); fetchMembers(); }
        else showToast("Failed", "err");
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Remove this team member?")) return;
        const res = await fetch(`/api/team/${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Member removed"); fetchMembers(); }
        else showToast("Failed", "err");
    };

    const moveOrder = async (member: TeamMember, dir: "up" | "down") => {
        const newOrder = dir === "up" ? member.displayOrder - 1 : member.displayOrder + 1;
        await fetch(`/api/team/${member.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...member, displayOrder: newOrder }),
        });
        fetchMembers();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team Members</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{members.length} members on the About page</p>
                </div>
                <button onClick={openCreate}
                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 active:scale-95 transition-all shadow-md">
                    <Plus className="w-5 h-5" /><span>Add Member</span>
                </button>
            </div>

            {/* Members Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-56 animate-pulse border border-slate-100" />)}
                </div>
            ) : members.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No team members yet</p>
                    <button onClick={openCreate} className="mt-4 text-emerald-600 font-bold hover:underline">Add first member →</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {members.map((m) => (
                        <motion.div key={m.id} layout
                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                        >
                            {/* Photo */}
                            <div className="relative h-40 bg-slate-100 overflow-hidden">
                                {m.img ? (
                                    <img src={m.img} alt={m.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-12 h-12 text-slate-300" />
                                    </div>
                                )}
                                {/* Order controls */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => moveOrder(m, "up")} className="w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center hover:bg-emerald-50 shadow-sm">
                                        <ArrowUp className="w-3 h-3 text-slate-600" />
                                    </button>
                                    <button onClick={() => moveOrder(m, "down")} className="w-6 h-6 bg-white/90 rounded-lg flex items-center justify-center hover:bg-emerald-50 shadow-sm">
                                        <ArrowDown className="w-3 h-3 text-slate-600" />
                                    </button>
                                </div>
                                {/* Order badge */}
                                <div className="absolute top-2 right-2 w-6 h-6 bg-slate-900/70 text-white rounded-lg flex items-center justify-center text-xs font-bold">
                                    {m.displayOrder}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-2">
                                <div>
                                    <p className="font-bold text-slate-900 text-sm leading-tight">{m.name}</p>
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">{m.role}</p>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{m.bio}</p>
                            </div>

                            {/* Actions */}
                            <div className="px-4 pb-4 flex gap-2">
                                <button onClick={() => openEdit(m)}
                                    className="flex-1 flex items-center justify-center space-x-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all">
                                    <Pencil className="w-3.5 h-3.5" /><span>Edit</span>
                                </button>
                                <button onClick={() => handleDelete(m.id)}
                                    className="p-2 rounded-xl border border-slate-200 text-red-400 hover:bg-red-50 hover:border-red-300 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">{editingMember ? "Edit Member" : "Add Team Member"}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <ImageUpload
                                    label="Member Photo"
                                    value={form.img}
                                    onChange={(url) => setForm({ ...form, img: url as string })}
                                />

                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <User className="w-3.5 h-3.5" /><span>Full Name</span>
                                    </label>
                                    <input type="text" placeholder="e.g. Alex Johnson"
                                        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <Briefcase className="w-3.5 h-3.5" /><span>Role / Title</span>
                                    </label>
                                    <input type="text" placeholder="e.g. Head of Design"
                                        value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <AlignLeft className="w-3.5 h-3.5" /><span>Bio</span>
                                    </label>
                                    <textarea rows={3} placeholder="Short biography..."
                                        value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Display Order</label>
                                    <input type="number" min={1}
                                        value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })}
                                        className="w-24 px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-60">
                                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                        <><Save className="w-4 h-4" /><span>{editingMember ? "Save Changes" : "Add Member"}</span></>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium text-white ${toast.type === "ok" ? "bg-emerald-600" : "bg-red-500"}`}>
                        {toast.type === "ok" ? "✅" : "❌"} {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

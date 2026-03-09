import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Plus, Pencil, Trash2, Eye, EyeOff, Search, X, Save, ChevronDown,
    BookOpen, Image, AlignLeft, Tag, User, Clock, Globe, FileText,
} from "lucide-react";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    author: string;
    authorImg: string;
    coverImg: string;
    readTime: string;
    published: number;
    createdAt: string;
}

const CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Accessories", "Lifestyle", "Tips & Tricks"];

const EMPTY_POST: Omit<BlogPost, "id" | "createdAt"> = {
    title: "", slug: "", excerpt: "", content: "", category: "Lifestyle",
    author: "Admin", authorImg: "https://i.pravatar.cc/60?u=admin", coverImg: "",
    readTime: "5 min read", published: 1,
};

// Auto-generate slug from title
function toSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminBlog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQ, setSearchQ] = useState("");
    const [catFilter, setCatFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [form, setForm] = useState<Omit<BlogPost, "id" | "createdAt">>(EMPTY_POST);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchPosts = async () => {
        setLoading(true);
        const res = await fetch("/api/blog/admin/all");
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []);

    const openCreate = () => {
        setEditingPost(null);
        setForm(EMPTY_POST);
        setShowModal(true);
    };

    const openEdit = (post: BlogPost) => {
        setEditingPost(post);
        setForm({
            title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content,
            category: post.category, author: post.author, authorImg: post.authorImg,
            coverImg: post.coverImg, readTime: post.readTime, published: post.published,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title.trim() || !form.slug.trim()) return showToast("Title and slug required", "err");
        setSaving(true);
        const method = editingPost ? "PUT" : "POST";
        const url = editingPost ? `/api/blog/${editingPost.id}` : "/api/blog";
        const res = await fetch(url, {
            method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
        });
        if (res.ok) {
            showToast(editingPost ? "Post updated!" : "Post created!");
            setShowModal(false);
            fetchPosts();
        } else {
            const d = await res.json();
            showToast(d.message || "Failed", "err");
        }
        setSaving(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this post permanently?")) return;
        const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
        if (res.ok) { showToast("Post deleted"); fetchPosts(); }
        else showToast("Failed to delete", "err");
    };

    const handleTogglePublish = async (post: BlogPost) => {
        await fetch(`/api/blog/${post.id}`, {
            method: "PUT", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...post, published: post.published ? 0 : 1 }),
        });
        fetchPosts();
    };

    const filtered = posts.filter((p) => {
        const matchQ = p.title.toLowerCase().includes(searchQ.toLowerCase());
        const matchCat = catFilter === "All" || p.category === catFilter;
        return matchQ && matchCat;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Blog Posts</h1>
                    <p className="text-slate-500 text-sm mt-0.5">{posts.length} total posts</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 active:scale-95 transition-all shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Post</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text" placeholder="Search posts..."
                        value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["All", ...CATEGORIES].map((c) => (
                        <button key={c} onClick={() => setCatFilter(c)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${catFilter === c ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No posts found</p>
                        <button onClick={openCreate} className="mt-4 text-emerald-600 font-bold hover:underline">Create your first post →</button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-400 px-5 py-4">Post</th>
                                    <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-4 hidden md:table-cell">Category</th>
                                    <th className="text-left text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-4 hidden lg:table-cell">Author</th>
                                    <th className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 px-4 py-4">Status</th>
                                    <th className="text-right text-xs font-bold uppercase tracking-widest text-slate-400 px-5 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((post) => (
                                    <tr key={post.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center space-x-3">
                                                {post.coverImg && (
                                                    <img src={post.coverImg} alt={post.title}
                                                        className="w-12 h-10 rounded-lg object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-1">{post.title}</p>
                                                    <p className="text-xs text-slate-400 mt-0.5">/{post.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">{post.category}</span>
                                        </td>
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <div className="flex items-center space-x-2">
                                                <img src={post.authorImg} alt={post.author} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                                                <span className="text-sm text-slate-600">{post.author}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button onClick={() => handleTogglePublish(post)}
                                                className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${post.published ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                                                {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                                <span>{post.published ? "Published" : "Draft"}</span>
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => openEdit(post)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Edit">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(post.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingPost ? "Edit Post" : "Create New Post"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                                {/* Title */}
                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <FileText className="w-3.5 h-3.5" /><span>Title</span>
                                    </label>
                                    <input type="text" placeholder="Post title..."
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value, slug: toSlug(e.target.value) })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <Globe className="w-3.5 h-3.5" /><span>Slug (URL)</span>
                                    </label>
                                    <input type="text" placeholder="post-url-slug"
                                        value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-mono"
                                    />
                                </div>

                                {/* Category + Read Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                            <Tag className="w-3.5 h-3.5" /><span>Category</span>
                                        </label>
                                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm bg-white">
                                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                            <Clock className="w-3.5 h-3.5" /><span>Read Time</span>
                                        </label>
                                        <input type="text" placeholder="5 min read"
                                            value={form.readTime} onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Author + Author Img */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                            <User className="w-3.5 h-3.5" /><span>Author Name</span>
                                        </label>
                                        <input type="text" placeholder="Author name"
                                            value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                            <Image className="w-3.5 h-3.5" /><span>Author Image URL</span>
                                        </label>
                                        <input type="text" placeholder="https://..."
                                            value={form.authorImg} onChange={(e) => setForm({ ...form, authorImg: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Cover Image */}
                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <Image className="w-3.5 h-3.5" /><span>Cover Image URL</span>
                                    </label>
                                    <input type="text" placeholder="https://images.unsplash.com/..."
                                        value={form.coverImg} onChange={(e) => setForm({ ...form, coverImg: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm"
                                    />
                                    {form.coverImg && (
                                        <img src={form.coverImg} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl" referrerPolicy="no-referrer" />
                                    )}
                                </div>

                                {/* Excerpt */}
                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <AlignLeft className="w-3.5 h-3.5" /><span>Excerpt</span>
                                    </label>
                                    <textarea rows={2} placeholder="Short description..."
                                        value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm resize-none"
                                    />
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                                        <FileText className="w-3.5 h-3.5" /><span>Full Content</span>
                                    </label>
                                    <textarea rows={6} placeholder="Full article content..."
                                        value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm resize-none font-mono"
                                    />
                                </div>

                                {/* Publish toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">Published</p>
                                        <p className="text-xs text-slate-500">Visible to public visitors</p>
                                    </div>
                                    <button
                                        onClick={() => setForm({ ...form, published: form.published ? 0 : 1 })}
                                        className={`w-14 h-7 rounded-full transition-all duration-300 relative ${form.published ? "bg-emerald-500" : "bg-slate-200"}`}
                                    >
                                        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${form.published ? "translate-x-8" : "translate-x-1"}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
                                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-60">
                                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> :
                                        <><Save className="w-4 h-4" /><span>{editingPost ? "Save Changes" : "Publish Post"}</span></>}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
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

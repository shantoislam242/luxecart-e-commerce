import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
    ChevronRight, Clock, Tag, ArrowRight, Search, TrendingUp,
    Bookmark, Share2, User,
} from "lucide-react";

const BLOG_POSTS = [
    {
        id: 1,
        title: "10 Must-Have Gadgets for a Smart Home in 2026",
        excerpt: "From voice assistants to smart lighting — we breakdown the top tech products that will transform your living space this year.",
        category: "Electronics",
        categoryColor: "bg-blue-100 text-blue-700",
        author: "Marcus Reid",
        authorImg: "https://i.pravatar.cc/60?u=marcus-r",
        date: "March 5, 2026",
        readTime: "6 min read",
        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=70&w=600&fm=webp",
        featured: true,
    },
    {
        id: 2,
        title: "Spring Fashion Trends: What to Wear This Season",
        excerpt: "Our fashion editors handpicked the key pieces every wardrobe needs — from minimalist staples to bold statement looks.",
        category: "Fashion",
        categoryColor: "bg-pink-100 text-pink-700",
        author: "Sarah Chen",
        authorImg: "https://i.pravatar.cc/60?u=sarah-c",
        date: "March 1, 2026",
        readTime: "5 min read",
        img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=70&w=600&fm=webp",
        featured: false,
    },
    {
        id: 3,
        title: "How to Build a Luxurious Living Room on a Budget",
        excerpt: "You don't need to spend a fortune to achieve a premium-looking home. These tips will elevate any space without breaking the bank.",
        category: "Home & Living",
        categoryColor: "bg-emerald-100 text-emerald-700",
        author: "Priya Patel",
        authorImg: "https://i.pravatar.cc/60?u=priya-p",
        date: "Feb 24, 2026",
        readTime: "8 min read",
        img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=70&w=600&fm=webp",
        featured: false,
    },
    {
        id: 4,
        title: "The Ultimate Watch Buying Guide for 2026",
        excerpt: "From Swiss mechanical masterpieces to sleek smartwatches — everything you need to know before adding a timepiece to your collection.",
        category: "Accessories",
        categoryColor: "bg-amber-100 text-amber-700",
        author: "Alex Johnson",
        authorImg: "https://i.pravatar.cc/60?u=alex-j",
        date: "Feb 18, 2026",
        readTime: "10 min read",
        img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=70&w=600&fm=webp",
        featured: false,
    },
    {
        id: 5,
        title: "Why Premium Quality Always Beats Fast Fashion",
        excerpt: "Buying cheap often costs more in the long run. Here's why investing in quality products saves you money, time, and the planet.",
        category: "Lifestyle",
        categoryColor: "bg-violet-100 text-violet-700",
        author: "Sarah Chen",
        authorImg: "https://i.pravatar.cc/60?u=sarah-c",
        date: "Feb 10, 2026",
        readTime: "7 min read",
        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=70&w=600&fm=webp",
        featured: false,
    },
    {
        id: 6,
        title: "Top 5 Wireless Headphones for Every Budget",
        excerpt: "Whether you're a bass lover, a podcast listener, or a gamer — we've found the perfect audio companion for you.",
        category: "Electronics",
        categoryColor: "bg-blue-100 text-blue-700",
        author: "Marcus Reid",
        authorImg: "https://i.pravatar.cc/60?u=marcus-r",
        date: "Feb 2, 2026",
        readTime: "5 min read",
        img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=70&w=600&fm=webp",
        featured: false,
    },
];

const CATEGORIES = ["All", "Electronics", "Fashion", "Home & Living", "Accessories", "Lifestyle"];

export default function BlogPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQ, setSearchQ] = useState("");

    const featured = BLOG_POSTS.find((p) => p.featured);
    const filtered = BLOG_POSTS.filter((p) => {
        const matchCat = activeCategory === "All" || p.category === activeCategory;
        const matchSearch = p.title.toLowerCase().includes(searchQ.toLowerCase()) ||
            p.excerpt.toLowerCase().includes(searchQ.toLowerCase());
        return matchCat && matchSearch && !p.featured;
    });

    return (
        <div className="space-y-0 pb-20 -mt-8">
            {/* ── Hero ── */}
            <section className="relative h-[480px] md:h-[560px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=70&w=1400&fm=webp"
                    alt="Blog"
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 md:px-16 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white font-medium">Blog</span>
                        </div>
                        <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>Latest Articles</span>
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                            Blog
                        </h1>
                        <p className="text-violet-300 text-2xl font-semibold italic font-serif">
                            Style, Tech & Lifestyle Insights
                        </p>
                        <p className="text-white/80 text-lg max-w-xl leading-relaxed">
                            Tips, trends, and expert guides to help you shop smarter and live better.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ── Featured Post ── */}
            {featured && (
                <section className="container mx-auto px-4 pt-16">
                    <div className="flex items-center space-x-2 mb-8">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Featured Post</span>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                    >
                        <div className="relative overflow-hidden h-64 lg:h-auto min-h-[320px]">
                            <img
                                src={featured.img}
                                alt={featured.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>
                        <div className="p-10 lg:p-14 flex flex-col justify-center space-y-5">
                            <span className={`inline-block w-fit px-3 py-1 rounded-full text-xs font-bold ${featured.categoryColor}`}>
                                {featured.category}
                            </span>
                            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                                {featured.title}
                            </h2>
                            <p className="text-slate-500 leading-relaxed">{featured.excerpt}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <img src={featured.authorImg} alt={featured.author} className="w-9 h-9 rounded-full object-cover" referrerPolicy="no-referrer" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{featured.author}</p>
                                        <p className="text-xs text-slate-400">{featured.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 text-slate-400 text-xs">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{featured.readTime}</span>
                                </div>
                            </div>
                            <button className="self-start inline-flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-500 active:scale-95 transition-all">
                                <span>Read Article</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* ── Filters & Search ── */}
            <section className="container mx-auto px-4 pt-14">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-10">
                    {/* Category filter */}
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${activeCategory === cat
                                        ? "bg-emerald-600 text-white shadow-md"
                                        : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all w-64"
                        />
                    </div>
                </div>

                {/* Posts Grid */}
                {filtered.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No articles found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filtered.map((post, idx) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.07 }}
                                className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow cursor-pointer"
                            >
                                <div className="relative overflow-hidden h-52">
                                    <img
                                        src={post.img}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        referrerPolicy="no-referrer"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${post.categoryColor}`}>
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 space-y-3">
                                    <h3 className="font-bold text-slate-900 text-lg leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center space-x-2">
                                            <img src={post.authorImg} alt={post.author} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                                            <p className="text-xs font-medium text-slate-600">{post.author}</p>
                                        </div>
                                        <div className="flex items-center space-x-1 text-slate-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{post.readTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

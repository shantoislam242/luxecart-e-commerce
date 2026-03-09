import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "motion/react";
import {
    Smartphone, ShoppingBag, Home as HomeIcon, Watch,
    SlidersHorizontal, ChevronRight, ShoppingCart, ArrowRight
} from "lucide-react";
import ProductCard from "../components/ProductCard.tsx";
import { useCart } from "../context/CartContext.tsx";
import { API_BASE } from "../api/api.ts";

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORIES: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<any>;
    gradient: string;
    heroBg: string;
    accentColor: string;
    badge: string;
}> = {
    electronics: {
        title: "Electronics",
        subtitle: "Power Up Your World",
        description: "The latest gadgets, smart devices, and cutting-edge tech — hand-picked for performance, design, and value.",
        icon: Smartphone,
        gradient: "from-blue-900 via-indigo-900 to-slate-900",
        heroBg: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=70&w=1400&fm=webp",
        accentColor: "text-blue-400",
        badge: "New Arrivals",
    },
    fashion: {
        title: "Fashion",
        subtitle: "Define Your Style",
        description: "Premium fashion and apparel that speaks to your personality — timeless pieces for the modern individual.",
        icon: ShoppingBag,
        gradient: "from-pink-900 via-rose-900 to-slate-900",
        heroBg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=70&w=1400&fm=webp",
        accentColor: "text-pink-400",
        badge: "Trending Now",
    },
    "home-living": {
        title: "Home & Living",
        subtitle: "Transform Your Space",
        description: "Curated home décor, furniture, and lifestyle products to make every corner of your home beautiful.",
        icon: HomeIcon,
        gradient: "from-emerald-900 via-teal-900 to-slate-900",
        heroBg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=70&w=1400&fm=webp",
        accentColor: "text-emerald-400",
        badge: "Editor's Pick",
    },
    accessories: {
        title: "Accessories",
        subtitle: "Complete Your Look",
        description: "From watches to bags, discover premium accessories that elevate every outfit and every occasion.",
        icon: Watch,
        gradient: "from-amber-900 via-orange-900 to-slate-900",
        heroBg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=70&w=1400&fm=webp",
        accentColor: "text-amber-400",
        badge: "Best Sellers",
    },
};

// Map URL slug → DB category string
const SLUG_TO_DB: Record<string, string> = {
    electronics: "Electronics",
    fashion: "Fashion",
    "home-living": "Home & Living",
    accessories: "Accessories",
};

export default function CategoryPage() {
    const { slug } = useParams<{ slug: string }>();
    const config = slug ? CATEGORIES[slug] : null;
    const dbCategory = slug ? SLUG_TO_DB[slug] : null;

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const fetchProducts = useCallback(async (isLoadMore = false, signal?: AbortSignal) => {
        if (!dbCategory) return;
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        try {
            const currentPage = isLoadMore ? page + 1 : 1;
            const res = await fetch(
                `${API_BASE}/products?category=${encodeURIComponent(dbCategory)}&page=${currentPage}&limit=12`,
                { signal }
            );
            const data = await res.json();
            if (isLoadMore) {
                setProducts((prev) => [...prev, ...data.products]);
                setPage(currentPage);
            } else {
                setProducts(data.products);
                setPage(1);
            }
            setTotalPages(data.totalPages);
        } catch (err: any) {
            if (err?.name !== "AbortError") console.error(err);
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setLoadingMore(false);
            }
        }
    }, [dbCategory, page]);

    useEffect(() => {
        const ctrl = new AbortController();
        setProducts([]);
        fetchProducts(false, ctrl.signal);
        return () => ctrl.abort();
    }, [dbCategory]);

    // 404-like fallback
    if (!config || !dbCategory) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-5xl">🔍</p>
                <h2 className="text-2xl font-bold text-slate-800">Category not found</h2>
                <Link to="/" className="text-emerald-600 font-semibold hover:underline">← Back to Home</Link>
            </div>
        );
    }

    const Icon = config.icon;

    return (
        <div className="space-y-0 pb-20 -mt-8">
            {/* ── Hero ── */}
            <section className="relative h-[480px] md:h-[560px] overflow-hidden">
                {/* Background */}
                <img
                    src={config.heroBg}
                    alt={config.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-80`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 md:px-16 max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        {/* Breadcrumb */}
                        <div className="flex items-center space-x-2 text-white/60 text-sm">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-white font-medium">{config.title}</span>
                        </div>

                        {/* Badge */}
                        <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm ${config.accentColor} text-xs font-bold uppercase tracking-widest`}>
                            <Icon className="w-3.5 h-3.5" />
                            <span>{config.badge}</span>
                        </span>

                        {/* Title */}
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                            {config.title}
                        </h1>
                        <p className={`text-2xl md:text-3xl font-semibold italic font-serif ${config.accentColor}`}>
                            {config.subtitle}
                        </p>
                        <p className="text-white/80 text-lg max-w-xl leading-relaxed">
                            {config.description}
                        </p>
                    </motion.div>
                </div>

                {/* Product count pill */}
                {!loading && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="absolute top-8 right-8 bg-white/15 backdrop-blur-md border border-white/25 text-white px-5 py-3 rounded-2xl text-sm font-bold"
                    >
                        <SlidersHorizontal className="w-4 h-4 inline mr-2 opacity-70" />
                        {products.length > 0 ? `${products.length} Products` : "Exploring..."}
                    </motion.div>
                )}
            </section>

            {/* ── Products Grid ── */}
            <section className="container mx-auto px-4 pt-14">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {config.title} Collection
                        </h2>
                        <p className="text-slate-500 mt-1 text-sm">
                            {loading ? "Loading..." : `${products.length} items found`}
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="flex items-center space-x-1 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                    >
                        <span>All Products</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-[32px] h-[420px] animate-pulse border border-slate-100" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <ShoppingCart className="w-14 h-14 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium text-lg">No products in this category yet.</p>
                        <p className="text-slate-300 text-sm mt-2">Check back soon — new items are added daily!</p>
                        <Link to="/" className="mt-6 inline-block text-emerald-600 font-bold hover:underline">
                            ← Browse All Products
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {products.map((product: any, idx: number) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: Math.min(idx, 7) * 0.05 }}
                                >
                                    <ProductCard product={product} onAddToCart={showToast} />
                                </motion.div>
                            ))}
                        </div>

                        {page < totalPages && (
                            <div className="text-center mt-12">
                                <button
                                    disabled={loadingMore}
                                    onClick={() => fetchProducts(true)}
                                    className="inline-flex items-center space-x-2 border-2 border-slate-200 text-slate-700 px-8 py-3 rounded-2xl font-bold hover:border-emerald-500 hover:text-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loadingMore ? (
                                        <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Load More</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl text-sm font-medium animate-fade-in">
                    ✅ {toast}
                </div>
            )}
        </div>
    );
}

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { API_BASE } from "../api/api.ts";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard.tsx";
import {
  Filter,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Smartphone,
  Watch,
  Home as HomeIcon,
  ShoppingBag,
  Mail,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Heart,
  X,
  Tag,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ── Data ──────────────────────────────────────────────────────────────────────

const heroSlides = [
  {
    id: 1,
    badge: "Summer Collection 2026",
    title: "Elevate Your",
    accent: "Lifestyle",
    description:
      "Discover our curated collection of premium products designed for the modern individual who values quality and style.",
    cta: "Shop Collection",
    ctaLink: "/?category=",
    secondary: "Explore Deals",
    secondaryLink: "#flash-sale",
    bg: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=70&w=1200&fm=webp",
  },
  {
    id: 2,
    badge: "New Tech Arrivals",
    title: "Power Up Your",
    accent: "World",
    description:
      "The latest gadgets and electronics hand-picked for performance, design, and value.",
    cta: "Shop Electronics",
    ctaLink: "/?category=Electronics",
    secondary: "View Deals",
    secondaryLink: "#flash-sale",
    bg: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=70&w=1200&fm=webp",
  },
  {
    id: 3,
    badge: "Fashion Forward",
    title: "Define Your",
    accent: "Style",
    description:
      "Premium fashion and accessories that speak to your personality and stand the test of time.",
    cta: "Shop Fashion",
    ctaLink: "/?category=Fashion",
    secondary: "Browse All",
    secondaryLink: "/?category=",
    bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=70&w=1200&fm=webp",
  },
];

const categories = [
  {
    name: "Electronics",
    icon: Smartphone,
    color: "from-blue-500 to-indigo-600",
    bg: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=400",
    count: "120+ products",
  },
  {
    name: "Fashion",
    icon: ShoppingBag,
    color: "from-pink-500 to-rose-600",
    bg: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400",
    count: "200+ products",
  },
  {
    name: "Home & Living",
    icon: HomeIcon,
    color: "from-emerald-500 to-teal-600",
    bg: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400",
    count: "80+ products",
  },
  {
    name: "Accessories",
    icon: Watch,
    color: "from-amber-500 to-orange-600",
    bg: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400",
    count: "150+ products",
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Verified Buyer",
    content:
      "The quality of the products exceeded my expectations. Fast delivery and excellent customer support!",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "Michael Chen",
    role: "Tech Enthusiast",
    content:
      "LuxeCart is my go-to for all things tech. Their curated selection is unmatched in the market.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
  {
    name: "Emma Wilson",
    role: "Fashion Blogger",
    content:
      "Absolutely love the fashion collection. The styles are trendy and the fit is always perfect.",
    rating: 4,
    avatar: "https://i.pravatar.cc/150?u=emma",
  },
  {
    name: "James Rodriguez",
    role: "Frequent Shopper",
    content:
      "Best online shopping experience I've had. The packaging is premium and everything arrived in perfect condition.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=james",
  },
  {
    name: "Aisha Patel",
    role: "Interior Designer",
    content:
      "The home & living collection is stunning. I've recommended LuxeCart to all my clients.",
    rating: 5,
    avatar: "https://i.pravatar.cc/150?u=aisha",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = Math.max(0, targetDate.getTime() - Date.now());
    return {
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl text-white text-center min-w-[72px]">
      <span className="block text-2xl font-bold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[10px] uppercase font-bold opacity-70">{label}</span>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl"
    >
      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const navigate = useNavigate();

  // Hero carousel
  const [slideIndex, setSlideIndex] = useState(0);
  const slideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Testimonial slider
  const [testIndex, setTestIndex] = useState(0);

  // Newsletter
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<"idle" | "success" | "error">("idle");

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => setToast(msg), []);

  // Flash sale target: 12 h from page load
  const saleEnd = useRef(new Date(Date.now() + 12 * 3600 * 1000));
  const countdown = useCountdown(saleEnd.current);

  // Sync category from URL
  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setPage(1); // Reset to first page
    setProducts([]); // Clear list for new filter
  }, [searchParams]);

  // Fetch products — uses AbortController so switching filters cancels the old request
  const fetchProducts = useCallback(async (isLoadMore = false, signal?: AbortSignal) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const res = await fetch(
        `${API_BASE}/products?keyword=${keyword}&category=${category}&page=${currentPage}&limit=12`,
        { signal }
      );
      if (!res.ok) throw new Error("Network response was not ok");
      const data = await res.json();

      if (isLoadMore) {
        setProducts((prev) => [...prev, ...data.products]);
        setPage(currentPage);
      } else {
        setProducts(data.products);
        setPage(1);
      }
      setTotalPages(data.totalPages);
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error("Error fetching products:", error);
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [keyword, category, page]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(false, controller.signal);
    return () => controller.abort(); // cancel if filter changes before response
  }, [keyword, category]); // only on filter change. loadMore manual toggle.


  // Auto-advance hero slides every 5 s
  const nextSlide = useCallback(
    () => setSlideIndex((i) => (i + 1) % heroSlides.length),
    []
  );
  const prevSlide = () =>
    setSlideIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);

  useEffect(() => {
    slideTimer.current = setInterval(nextSlide, 5000);
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [nextSlide]);

  const goToSlide = (i: number) => {
    setSlideIndex(i);
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = setInterval(nextSlide, 5000);
  };

  // Hero CTA navigation (handles both internal routes and anchor scrolls)
  const handleHeroCta = (link: string, isSecondary = false) => {
    if (link.startsWith("#")) {
      const el = document.querySelector(link);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(link);
    }
  };

  // Category click → navigate to filtered home
  const handleCategory = (name: string) => {
    const newCat = category === name ? "" : name;
    setCategory(newCat);
    navigate(newCat ? `/?category=${newCat}` : "/");
  };

  // Newsletter submit
  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setNewsletterState("error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewsletterState("success");
        setEmail("");
        showToast(data.message || "🎉 You're subscribed! Watch your inbox for exclusive deals.");
      } else {
        setNewsletterState("error");
        showToast(data.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter error:", error);
      setNewsletterState("error");
      showToast("Connection failed. Please check your internet.");
    }
  };

  // Testimonial navigation
  const nextTest = () => setTestIndex((i) => (i + 1) % testimonials.length);
  const prevTest = () =>
    setTestIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  const visibleTests = [0, 1, 2].map(
    (offset) => testimonials[(testIndex + offset) % testimonials.length]
  );

  // Stable shuffle — only recomputed when products list changes, never on re-render
  const recommendedProducts = useMemo(() => {
    if (products.length === 0) return [];
    const shuffled = [...products];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [products]); // ← depends only on products, not every render

  const slide = heroSlides[slideIndex];

  return (
    <div className="space-y-20 pb-20">
      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── 1. Hero Carousel ── */}
      {!keyword && (
        <section className="relative h-[520px] md:h-[620px] rounded-[40px] overflow-hidden bg-slate-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img
                src={slide.bg}
                className="w-full h-full object-cover opacity-55"
                referrerPolicy="no-referrer"
                alt="Hero Banner"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/50 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-2xl space-y-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-5"
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
                  {slide.badge}
                </span>
                <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
                  {slide.title} <br />
                  <span className="text-emerald-400 italic font-serif">
                    {slide.accent}
                  </span>
                </h1>
                <p className="text-slate-300 text-lg md:text-xl max-w-md leading-relaxed">
                  {slide.description}
                </p>
                <div className="flex flex-wrap gap-4 pt-1">
                  <button
                    onClick={() => handleHeroCta(slide.ctaLink)}
                    className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/25 flex items-center space-x-2 group"
                  >
                    <span>{slide.cta}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => handleHeroCta(slide.secondaryLink, true)}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/25 px-8 py-4 rounded-2xl font-bold hover:bg-white/20 active:scale-95 transition-all"
                  >
                    {slide.secondary}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dot navigation */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === slideIndex
                  ? "w-8 bg-emerald-400"
                  : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrow navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Previous slide"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Next slide"
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Slide counter */}
          <div className="absolute top-6 right-6 z-20 text-white/60 text-sm font-mono">
            {String(slideIndex + 1).padStart(2, "0")} /{" "}
            {String(heroSlides.length).padStart(2, "0")}
          </div>
        </section>
      )}

      {/* ── 2. Trust ticker ── */}
      {!keyword && (
        <div className="overflow-hidden bg-emerald-600 py-3 rounded-2xl">
          <div className="flex whitespace-nowrap animate-ticker">
            {[...Array(2)].map((_, di) => (
              <div key={di} className="flex items-center space-x-12 px-8">
                {[
                  "Free Shipping Over $100",
                  "30-Day Easy Returns",
                  "Secure Payments",
                  "24/7 Customer Support",
                  "Exclusive Member Deals",
                  "Premium Quality Guaranteed",
                ].map((item) => (
                  <span
                    key={item}
                    className="text-white text-sm font-semibold flex items-center space-x-2"
                  >
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full inline-block" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Categories ── */}
      {!keyword && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Browse Categories
              </h2>
              <p className="text-slate-500 mt-2">
                Find exactly what you're looking for
              </p>
            </div>
            <button
              onClick={() => handleCategory("")}
              className="text-emerald-600 font-bold flex items-center space-x-1 hover:underline"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const isActive = category === cat.name;
              return (
                <motion.button
                  key={cat.name}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleCategory(cat.name)}
                  className={`relative rounded-3xl overflow-hidden aspect-[4/3] group transition-all ${isActive ? "ring-4 ring-emerald-500 ring-offset-2" : ""
                    }`}
                >
                  <img
                    src={cat.bg}
                    alt={cat.name}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70 group-hover:opacity-80 transition-opacity`}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2 p-4">
                    <cat.icon className="w-8 h-8 drop-shadow-lg" />
                    <span className="font-bold text-lg drop-shadow-lg">
                      {cat.name}
                    </span>
                    <span className="text-xs font-medium opacity-80">
                      {cat.count}
                    </span>
                  </div>
                  {isActive && (
                    <div className="absolute top-3 right-3 bg-white rounded-full p-0.5">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── 4. Flash Sale ── */}
      {!keyword && (
        <section id="flash-sale" className="container mx-auto px-4">
          <div className="bg-amber-500 rounded-[40px] p-8 md:p-16 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6 text-center md:text-left max-w-xl">
              <div className="inline-flex items-center space-x-2 bg-black/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                <Zap className="w-4 h-4 fill-current" />
                <span>Flash Sale Ending Soon</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Get Up To{" "}
                <span className="text-black italic">60% Off</span> <br />
                On Premium Tech
              </h2>
              <p className="text-amber-50 font-medium text-lg">
                Limited time offer. Don't miss out on the best deals of the
                season.
              </p>

              {/* Live countdown */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <CountdownBlock value={countdown.hours} label="Hours" />
                <CountdownBlock value={countdown.minutes} label="Mins" />
                <CountdownBlock value={countdown.seconds} label="Secs" />
              </div>

              <button
                onClick={() => handleCategory("Electronics")}
                className="inline-flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-xl mt-2"
              >
                <Tag className="w-5 h-5" />
                <span>Shop the Sale</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=75&w=500&fm=webp"
                alt="Flash Sale Product"
                width={500}
                height={375}
                loading="lazy"
                decoding="async"
                className="w-full max-w-md rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer"
                referrerPolicy="no-referrer"
                onClick={() => handleCategory("Electronics")}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── 5. Featured Products ── */}
      <section className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {keyword ? `Results for "${keyword}"` : "Featured Products"}
            </h2>
            <p className="text-slate-500 mt-2">Handpicked items just for you</p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <div className="flex items-center space-x-2 text-slate-400 text-sm bg-white px-4 py-2 rounded-xl border border-slate-100">
              <SlidersHorizontal className="w-4 h-4" />
              <span>{products.length} Items</span>
            </div>
            {!keyword &&
              ["All", ...categories.map((c) => c.name)].map((name) => (
                <button
                  key={name}
                  onClick={() => handleCategory(name === "All" ? "" : name)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${(name === "All" && category === "") ||
                    category === name
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                    }`}
                >
                  {name}
                </button>
              ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-[32px] h-[420px] shimmer border border-slate-100"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product: any) => (
                <div key={product.id} className="animate-fadeIn">
                  <ProductCard product={product} onAddToCart={showToast} />
                </div>
              ))}
            </div>

            {/* Load More */}
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
        ) : (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
            <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">
              No products found matching your criteria.
            </p>
            <button
              onClick={() => {
                setCategory("");
                navigate("/");
              }}
              className="mt-4 text-emerald-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </section>

      {/* ── 6. Recommended for You ── */}
      {!keyword && products.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  Personalized
                </span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Recommended for You
              </h2>
              <p className="text-slate-500 mt-1">Based on trending items</p>
            </div>
            <button
              onClick={() => navigate("/?category=")}
              className="text-emerald-600 font-bold flex items-center space-x-1 hover:underline"
            >
              <span>See All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {recommendedProducts.map((product: any) => (
              <div key={`rec-${product.id}`} className="animate-fadeIn">
                <ProductCard product={product} onAddToCart={showToast} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. Trust Badges ── */}
      <section className="bg-white border-y border-slate-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                Icon: Truck,
                color: "bg-emerald-50 text-emerald-600",
                title: "Free Shipping",
                desc: "On all orders over $100.00",
                action: () => navigate("/cart"),
                actionLabel: "View Cart",
              },
              {
                Icon: ShieldCheck,
                color: "bg-blue-50 text-blue-600",
                title: "Secure Payment",
                desc: "100% secure payment processing",
                action: () => navigate("/checkout"),
                actionLabel: "Checkout",
              },
              {
                Icon: RotateCcw,
                color: "bg-violet-50 text-violet-600",
                title: "Easy Returns",
                desc: "30-day money back guarantee",
                action: () => navigate("/profile"),
                actionLabel: "My Orders",
              },
            ].map(({ Icon, color, title, desc, action, actionLabel }) => (
              <div
                key={title}
                className="flex items-center space-x-6 group cursor-pointer"
                onClick={action}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {title}
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">{desc}</p>
                  <span className="text-xs text-emerald-600 font-bold mt-1 inline-flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>{actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Testimonials Slider ── */}
      {!keyword && (
        <section className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div className="text-center md:text-left max-w-2xl space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                What Our Customers Say
              </h2>
              <p className="text-slate-500">
                Don't just take our word for it — hear from our happy shoppers.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={prevTest}
                className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-90"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextTest}
                className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-emerald-500 hover:text-emerald-600 transition-all active:scale-90"
                aria-label="Next testimonial"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {visibleTests.map((t, idx) => (
              <motion.div
                key={`${t.name}-${testIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6"
              >
                <div className="flex items-center space-x-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? "fill-current" : "text-slate-200"
                        }`}
                    />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "{t.content}"
                </p>
                <div className="flex items-center space-x-4 pt-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full border-2 border-emerald-100 object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {t.name}
                    </h4>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dot dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestIndex(i)}
                className={`h-2 rounded-full transition-all ${i === testIndex
                  ? "w-6 bg-emerald-500"
                  : "w-2 bg-slate-200 hover:bg-slate-300"
                  }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── 9. Newsletter ── */}
      {!keyword && (
        <section className="container mx-auto px-4">
          <div className="bg-slate-900 rounded-[40px] p-8 md:p-20 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full" />
              <div className="absolute bottom-10 right-10 w-64 h-64 border-4 border-white rounded-full" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                Join Our Newsletter
              </h2>
              <p className="text-slate-400 text-lg">
                Subscribe to get special offers, free giveaways, and
                once-in-a-lifetime deals.
              </p>

              <AnimatePresence mode="wait">
                {newsletterState === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center space-x-3 text-emerald-400 text-lg font-bold py-4"
                  >
                    <CheckCircle className="w-7 h-7" />
                    <span>You're in! Welcome to the LuxeCart family.</span>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleNewsletter}
                    className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4"
                  >
                    <div className="flex-1 relative">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setNewsletterState("idle");
                        }}
                        className={`w-full px-6 py-4 bg-white/10 border rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500 ${newsletterState === "error"
                          ? "border-red-400 ring-2 ring-red-400/30"
                          : "border-white/20"
                          }`}
                      />
                      {newsletterState === "error" && (
                        <p className="absolute -bottom-5 left-2 text-red-400 text-xs font-medium">
                          Please enter a valid email address.
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Subscribe
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>

              <p className="text-slate-500 text-xs">
                By subscribing, you agree to our{" "}
                <button
                  onClick={() =>
                    showToast("Terms of Service — currently being drafted.")
                  }
                  className="underline hover:text-slate-300 transition-colors"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  onClick={() =>
                    showToast("Privacy Policy — currently being drafted.")
                  }
                  className="underline hover:text-slate-300 transition-colors"
                >
                  Privacy Policy
                </button>
                .
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

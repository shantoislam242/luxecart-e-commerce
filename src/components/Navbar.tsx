import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Search,
  Menu,
  X,
  Shield,
  Smartphone,
  Watch,
  Home as HomeIcon,
  ShoppingBag,
  ChevronDown,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { useCart } from "../context/CartContext.tsx";
import { motion, AnimatePresence } from "motion/react";

const NAV_CATEGORIES = [
  { name: "Electronics", icon: Smartphone, color: "text-blue-600 bg-blue-50", href: "/?category=Electronics" },
  { name: "Fashion", icon: ShoppingBag, color: "text-pink-600 bg-pink-50", href: "/?category=Fashion" },
  { name: "Home & Living", icon: HomeIcon, color: "text-emerald-600 bg-emerald-50", href: "/?category=Home+%26+Living" },
  { name: "Accessories", icon: Watch, color: "text-amber-600 bg-amber-50", href: "/?category=Accessories" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevCart, setPrevCart] = useState(totalItems);
  const [cartBounce, setCartBounce] = useState(false);
  const navigate = useNavigate();
  const catRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Sticky navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bounce cart icon on item added
  useEffect(() => {
    if (totalItems > prevCart) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
    setPrevCart(totalItems);
  }, [totalItems]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-100"
          : "bg-white border-b border-slate-200"
        }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-slate-900 flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          LUXE<span className="text-emerald-600">CART</span>
        </Link>

        {/* Desktop search — expands on focus */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex flex-1 max-w-md mx-4 relative group"
        >
          <input
            ref={searchRef}
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-2 border-transparent rounded-full focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Center nav links */}
        <div className="hidden xl:flex items-center space-x-6 mr-2">
          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatOpen((v) => !v)}
              className="flex items-center space-x-1 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <span>Categories</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-3 z-50"
                >
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 pb-2">
                    Shop by Category
                  </p>
                  {NAV_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.name}
                      to={cat.href}
                      onClick={() => setCatOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                        <cat.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600">
                        {cat.name}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-300 ml-auto group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <Link
                      to="/?category="
                      onClick={() => setCatOpen(false)}
                      className="flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm transition-colors"
                    >
                      <Zap className="w-4 h-4" />
                      <span>View All Products</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/?category=Electronics"
            className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Electronics
          </Link>
          <Link
            to="/?category=Fashion"
            className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Fashion
          </Link>
          <Link
            to="/?category=Accessories"
            className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Accessories
          </Link>
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Mobile search trigger */}
          <button
            className="lg:hidden p-2 text-slate-500 hover:text-emerald-600 transition-colors"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-slate-600 hover:text-emerald-600 transition-colors">
            <motion.div animate={cartBounce ? { scale: [1, 1.3, 1] } : {}}>
              <ShoppingCart className="w-6 h-6" />
            </motion.div>
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  key="badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* User menu */}
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </div>
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="text-xs font-bold uppercase tracking-wider bg-emerald-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors active:scale-90"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm font-bold bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-emerald-600 active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-emerald-600 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isMenuOpen ? "x" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Expanded search bar (tablet) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-t border-slate-100 px-4 overflow-hidden"
          >
            <form onSubmit={handleSearch} className="relative py-3">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-full outline-none focus:ring-2 focus:ring-emerald-400 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-3.5 top-5 text-slate-400 w-4 h-4" />
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-1">
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 rounded-xl outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
              </form>

              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-2 pb-1">
                Categories
              </p>
              {NAV_CATEGORIES.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                </Link>
              ))}

              <div className="border-t border-slate-100 my-2 pt-2 space-y-1">
                <Link
                  to="/cart"
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">
                    Cart {totalItems > 0 && `(${totalItems})`}
                  </span>
                </Link>
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {user.name || "Profile"}
                      </span>
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-emerald-700 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        <span className="text-sm font-medium">Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-emerald-400 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-emerald-600 transition-all"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Footer() {
  const navigate = useNavigate();
  const [showTop, setShowTop] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [footerSub, setFooterSub] = useState(false);

  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleFooterNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes("@")) {
      setFooterSub(true);
      setNewsletterEmail("");
    }
  };

  return (
    <>
      {/* Back to top */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 active:scale-90 transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-6">
              <Link to="/" className="text-2xl font-bold tracking-tight text-slate-900 block">
                LUXE<span className="text-emerald-600">CART</span>
              </Link>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                Premium shopping experience for the modern lifestyle. Quality curated products
                delivered to your door with care and precision.
              </p>
              <div className="flex items-center space-x-3">
                {[
                  { Icon: Facebook, href: "https://facebook.com", label: "Facebook" },
                  { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                  { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                  { Icon: Youtube, href: "https://youtube.com", label: "YouTube" },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110 active:scale-90 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* Mini newsletter */}
              {!footerSub ? (
                <form onSubmit={handleFooterNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 active:scale-95 transition-all"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <p className="text-emerald-600 text-sm font-semibold flex items-center space-x-2">
                  <span>✓</span>
                  <span>You're subscribed!</span>
                </p>
              )}
            </div>

            {/* Shop Categories */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">
                Shop Categories
              </h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  { label: "Electronics & Gadgets", cat: "Electronics" },
                  { label: "Fashion & Apparel", cat: "Fashion" },
                  { label: "Home & Interior", cat: "Home & Living" },
                  { label: "Premium Accessories", cat: "Accessories" },
                  { label: "New Arrivals", cat: "" },
                ].map(({ label, cat }) => (
                  <li key={label}>
                    <button
                      onClick={() =>
                        navigate(cat ? `/?category=${encodeURIComponent(cat)}` : "/")
                      }
                      className="hover:text-emerald-600 transition-colors text-left hover:translate-x-0.5 transform transition-transform"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">
                Customer Service
              </h4>
              <ul className="space-y-3 text-sm text-slate-500">
                {[
                  { label: "Help Center", route: null },
                  { label: "Track Your Order", route: "/profile" },
                  { label: "Shipping & Delivery", route: null },
                  { label: "Returns & Refunds", route: null },
                  { label: "Privacy Policy", route: null },
                  { label: "Terms of Service", route: null },
                ].map(({ label, route }) => (
                  <li key={label}>
                    {route ? (
                      <Link
                        to={route}
                        className="hover:text-emerald-600 transition-colors inline-flex items-center space-x-1 group"
                      >
                        <span>{label}</span>
                        <ArrowUp className="w-3 h-3 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ) : (
                      <button
                        onClick={() =>
                          alert(`${label} — coming soon!`)
                        }
                        className="hover:text-emerald-600 transition-colors text-left"
                      >
                        {label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">
                Contact Info
              </h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>123 Commerce Way, Suite 100, Digital City, DC 12345</span>
                </li>
                <li>
                  <a
                    href="tel:+15551234567"
                    className="flex items-center space-x-3 hover:text-emerald-600 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>+1 (555) 123-4567</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@luxecart.com"
                    className="flex items-center space-x-3 hover:text-emerald-600 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>support@luxecart.com</span>
                  </a>
                </li>
              </ul>

              {/* Quick links */}
              <div className="mt-6 space-y-2">
                <Link
                  to="/cart"
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium text-slate-600 transition-all"
                >
                  <span>My Cart</span>
                  <ArrowUp className="w-3 h-3 rotate-90" />
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-sm font-medium text-slate-600 transition-all"
                >
                  <span>My Orders</span>
                  <ArrowUp className="w-3 h-3 rotate-90" />
                </Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <p>© {new Date().getFullYear()} LuxeCart. All rights reserved.</p>
            <div className="flex items-center space-x-8">
              <button
                onClick={() => alert("Privacy Policy — coming soon!")}
                className="hover:text-slate-900 transition-colors"
              >
                Privacy
              </button>
              <button
                onClick={() => alert("Terms of Service — coming soon!")}
                className="hover:text-slate-900 transition-colors"
              >
                Terms
              </button>
              <button
                onClick={() => alert("Cookie Policy — coming soon!")}
                className="hover:text-slate-900 transition-colors"
              >
                Cookies
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

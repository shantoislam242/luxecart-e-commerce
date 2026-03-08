import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart, Eye, Plus } from "lucide-react";
import { useCart } from "../context/CartContext.tsx";
import { motion, AnimatePresence } from "motion/react";

// Optimise an image URL:
// • Unsplash → shrink to 400 px wide, quality 70, WebP
// • Local paths → return as-is
function optimizeUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith("https://images.unsplash.com")) {
    try {
      const url = new URL(src);
      url.searchParams.set("w", "400");
      url.searchParams.set("q", "70");
      url.searchParams.set("fm", "webp");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("auto", "format");
      return url.toString();
    } catch {
      return src;
    }
  }
  return src;
}

export default function ProductCard({
  product,
  onAddToCart,
}: {
  product: any;
  onAddToCart?: (msg: string) => void;
}) {
  const { addToCart } = useCart();
  const images: string[] = JSON.parse(product.images);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity: 1,
      stock: product.stock,
    });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
    onAddToCart?.(`"${product.name}" added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((v) => !v);
    onAddToCart?.(
      isWishlisted
        ? `"${product.name}" removed from wishlist`
        : `❤️ "${product.name}" saved to wishlist`
    );
  };

  const discount = product.discount && product.discount > 0 ? product.discount : null;
  const originalPrice = discount
    ? (product.price / (1 - discount / 100)).toFixed(2)
    : null;

  const primarySrc = optimizeUrl(images[0]);
  const altSrc = images.length > 1 ? optimizeUrl(images[1]) : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group relative"
    >
      {/* ── Image area — fixed 4:3 ratio prevents layout shift ── */}
      <Link
        to={`/product/${product.id}`}
        className="block relative overflow-hidden"
        style={{ aspectRatio: "4 / 3" }}
      >
        {/* Skeleton: shown while image is loading */}
        <div
          className={`absolute inset-0 bg-slate-100 transition-opacity duration-300 ${imgLoaded ? "opacity-0 pointer-events-none" : "opacity-100 animate-pulse"
            }`}
        />

        {/* Primary image */}
        <img
          src={primarySrc}
          alt={product.name}
          width={400}
          height={300}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${hovered && altSrc ? "opacity-0" : "opacity-100"
            } ${imgLoaded ? "opacity-100" : "opacity-0"}`}
          referrerPolicy="no-referrer"
        />

        {/* Alternate image on hover (lazy) */}
        {altSrc && (
          <img
            src={altSrc}
            alt={`${product.name} alt`}
            width={400}
            height={300}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${hovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
              }`}
            referrerPolicy="no-referrer"
          />
        )}

        {/* Out of Stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discount && (
          <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
            -{discount}%
          </div>
        )}

        {/* Quick actions overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 z-10 flex items-center justify-center gap-2 p-3 bg-gradient-to-t from-slate-900/70 to-transparent transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
        >
          <Link
            to={`/product/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1.5 bg-white/90 hover:bg-white text-slate-900 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </Link>

          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </Link>

      {/* Wishlist button */}
      <button
        onClick={handleWishlist}
        className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-400"
            }`}
        />
      </button>

      {/* Card info */}
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
            {product.category}
          </span>
          <div className="flex items-center text-amber-400 space-x-0.5">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-xs font-bold text-slate-500 ml-0.5">
              {product.ratings || "4.5"}
            </span>
            <span className="text-[10px] text-slate-400">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        <Link to={`/product/${product.id}`} className="block">
          <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-slate-900">
              ${product.price.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-sm text-slate-400 line-through">
                ${originalPrice}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {addedAnim ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </motion.div>
            ) : (
              <motion.button
                key="cart"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="p-2 bg-slate-900 text-white rounded-xl hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed transition-colors active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">
            ⚡ Only {product.stock} left!
          </p>
        )}
      </div>
    </motion.div>
  );
}

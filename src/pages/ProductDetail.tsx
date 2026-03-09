import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useCart } from "../context/CartContext.tsx";
import { motion } from "motion/react";
import { API_BASE } from "../api/api.ts";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="text-center py-20">Product not found</div>;

  const images = JSON.parse(product.images);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      quantity,
      stock: product.stock
    });
    navigate("/cart");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-slate-500 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to products</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm">
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {images.map((img: string, i: number) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-100 bg-white">
                <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 leading-tight">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.ratings) ? "fill-current" : "text-slate-200"}`} />
                ))}
              </div>
              <span className="text-sm text-slate-400">({product.numReviews || 0} Reviews)</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">${product.price.toFixed(2)}</p>
          </div>

          <p className="text-slate-500 leading-relaxed">{product.description}</p>

          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 font-bold text-slate-900 border-x border-slate-200 min-w-[50px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-slate-400">
                {product.stock > 0 ? `${product.stock} items in stock` : "Out of stock"}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-emerald-600 disabled:bg-slate-200 transition-all shadow-xl shadow-slate-900/10"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Add to Cart</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-slate-100">
            <div className="flex items-center space-x-3 text-slate-600">
              <Truck className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-medium">Free Shipping</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <RotateCcw className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-medium">30-Day Returns</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-medium">Secure Payment</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

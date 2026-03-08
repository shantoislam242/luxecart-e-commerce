import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";
import { useCart } from "../context/CartContext.tsx";
import { motion } from "motion/react";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="p-8 bg-white rounded-full shadow-sm border border-slate-100">
          <ShoppingBag className="w-16 h-16 text-slate-200" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="text-slate-500">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link 
          to="/" 
          className="bg-slate-900 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-600 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item) => (
            <motion.div 
              layout
              key={item.productId}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6"
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 space-y-1">
                <Link to={`/product/${item.productId}`} className="font-bold text-slate-900 hover:text-emerald-600 transition-colors">
                  {item.name}
                </Link>
                <p className="text-emerald-600 font-bold">${item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center border border-slate-100 rounded-xl overflow-hidden">
                <button 
                  onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                  className="p-2 hover:bg-slate-50 text-slate-400"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-bold text-slate-900 text-sm">
                  {item.quantity}
                </span>
                <button 
                  onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                  className="p-2 hover:bg-slate-50 text-slate-400"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => removeFromCart(item.productId)}
                className="p-3 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="text-slate-900 font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <span className="text-slate-900 font-bold">Total</span>
                <span className="text-2xl font-bold text-slate-900">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/checkout")}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
            >
              <span>Checkout</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
            <p className="text-emerald-800 text-xs leading-relaxed">
              <strong>Secure Checkout:</strong> Your payment information is processed securely. We accept all major credit cards and digital wallets.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

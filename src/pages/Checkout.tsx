import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.tsx";
import { useAuth } from "../context/AuthContext.tsx";
import { MapPin, CreditCard, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Checkout() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "United States"
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          orderItems: cartItems,
          shippingAddress: address,
          paymentMethod: "Stripe",
          totalPrice
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOrderId(data.id);
        setStep(3);
        clearCart();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
        </motion.div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Order Confirmed!</h1>
          <p className="text-slate-500">Your order #{orderId?.toString().padStart(6, '0')} has been placed successfully.</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => navigate("/profile")}
            className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all"
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-900 rounded-full font-bold hover:bg-slate-50 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step >= 1 ? "text-emerald-600" : "text-slate-300"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-emerald-100" : "bg-slate-100"}`}>1</div>
          <span className="font-bold text-sm">Shipping</span>
        </div>
        <div className="w-12 h-px bg-slate-200" />
        <div className={`flex items-center space-x-2 ${step >= 2 ? "text-emerald-600" : "text-slate-300"}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-emerald-100" : "bg-slate-100"}`}>2</div>
          <span className="font-bold text-sm">Payment</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8"
              >
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Street Address</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">State / Province</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">ZIP / Postal Code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Country</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-emerald-500 outline-none transition-all"
                      value={address.country}
                      onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!address.street || !address.city || !address.zip}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-600 disabled:bg-slate-200 transition-all"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8"
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-2xl font-bold text-slate-900">Payment Method</h2>
                </div>

                <div className="p-6 border-2 border-emerald-500 bg-emerald-50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Credit or Debit Card</p>
                      <p className="text-xs text-slate-500">Secured by Stripe</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <ShieldCheck className="w-5 h-5" />
                    <p className="text-xs">Your transaction is encrypted and secure.</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-emerald-600 disabled:bg-slate-200 transition-all shadow-xl shadow-slate-900/10"
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <aside className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
            
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center space-x-4">
                  <img src={item.image} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.quantity} × ${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4 text-sm">
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
          </div>
        </aside>
      </div>
    </div>
  );
}

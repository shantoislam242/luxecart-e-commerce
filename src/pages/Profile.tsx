import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Link } from "react-router-dom";
import { Package, MapPin, User as UserIcon, Calendar, CheckCircle, Clock, Trash2, AlertTriangle, Shield } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`/api/auth/${user?.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) {
        logout();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/myorders", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* User Info Card */}
        <aside className="w-full md:w-80 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <UserIcon className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                <p className="text-sm text-slate-400">{user?.email}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {user?.role} Account
              </span>
              {user?.role === "admin" && (
                <Link 
                  to="/admin" 
                  className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Shield className="w-4 h-4" />
                  <span>Go to Admin Dashboard</span>
                </Link>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-3 text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-sm">No address saved</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span className="text-sm">Joined {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center space-x-2 text-red-500 hover:text-red-600 text-sm font-bold py-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              ) : (
                <div className="space-y-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Are you sure?</span>
                  </div>
                  <p className="text-[10px] text-red-500 leading-tight">
                    This action is permanent and will delete all your data.
                  </p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleDeleteAccount}
                      className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Orders Section */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Package className="w-4 h-4" />
              <span>{orders.length} Orders</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white h-32 rounded-3xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={order.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order ID</p>
                      <p className="font-mono text-sm text-slate-900">#{order.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                      <p className="text-sm text-slate-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</p>
                      <p className="text-sm font-bold text-slate-900">${order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-50">
                      {order.isPaid ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-500" />
                      )}
                      <span className={`text-xs font-bold uppercase tracking-wider ${order.isPaid ? "text-emerald-600" : "text-amber-600"}`}>
                        {order.isPaid ? "Paid" : "Pending Payment"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">You haven't placed any orders yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

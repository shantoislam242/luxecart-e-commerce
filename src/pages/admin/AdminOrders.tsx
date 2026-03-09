import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import { API_BASE } from "../../api/api.ts";
import {
  Search,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Filter,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
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

  useEffect(() => { fetchOrders(); }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setOpenMenu(null);
    try {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchOrders();
        showToast(`Order #${id} marked as ${status}`);
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to update status", false);
      }
    } catch {
      showToast("Network error — could not update status", false);
    }
  };

  const filteredOrders = orders.filter((o: any) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "All" || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "text-emerald-600 bg-emerald-50";
      case "Shipped": return "text-blue-600 bg-blue-50";
      case "Processing": return "text-amber-600 bg-amber-50";
      case "Cancelled": return "text-red-600 bg-red-50";
      default: return "text-slate-600 bg-slate-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered": return <CheckCircle className="w-3 h-3" />;
      case "Shipped": return <Truck className="w-3 h-3" />;
      case "Processing": return <Clock className="w-3 h-3" />;
      case "Cancelled": return <XCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const statuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
  const statusMeta: Record<string, string> = {
    Processing: "text-amber-600",
    Shipped: "text-blue-600",
    Delivered: "text-emerald-600",
    Cancelled: "text-red-600",
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option>All</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Order ID", "Customer", "Date", "Amount", "Status", "Actions"].map((h, i) => (
                  <th key={h} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${i === 5 ? "text-right" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No orders found.</td></tr>
              ) : filteredOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-bold text-slate-900">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {order.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{order.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span>{order.orderStatus}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* Click-toggled dropdown */}
                    <div className="relative inline-block text-left" ref={openMenu === order.id ? menuRef : undefined}>
                      <button
                        onClick={() => setOpenMenu(openMenu === order.id ? null : order.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                      >
                        <span>Update</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>

                      <AnimatePresence>
                        {openMenu === order.id && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.97 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20"
                          >
                            <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              Set Status
                            </p>
                            {statuses.map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                disabled={order.orderStatus === s}
                                className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${statusMeta[s]} hover:bg-slate-50`}
                              >
                                {s}
                                {order.orderStatus === s && " ✓"}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className={`fixed bottom-6 right-6 z-[60] px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium ${toast.ok ? "bg-emerald-600" : "bg-red-500"}`}
          >
            {toast.ok ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

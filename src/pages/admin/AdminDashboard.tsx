import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "motion/react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/auth/stats", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );

  const statCards = [
    { label: "Total Revenue", value: `$${(stats?.revenue ?? 0).toFixed(2)}`, icon: TrendingUp, color: "emerald", trend: "+12.5%" },
    { label: "Total Orders", value: stats?.orders ?? 0, icon: ShoppingBag, color: "blue", trend: "+8.2%" },
    { label: "Total Users", value: stats?.users ?? 0, icon: Users, color: "violet", trend: "+5.1%" },
    { label: "Total Products", value: stats?.products ?? 0, icon: Package, color: "amber", trend: "0%" },
  ];

  const quickActions = [
    { label: "Add New Product", icon: Package, color: "emerald", path: "/admin/products" },
    { label: "Review Orders", icon: ShoppingBag, color: "blue", path: "/admin/orders" },
    { label: "Manage Users", icon: Users, color: "violet", path: "/admin/users" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div
                className={`flex items-center space-x-1 text-xs font-bold ${stat.trend.startsWith("+") ? "text-emerald-600" : "text-slate-400"
                  }`}
              >
                <span>{stat.trend}</span>
                {stat.trend.startsWith("+") ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
              </div>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
              <p className="text-sm text-slate-500">Monthly sales performance</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/20">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="h-[300px] w-full">
            {stats?.salesData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">
                No sales data yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-${action.color}-50 hover:text-${action.color}-700 transition-all group`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-white rounded-lg border border-slate-200 group-hover:border-${action.color}-200`}>
                    <action.icon className={`w-5 h-5 text-slate-400 group-hover:text-${action.color}-600`} />
                  </div>
                  <span className="font-bold text-sm">{action.label}</span>
                </div>
                <ArrowUpRight className={`w-4 h-4 text-slate-300 group-hover:text-${action.color}-500`} />
              </button>
            ))}
          </div>

          {/* System Status */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900">System Status</h4>
              <div className="flex items-center space-x-1 text-emerald-500">
                <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Online</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Database", value: "Healthy" },
                { label: "Storage", value: "82% Free" },
                { label: "API Latency", value: "24ms" },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{row.label}</span>
                  <span className="text-slate-900 font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

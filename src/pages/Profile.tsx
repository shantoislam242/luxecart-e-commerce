import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { Link } from "react-router-dom";
import {
  Package, MapPin, User as UserIcon, Calendar, CheckCircle, Clock,
  Trash2, AlertTriangle, Shield, Lock, Eye, EyeOff, AlertCircle, KeyRound,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ── Change Password ─────────────────────────────────────────────────────
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, newPwd: false, confirm: false });
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwMsg, setPwMsg] = useState("");

  const strength = (() => {
    const p = pwForm.newPwd;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-600"][strength];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPwd !== pwForm.confirm) { setPwStatus("error"); setPwMsg("Passwords do not match."); return; }
    if (pwForm.newPwd.length < 6) { setPwStatus("error"); setPwMsg("Min 6 characters required."); return; }
    setPwStatus("loading");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus("success");
        setPwMsg("Password changed successfully!");
        setPwForm({ current: "", newPwd: "", confirm: "" });
      } else {
        setPwStatus("error");
        setPwMsg(data.message || "Failed to change password.");
      }
    } catch {
      setPwStatus("error");
      setPwMsg("Network error. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`/api/auth/${user?.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (res.ok) logout();
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/myorders", {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setOrders(await res.json());
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    if (user) fetchOrders();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">

        {/* ── Sidebar ── */}
        <aside className="w-full md:w-80 space-y-4">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">

            {/* Avatar + Info */}
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
                <Link to="/admin"
                  className="mt-4 inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                >
                  <Shield className="w-4 h-4" /><span>Go to Admin Dashboard</span>
                </Link>
              )}
            </div>

            {/* Meta */}
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

            {/* ── Change Password accordion ── */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => { setPwOpen((v) => !v); setPwStatus("idle"); setPwMsg(""); }}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl transition-all group"
              >
                <span className="flex items-center space-x-2 text-sm font-bold text-slate-700 group-hover:text-emerald-700">
                  <KeyRound className="w-4 h-4 text-emerald-500" />
                  <span>Change Password</span>
                </span>
                <span className={`text-slate-400 transition-transform duration-200 ${pwOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              <AnimatePresence>
                {pwOpen && (
                  <motion.form
                    key="pw-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleChangePassword}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-3">
                      {/* Feedback */}
                      {pwMsg && (
                        <div className={`flex items-start space-x-2 px-3 py-2.5 rounded-xl text-xs font-medium ${pwStatus === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                          {pwStatus === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                          <span>{pwMsg}</span>
                        </div>
                      )}

                      {/* Fields */}
                      {([
                        { key: "current" as const, label: "Current Password", autoC: "current-password" },
                        { key: "newPwd" as const, label: "New Password", autoC: "new-password" },
                        { key: "confirm" as const, label: "Confirm New Password", autoC: "new-password" },
                      ] as const).map(({ key, label, autoC }) => (
                        <div key={key}>
                          <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type={showPw[key] ? "text" : "password"}
                              autoComplete={autoC}
                              required
                              value={pwForm[key]}
                              onChange={(e) => { setPwForm((f) => ({ ...f, [key]: e.target.value })); setPwStatus("idle"); setPwMsg(""); }}
                              placeholder="••••••••"
                              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all text-sm bg-slate-50 focus:bg-white"
                            />
                            <button type="button" tabIndex={-1}
                              onClick={() => setShowPw((s) => ({ ...s, [key]: !s[key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPw[key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Strength meter */}
                          {key === "newPwd" && pwForm.newPwd && (
                            <div className="mt-1.5 space-y-0.5">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-slate-100"}`} />
                                ))}
                              </div>
                              <p className={`text-[10px] font-bold ${strengthColor.replace("bg-", "text-")}`}>{strengthLabel}</p>
                            </div>
                          )}

                          {/* Match indicator */}
                          {key === "confirm" && pwForm.confirm && (
                            <p className={`text-[10px] font-bold mt-1 flex items-center space-x-1 ${pwForm.newPwd === pwForm.confirm ? "text-emerald-600" : "text-red-500"}`}>
                              {pwForm.newPwd === pwForm.confirm
                                ? <><CheckCircle className="w-3 h-3" /><span>Passwords match</span></>
                                : <><AlertCircle className="w-3 h-3" /><span>Does not match</span></>}
                            </p>
                          )}
                        </div>
                      ))}

                      <button type="submit" disabled={pwStatus === "loading"}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-60 shadow-sm"
                      >
                        {pwStatus === "loading"
                          ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><Lock className="w-3.5 h-3.5" /><span>Update Password</span></>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Delete Account */}
            <div className="pt-4 border-t border-slate-100">
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center space-x-2 text-red-500 hover:text-red-600 text-sm font-bold py-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /><span>Delete Account</span>
                </button>
              ) : (
                <div className="space-y-4 bg-red-50 p-4 rounded-2xl border border-red-100">
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Are you sure?</span>
                  </div>
                  <p className="text-[10px] text-red-500 leading-tight">This action is permanent and will delete all your data.</p>
                  <div className="flex space-x-2">
                    <button onClick={handleDeleteAccount} className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-white text-slate-600 text-xs font-bold py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── Orders ── */}
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Order History</h1>
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Package className="w-4 h-4" /><span>{orders.length} Orders</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <div key={i} className="bg-white h-32 rounded-3xl animate-pulse border border-slate-100" />)}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order: any) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={order.id}
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
                      {order.isPaid ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
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

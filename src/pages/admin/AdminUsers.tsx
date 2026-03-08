import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.tsx";
import {
  Search,
  User,
  Shield,
  ShieldAlert,
  Trash2,
  Mail,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/auth/users", {
        headers: { Authorization: `Bearer ${currentUser?.token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [currentUser]);

  const toggleRole = async (userId: number, currentRole: string) => {
    // Prevent admin from demoting themselves
    if (userId === currentUser?.id) {
      showToast("You cannot change your own role", false);
      return;
    }
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/auth/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
        showToast(`User role changed to ${newRole}`);
      } else {
        const data = await res.json();
        showToast(data.message || "Failed to update role", false);
      }
    } catch {
      showToast("Network error — could not update role", false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/auth/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentUser?.token}` },
      });
      if (res.ok) {
        fetchUsers();
        showToast("User deleted successfully");
      } else {
        const data = await res.json();
        showToast(data.message || "Delete failed", false);
      }
    } catch {
      showToast("Network error — could not delete user", false);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filteredUsers = users.filter(
    (u: any) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["User", "Email", "Role", "Joined", "Actions"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 ${i === 4 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : filteredUsers.map((u: any) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border text-sm font-bold ${u.role === "admin" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-500"
                          }`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {isSelf && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">ID: #{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-300" />
                        <span className="text-sm">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.role === "admin" ? "text-emerald-600 bg-emerald-50" : "text-slate-600 bg-slate-50"
                          }`}
                      >
                        {u.role === "admin" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle role */}
                        <button
                          onClick={() => toggleRole(u.id, u.role)}
                          disabled={isSelf}
                          title={isSelf ? "Cannot change your own role" : u.role === "admin" ? "Demote to User" : "Promote to Admin"}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {u.role === "admin" ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeleteConfirm(u)}
                          disabled={isSelf}
                          title={isSelf ? "Cannot delete yourself" : "Delete user"}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            className={`fixed bottom-6 right-6 z-[60] px-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-medium ${toast.ok ? "bg-emerald-600" : "bg-red-500"
              }`}
          >
            {toast.ok ? "✅" : "❌"} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center space-y-5"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Delete User?</h3>
                <p className="text-slate-500 text-sm">
                  <span className="font-semibold text-slate-700">{deleteConfirm.name}</span> ({deleteConfirm.email}) will be permanently removed.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

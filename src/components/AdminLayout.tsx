import React from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Mail,
  BookOpen,
  UserSquare,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext.tsx";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingBag, label: "Orders", path: "/admin/orders" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Mail, label: "Newsletter", path: "/admin/newsletter" },
];

// Content management section in sidebar
const contentItems = [
  { icon: BookOpen, label: "Blog Posts", path: "/admin/blog" },
  { icon: UserSquare, label: "Team Members", path: "/admin/team" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
];


export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              LuxeCart{" "}
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded uppercase ml-1">
                Admin
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}

          {/* Content Management Section */}
          <div className="pt-3 mt-3 border-t border-slate-100">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 px-3 pb-2">Content</p>
            {contentItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          {/* Back to store */}
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="font-medium">View Store</span>
          </Link>
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-900">
            {sidebarItems.find((i) => i.path === location.pathname)?.label || "Admin Panel"}
          </h2>
          <div className="flex items-center space-x-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">{user?.name || "Admin"}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                {user?.role || "admin"}
              </span>
            </div>
            <div className="w-10 h-10 bg-emerald-100 rounded-full border border-emerald-200 flex items-center justify-center">
              <span className="text-emerald-700 font-bold text-sm">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

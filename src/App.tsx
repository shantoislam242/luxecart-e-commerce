import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";

// ── Critical path: load immediately ──────────────────────────────────────
import Home from "./pages/Home.tsx";

// ── Lazy-loaded: only downloaded when user actually visits these pages ───
const ProductDetail = lazy(() => import("./pages/ProductDetail.tsx"));
const Cart = lazy(() => import("./pages/Cart.tsx"));
const Checkout = lazy(() => import("./pages/Checkout.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));

// Admin pages — heaviest chunk, only loaded for admins ───────────────────
const AdminLayout = lazy(() => import("./components/AdminLayout.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.tsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.tsx"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers.tsx"));
const AdminNewsletter = lazy(() => import("./pages/admin/AdminNewsletter.tsx"));

// Minimal inline spinner — no extra libraries needed ──────────────────────
function PageSpinner() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
    </div>
  );
}

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/" />;
  return <>{children}</>;
};

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAdminPath && <Navbar />}
      <main className={`${!isAdminPath ? "flex-grow container mx-auto px-4 py-8" : "flex-grow"}`}>
        {/* Suspense boundary wraps all lazy routes */}
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/checkout" element={
              <ProtectedRoute><Checkout /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />

            {/* Admin — separate chunk, only loaded for admin users */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="newsletter" element={<AdminNewsletter />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {!isAdminPath && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

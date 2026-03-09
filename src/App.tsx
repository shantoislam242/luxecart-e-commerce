import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.tsx";
import { CartProvider } from "./context/CartContext.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";

// Pages
import Home from "./pages/Home.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Profile from "./pages/Profile.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import AboutPage from "./pages/About.tsx";
import BlogPage from "./pages/Blog.tsx";
import ContactPage from "./pages/Contact.tsx";

// Admin
import AdminLayout from "./components/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminNewsletter from "./pages/admin/AdminNewsletter.tsx";

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
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

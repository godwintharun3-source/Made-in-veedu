import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeThemeDom } from './store/themeSlice';
import { setCartItems } from './store/cartSlice';
import { logout } from './store/authSlice';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackingPage from './pages/TrackingPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import axios from 'axios';

export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Sync current dark/light state to classLists on load
    dispatch(initializeThemeDom());
  }, [dispatch]);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('miv_access_token');
      if (isAuthenticated && token) {
        try {
          const res = await axios.get('http://localhost:8080/api/cart', {
            headers: { Authorization: `Bearer ${token}` }
          });
          dispatch(setCartItems(res.data));
        } catch (err) {
          console.error("Failed to fetch cart on mount", err);
          if (err.response?.status === 403 || err.response?.status === 401) {
            dispatch(logout());
          }
        }
      }
    };
    fetchCart();
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-200">
      <Navbar />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/tracking/:id" element={<ProtectedRoute><TrackingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>

      <Footer />
      
      {/* Floating AI Chat Assistant Widget */}
      <ChatbotWidget />
    </div>
  );
}

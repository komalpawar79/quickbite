import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import websocket from './services/websocket';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import OrderPage from './pages/OrderPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminDashboardNew from './pages/AdminDashboardNew';
import ProfilePage from './pages/ProfilePage';
import CanteenDashboard from './pages/CanteenDashboard';
import UserMessagesPage from './pages/UserMessagesPage';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      websocket.connect(user._id);
    }

    return () => {
      websocket.disconnect();
    };
  }, [isAuthenticated, user]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            <Route path="/menu" element={<MenuPage />} />
            
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrderPage />
              </ProtectedRoute>
            } />
            
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            } />
            
            <Route path="/tracking/:orderId" element={
              <ProtectedRoute>
                <OrderTrackingPage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="/my-messages" element={
              <ProtectedRoute>
                <UserMessagesPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardNew />
              </ProtectedRoute>
            } />
            
            <Route path="/canteen/dashboard" element={
              <ProtectedRoute requiredRole="canteen_manager">
                <CanteenDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;

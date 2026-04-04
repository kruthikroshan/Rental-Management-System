import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './App/auth/login/page';
import SignupPage from './App/auth/signup/page';
import VerifyEmailPage from './App/auth/verify-email/page';
import ForgotPasswordPage from './App/auth/forgot-password/page';
import OAuthCallbackPage from './App/auth/callback/page';
import DashboardPage from './pages/DashBoardPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Customer Components
import CustomerLayout from './App/customer/layout';
import RentalsPage from './App/customer/rentals/page';
import RentalShopPage from './App/customer/products/page';
import ProductDetailsPage from './App/customer/products/[productId]/page';
import WishlistPage from './App/customer/wishlist/page';
import ReviewOrderPage from './App/customer/checkout/review/page';
import DeliveryPage from './App/customer/checkout/delivery/page';
import PaymentPage from './App/customer/checkout/payment/page';
import CheckoutSuccessPage from './App/customer/checkout/success/page';
import LogoutPage from './pages/LogoutPage';

// Admin Components
import AdminLayout from './App/admin/layout';
import AdminDashboard from './App/admin/dashboard/page';
import AdminUsers from './App/admin/users/page';
import AdminProducts from './App/admin/products/page';
import AdminProductNew from './App/admin/products/new/page';
import AdminProductEdit from './App/admin/products/edit/page';
import AdminOrders from './App/admin/orders/page';
import AdminReports from './App/admin/reports/index';
import AdminRentals from './App/admin/rentals/page';
import AdminReviews from './App/admin/reviews/page';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <WishlistProvider>
          <Router>
          <div className="App">
            <Routes>
            {/* Landing page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Customer Portal */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute requiredRole="customer">
                  <CustomerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/customer/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="my-rentals" element={<RentalsPage />} />
              <Route path="rentals" element={<RentalsPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="products" element={<RentalShopPage />} />
              <Route path="products/:productId" element={<ProductDetailsPage />} />
              {/* Checkout flow within layout */}
              <Route path="checkout/review" element={<ReviewOrderPage />} />
              <Route path="checkout/delivery" element={<DeliveryPage />} />
              <Route path="checkout/payment" element={<PaymentPage />} />
              <Route path="checkout/success" element={<CheckoutSuccessPage />} />
            </Route>

            {/* Dashboard redirector */}
            <Route
              path="/dashboard"
              element={<Navigate to="/customer/dashboard" replace />}
            />
            
            {/* Legacy/Shortcut Customer Routes */}
            <Route path="/products" element={<Navigate to="/customer/products" replace />} />
            <Route path="/rentals" element={<Navigate to="/customer/rentals" replace />} />
            <Route path="/my-rentals" element={<Navigate to="/customer/rentals" replace />} />
            <Route path="/wishlist" element={<Navigate to="/customer/wishlist" replace />} />
            
            <Route
              path="/logout"
              element={
                <ProtectedRoute>
                  <LogoutPage />
                </ProtectedRoute>
              }
            />
            
            {/* Admin only routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductNew />} />
              <Route path="products/edit/:productId" element={<AdminProductEdit />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="rentals" element={<AdminRentals />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
            
            {/* Default redirect */}
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </WishlistProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;

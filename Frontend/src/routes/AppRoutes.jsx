import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';

// Pages
import Home from '../pages/Home/Home.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import DashboardHome from '../pages/Dashboard/DashboardHome.jsx';
import VerifyEmailPage from '../pages/Auth/VerifyEmailPage.jsx';
import VerifyOTP from '../pages/Auth/VerifyOTP.jsx';
import ForgotPassword from '../pages/Auth/ForgotPassword.jsx';
import ResetPassword from '../pages/Auth/ResetPassword.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';

// Gate
import ProtectedRoute from './ProtectedRoute.jsx';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>

      {/* General Site Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Authentication Gateway Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Verification Route */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
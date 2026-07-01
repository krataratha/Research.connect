import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../modules/landing';
import ComingSoon from '../components/common/ComingSoon';

// Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import LoginPage from '../modules/auth/pages/LoginPage';
import RegisterPage from '../modules/auth/pages/RegisterPage';
import OtpVerificationPage from '../modules/auth/pages/OtpVerificationPage';
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage';
import SuccessPage from '../modules/auth/pages/SuccessPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';
import ProfilePage from '../modules/profile/pages/ProfilePage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing / Public Website Layout */}
      <Route path="/" element={<LandingLayout />}>
        <Route index element={<LandingPage />} />
      </Route>

      {/* Authentication Layout */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />
        <Route path="otp" element={
          <PublicRoute>
            <OtpVerificationPage />
          </PublicRoute>
        } />
        <Route path="forgot-password" element={
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        } />
        <Route path="reset-password" element={
          <PublicRoute>
            <ResetPasswordPage />
          </PublicRoute>
        } />
        <Route path="success" element={
          <PublicRoute>
            <SuccessPage />
          </PublicRoute>
        } />
      </Route>

      {/* Dashboard & Modules Layout */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="publication" element={<ComingSoon title="Publication Management Coming Soon" />} />
        <Route path="search" element={<ComingSoon title="Research Discovery Search Coming Soon" />} />
        <Route path="settings" element={<ComingSoon title="System Settings Coming Soon" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications Center Coming Soon" />} />
        <Route path="admin" element={<ComingSoon title="Administration Panel Coming Soon" />} />
        <Route path="analytics" element={<ComingSoon title="System Analytics Coming Soon" />} />
      </Route>

      {/* 404 & Wildcard Fallback */}
      <Route path="/404" element={<ComingSoon title="Page Not Found (404)" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;

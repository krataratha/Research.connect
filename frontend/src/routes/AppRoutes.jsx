import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingLayout from '../layouts/LandingLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../modules/landing';
import ComingSoon from '../components/common/ComingSoon';
import HomeHub from './HomeHub';

// Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import LoginPage from '../modules/authentication/pages/LoginPage';
import RegisterPage from '../modules/authentication/pages/RegisterPage';
import OtpVerificationPage from '../modules/authentication/pages/OtpVerificationPage';
import ForgotPasswordPage from '../modules/authentication/pages/ForgotPasswordPage';
import ResetPasswordPage from '../modules/authentication/pages/ResetPasswordPage';
import SuccessPage from '../modules/authentication/pages/SuccessPage';
import AiWorkspacePage from '../modules/ai-workspace/pages/AiWorkspacePage';
import ProfilePage from '../modules/profile/pages/ProfilePage';
import ResearchIdentityPage from '../modules/profile/pages/ResearchIdentityPage';
import ProfileRedirect from '../modules/profile/components/ProfileRedirect';
import PublicationCreatePage from '../modules/publication/pages/PublicationCreatePage';
import PublicationDetailPage from '../modules/publication/pages/PublicationDetailPage';
import PublicationsLibraryPage from '../modules/publication/pages/PublicationsLibraryPage';
import PublicationEditPage from '../modules/publication/pages/PublicationEditPage';
import MessagesRoute from './MessagesRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Dynamic Landing / Feed Hub */}
      <Route path="/" element={<HomeHub />} />

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
        <Route path="ai-workspace" element={<AiWorkspacePage />} />
        <Route path="profile" element={<ProfileRedirect />} />
        <Route path="research-identity" element={<ResearchIdentityPage />} />
        <Route path="publications/create" element={<PublicationCreatePage />} />
        <Route path="projects/create" element={<ComingSoon title="Create Project Coming Soon" />} />
        <Route path="datasets/create" element={<ComingSoon title="Share Dataset Coming Soon" />} />
        <Route path="questions/create" element={<ComingSoon title="Ask Question Coming Soon" />} />
        <Route path="communities/create" element={<ComingSoon title="Create Community Coming Soon" />} />
        <Route path="collaborations/create" element={<ComingSoon title="Create Collaboration Coming Soon" />} />
        <Route path="patents/create" element={<ComingSoon title="Upload Patent Coming Soon" />} />
        <Route path="articles/create" element={<ComingSoon title="Write Article Coming Soon" />} />
        <Route path="events/create" element={<ComingSoon title="Create Event Coming Soon" />} />
        <Route path="publication/:slug/edit" element={<PublicationEditPage />} />
        <Route path="messages" element={<MessagesRoute />} />
        <Route path="search" element={<ComingSoon title="Research Discovery Search Coming Soon" />} />
        <Route path="settings" element={<ComingSoon title="System Settings Coming Soon" />} />
        <Route path="notifications" element={<ComingSoon title="Notifications Center Coming Soon" />} />
        <Route path="admin" element={<ComingSoon title="Administration Panel Coming Soon" />} />
        <Route path="analytics" element={<ComingSoon title="System Analytics Coming Soon" />} />
      </Route>

      {/* Public Profile Route */}
      <Route element={<DashboardLayout />}>
        <Route path="/profile/:profileSlug" element={<ProfilePage />} />
        <Route path="/profile/:profileSlug/publications" element={<PublicationsLibraryPage />} />
        <Route path="/profile/:profileSlug/projects" element={<ComingSoon title="Researcher Projects Coming Soon" />} />
        <Route path="/profile/:profileSlug/patents" element={<ComingSoon title="Researcher Patents Coming Soon" />} />
        <Route path="/profile/:profileSlug/datasets" element={<ComingSoon title="Researcher Datasets Coming Soon" />} />
        <Route path="/profile/:profileSlug/books" element={<ComingSoon title="Researcher Books Coming Soon" />} />
        <Route path="/profile/:profileSlug/analytics" element={<ComingSoon title="Researcher Analytics Coming Soon" />} />
        <Route path="/publication/:publicationSlug" element={<PublicationDetailPage />} />
      </Route>

      {/* 404 & Wildcard Fallback */}
      <Route path="/404" element={<ComingSoon title="Page Not Found (404)" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;

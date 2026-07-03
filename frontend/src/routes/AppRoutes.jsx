import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ComingSoon from '../components/common/ComingSoon';
const HomeHub = React.lazy(() => import('./HomeHub'));

// Guards
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Lazy-loaded Pages
const LoginPage = React.lazy(() => import('../modules/authentication/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../modules/authentication/pages/RegisterPage'));
const OtpVerificationPage = React.lazy(() => import('../modules/authentication/pages/OtpVerificationPage'));
const ForgotPasswordPage = React.lazy(() => import('../modules/authentication/pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('../modules/authentication/pages/ResetPasswordPage'));
const SuccessPage = React.lazy(() => import('../modules/authentication/pages/SuccessPage'));
const ResearchIdentityPage = React.lazy(() => import('../modules/profile/pages/ResearchIdentityPage'));
const ProfileRedirect = React.lazy(() => import('../modules/profile/components/ProfileRedirect'));
const PublicationCreatePage = React.lazy(() => import('../modules/publication/pages/PublicationCreatePage'));
const PublicationDetailPage = React.lazy(() => import('../modules/publication/pages/PublicationDetailPage'));
const PublicationsLibraryPage = React.lazy(() => import('../modules/publication/pages/PublicationsLibraryPage'));
const PublicationEditPage = React.lazy(() => import('../modules/publication/pages/PublicationEditPage'));
const PublicationReader = React.lazy(() => import('../modules/publication/pages/PublicationReader'));
const PublicationAnalyticsPage = React.lazy(() => import('../modules/publication/pages/PublicationAnalyticsPage'));
const SearchPage = React.lazy(() => import('../modules/search/pages/SearchPage'));
const MessagesRoute = React.lazy(() => import('./MessagesRoute'));

// Profile module routes nested
import profileRoutes from '../modules/profile/routes/profile.routes';

const AppRoutes = () => {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <Routes>
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

        {/* Dashboard & Modules Layout (No Sidebar) */}
        <Route element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomeHub />} />
          <Route path="profile" element={<ProfileRedirect />} />
          <Route path="research-identity" element={<ResearchIdentityPage />} />
          <Route path="publications/create" element={<PublicationCreatePage />} />
          <Route path="publications" element={<PublicationsLibraryPage />} />
          <Route path="publications/drafts" element={<PublicationsLibraryPage />} />
          <Route path="publications/published" element={<PublicationsLibraryPage />} />
          <Route path="publications/trash" element={<PublicationsLibraryPage />} />
          <Route path="publications/bookmarks" element={<PublicationsLibraryPage />} />
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
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<ComingSoon title="System Settings Coming Soon" />} />
          <Route path="notifications" element={<ComingSoon title="Notifications Center Coming Soon" />} />
          <Route path="admin" element={<ComingSoon title="Administration Panel Coming Soon" />} />
          <Route path="analytics" element={<ComingSoon title="System Analytics Coming Soon" />} />
        </Route>

        {/* Profile Module Nested Routes (ProfileLayout handles sidebar) */}
        {profileRoutes}

        {/* Non-Profile Detail Routes (Uses normal AppLayout without sidebar) */}
        <Route element={<AppLayout />}>
          <Route path="/publication/:publicationSlug" element={<PublicationDetailPage />} />
          {/* SEO-friendly canonical route — Phase 3 Publication Reader */}
          <Route path="/publications/:slug" element={<PublicationReader />} />
          {/* Phase 7 — Publication Analytics */}
          <Route path="/publication/:slug/analytics" element={<PublicationAnalyticsPage />} />
          {/* Phase 5 — Global Search (also accessible without auth) */}
          <Route path="/search" element={<SearchPage />} />
        </Route>

        {/* 404 & Wildcard Fallback */}
        <Route path="/404" element={<ComingSoon title="Page Not Found (404)" />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
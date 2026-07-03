import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Award, X, SlidersHorizontal } from 'lucide-react';
import useCertificates from '../hooks/useCertificates';
import CertificateCard from '../components/CertificateCard';
import CertificateCardSkeleton from '../components/CertificateCardSkeleton';
import CertificatesEmptyState from '../components/CertificatesEmptyState';
import CertificateShareModal from '../components/CertificateShareModal';
import { PROVIDER_FILTERS, CERTIFICATE_STATUSES, MOCK_CERTIFICATES } from '../constants/certificates.constants';

/**
 * CertificatesPage
 * ─────────────────────────────────────────────────────────────────────────────
 * Main page rendered at /certificates.
 * Wrapped by ProtectedRoute > AppLayout (Navbar + ProfileSidebar + Outlet).
 * Uses mock data only — no backend calls.
 */
const SKELETON_COUNT = 6;

const STATUS_FILTERS = [
  { value: 'all',                        label: 'All Status' },
  { value: CERTIFICATE_STATUSES.ACTIVE,  label: 'Active' },
  { value: CERTIFICATE_STATUSES.EXPIRED, label: 'Expired' },
  { value: CERTIFICATE_STATUSES.PENDING, label: 'Pending' },
];

const CertificatesPage = () => {
  const {
    certificates,
    totalCount,
    isLoading,
    searchQuery,
    setSearchQuery,
    activeProvider,
    setActiveProvider,
    activeStatus,
    setActiveStatus,
    resetFilters,
    hasActiveFilters,
  } = useCertificates();

  const [shareTarget, setShareTarget] = useState(null);

  // Active count is always over the full dataset — not the filtered result
  const activeCount = MOCK_CERTIFICATES.filter((c) => c.status === 'Active').length;

  return (
    <div className="space-y-8">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              My Certificates
            </h1>
          </div>
          <p className="text-sm text-text-secondary ml-[52px]">
            {isLoading
              ? 'Loading your credentials…'
              : `${totalCount} total · ${activeCount} active`}
          </p>
        </div>

        {/* Summary pills */}
        {!isLoading && (
          <div className="flex items-center gap-2 flex-wrap">
            {STATUS_FILTERS.slice(1).map((s) => {
              const count = certificates.filter((c) => c.status === s.value).length;
              return (
                <span
                  key={s.value}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-page border border-border text-xs font-semibold text-text-secondary"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      s.value === 'Active'  ? 'bg-accent-green' :
                      s.value === 'Expired' ? 'bg-accent-red'   :
                                              'bg-accent-orange'
                    }`}
                  />
                  {count} {s.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Search + Filters ──────────────────────────────────────────────── */}
      <div className="bg-bg-card border border-border rounded-2xl p-4 shadow-sm space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
          <input
            id="certificates-search"
            type="text"
            placeholder="Search by name, provider, skill or credential ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-bg-page border border-border rounded-xl text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Provider filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Provider:
          </span>
          {PROVIDER_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveProvider(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                activeProvider === f.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-bg-page text-text-secondary border-border hover:border-primary hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-text-secondary mr-1 w-[68px]">
            Status:
          </span>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveStatus(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                activeStatus === f.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-bg-page text-text-secondary border-border hover:border-primary hover:text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs text-accent-red hover:underline font-semibold transition"
            >
              Reset all
            </button>
          )}
        </div>
      </div>

      {/* ── Results label ─────────────────────────────────────────────────── */}
      {!isLoading && (
        <motion.p
          key={certificates.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-text-secondary"
        >
          {hasActiveFilters
            ? `Showing ${certificates.length} of ${totalCount} certificates`
            : `All ${totalCount} certificates`}
        </motion.p>
      )}

      {/* ── Certificate Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <CertificateCardSkeleton key={i} />
            ))
          : certificates.length > 0
            ? certificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  certificate={cert}
                  onShare={setShareTarget}
                />
              ))
            : <CertificatesEmptyState
                hasActiveFilters={hasActiveFilters}
                onReset={resetFilters}
              />
        }
      </div>

      {/* ── Share Modal ───────────────────────────────────────────────────── */}
      <CertificateShareModal
        isOpen={!!shareTarget}
        onClose={() => setShareTarget(null)}
        certificate={shareTarget}
      />
    </div>
  );
};

export default CertificatesPage;

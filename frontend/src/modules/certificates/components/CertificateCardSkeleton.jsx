import React from 'react';
import Skeleton from '../../../components/common/loaders/Skeleton';

/**
 * CertificateCardSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Loading placeholder that mirrors the real CertificateCard dimensions.
 * Reuses the existing Skeleton component from components/common/loaders.
 */
const CertificateCardSkeleton = () => (
  <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
    {/* Thumbnail */}
    <Skeleton variant="rectangular" height={160} className="w-full rounded-none" />

    <div className="p-5 space-y-3">
      {/* Provider badge */}
      <Skeleton variant="text" width="30%" height={20} className="rounded-full" />

      {/* Certificate name */}
      <Skeleton variant="text" width="85%" height={22} />
      <Skeleton variant="text" width="60%" height={16} />

      {/* Meta row */}
      <div className="flex gap-3 pt-1">
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="text" width="40%" height={14} />
      </div>

      {/* Skills */}
      <div className="flex gap-2 pt-1">
        <Skeleton variant="text" width={60} height={24} className="rounded-full" />
        <Skeleton variant="text" width={70} height={24} className="rounded-full" />
        <Skeleton variant="text" width={55} height={24} className="rounded-full" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Skeleton variant="rectangular" height={34} className="flex-1 rounded-lg" />
        <Skeleton variant="rectangular" height={34} className="flex-1 rounded-lg" />
        <Skeleton variant="rectangular" width={34} height={34} className="rounded-lg" />
      </div>
    </div>
  </div>
);

export default CertificateCardSkeleton;

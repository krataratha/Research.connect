import React from 'react';
import { motion } from 'framer-motion';
import { Award, RotateCcw } from 'lucide-react';
import Button from '../../../components/common/buttons/Button';

/**
 * CertificatesEmptyState
 * ─────────────────────────────────────────────────────────────────────────────
 * Shown when search / filter returns zero results.
 * Reuses existing Button component and follows the ComingSoon visual style.
 */
const CertificatesEmptyState = ({ hasActiveFilters = false, onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="col-span-full flex flex-col items-center justify-center py-24 px-4 text-center"
  >
    <div className="w-20 h-20 bg-light-blue text-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
      <Award className="w-10 h-10" />
    </div>

    <h3 className="text-xl font-bold text-text-primary mb-2">
      {hasActiveFilters ? 'No certificates found' : 'No certificates yet'}
    </h3>

    <p className="text-sm text-text-secondary max-w-sm leading-relaxed mb-6">
      {hasActiveFilters
        ? 'Try adjusting your search term or clearing the active filters to see more results.'
        : 'Your earned certificates and credentials will appear here. Start a course to get certified!'}
    </p>

    {hasActiveFilters && onReset && (
      <Button
        variant="outline"
        onClick={onReset}
        icon={<RotateCcw className="w-4 h-4" />}
      >
        Clear Filters
      </Button>
    )}
  </motion.div>
);

export default CertificatesEmptyState;

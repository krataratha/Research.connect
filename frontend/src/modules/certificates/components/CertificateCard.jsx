import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Hash, Download, Share2, ExternalLink,
} from 'lucide-react';
import { STATUS_STYLES } from '../constants/certificates.constants';
import Button from '../../../components/common/buttons/Button';

/**
 * CertificateCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays a single certificate with all required fields:
 *   Thumbnail · Name · Provider · Issue Date · Credential ID · Skills ·
 *   Status Badge · View · Download · Share
 *
 * Props:
 *   certificate  — one item from MOCK_CERTIFICATES
 *   onShare      — callback(certificate) to open share modal
 */
const CertificateCard = ({ certificate, onShare }) => {
  const [imgError, setImgError] = useState(false);
  const statusStyle = STATUS_STYLES[certificate.status] || STATUS_STYLES.Active;

  const formattedDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  const handleView = () => {
    window.open(certificate.credentialUrl, '_blank', 'noopener,noreferrer');
  };

  // Mock download — opens credential URL in new tab (no real file)
  const handleDownload = () => {
    window.open(certificate.credentialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 12px 28px rgba(0,0,0,0.09)' }}
      className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col group"
    >
      {/* ── Thumbnail ──────────────────────────────────────────────────────── */}
      <div className="relative h-40 overflow-hidden bg-light-blue shrink-0">
        {!imgError ? (
          <img
            src={certificate.thumbnail}
            alt={certificate.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <span className="text-4xl font-black text-primary/20">
              {certificate.provider.charAt(0)}
            </span>
          </div>
        )}

        {/* Status badge — top-right overlay */}
        <span
          className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyle.badge} shadow-sm`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
          {certificate.status}
        </span>
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-1 gap-3">

        {/* Provider pill */}
        <span className="self-start inline-flex items-center px-2.5 py-0.5 rounded-full bg-light-blue text-primary text-xs font-semibold">
          {certificate.provider}
        </span>

        {/* Certificate name */}
        <h3 className="font-bold text-text-primary text-base leading-snug line-clamp-2">
          {certificate.name}
        </h3>

        {/* Meta: Issue Date + Credential ID */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            Issued {formattedDate}
          </span>
          <span className="flex items-center gap-1 truncate max-w-full">
            <Hash className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{certificate.credentialId}</span>
          </span>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
          {certificate.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-bg-page border border-border rounded-full text-xs text-text-secondary font-medium"
            >
              {skill}
            </span>
          ))}
          {certificate.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-bg-page border border-border rounded-full text-xs text-text-secondary font-medium">
              +{certificate.skills.length - 3}
            </span>
          )}
        </div>

        {/* ── Action Row ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Button
            variant="primary"
            size="sm"
            onClick={handleView}
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            className="flex-1 justify-center"
          >
            View
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownload}
            icon={<Download className="w-3.5 h-3.5" />}
            className="flex-1 justify-center"
          >
            Download
          </Button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onShare(certificate)}
            className="p-2 rounded-lg border border-border text-text-secondary hover:text-primary hover:border-primary hover:bg-light-blue transition-colors"
            title="Share certificate"
            aria-label="Share certificate"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CertificateCard;

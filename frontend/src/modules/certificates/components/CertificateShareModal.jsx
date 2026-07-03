import React, { useState } from 'react';
import { Check, Copy, Linkedin, Link2 } from 'lucide-react';
import Modal from '../../../components/common/modals/Modal';
import Button from '../../../components/common/buttons/Button';

/**
 * CertificateShareModal
 * ─────────────────────────────────────────────────────────────────────────────
 * Share a certificate via copy-link or LinkedIn.
 * Reuses existing Modal and Button components — zero new UI primitives.
 */
const CertificateShareModal = ({ isOpen, onClose, certificate }) => {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const shareUrl = certificate.credentialUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(certificate.name)}&summary=${encodeURIComponent(`I earned the ${certificate.name} certificate from ${certificate.provider}!`)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Certificate"
      size="sm"
    >
      {/* Certificate preview strip */}
      <div className="flex items-center gap-3 p-4 bg-bg-page border border-border rounded-xl mb-5">
        <img
          src={certificate.thumbnail}
          alt={certificate.name}
          className="w-14 h-10 object-cover rounded-lg shrink-0"
          onError={(e) => { e.currentTarget.src = 'https://placehold.co/56x40/DBEAFE/2563EB?text=Cert'; }}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{certificate.name}</p>
          <p className="text-xs text-text-secondary">{certificate.provider}</p>
        </div>
      </div>

      {/* Copy link */}
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
        Credential URL
      </p>
      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-bg-page border border-border rounded-lg px-3 py-2 overflow-hidden">
          <Link2 className="w-3.5 h-3.5 text-text-secondary shrink-0" />
          <span className="text-xs text-text-secondary truncate">{shareUrl}</span>
        </div>
        <Button
          variant={copied ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleCopy}
          icon={copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          className="shrink-0"
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* Share options */}
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
        Share On
      </p>
      <button
        onClick={handleLinkedIn}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#0A66C2] hover:bg-[#0958a8] text-white rounded-xl transition-colors font-semibold text-sm"
      >
        <Linkedin className="w-4 h-4" />
        Share on LinkedIn
      </button>
    </Modal>
  );
};

export default CertificateShareModal;

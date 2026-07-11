import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

const SuccessToast = ({ message, onDismiss }) => {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onDismiss, 300);
    }, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed top-6 right-6 z-[100] flex items-center gap-3 bg-white border border-[#E2E8F0] rounded-xl shadow-xl px-5 py-4"
      style={{
        borderLeft: '4px solid #22C55E',
        animation: leaving
          ? 'hc-toast-out 0.3s ease-in forwards'
          : 'hc-notification-in 0.35s cubic-bezier(0.34,1.2,0.64,1) forwards',
      }}
    >
      <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22C55E' }} />
      <span className="text-[#0F172A] font-semibold text-sm">{message}</span>
      <button
        onClick={() => {
          setLeaving(true);
          setTimeout(onDismiss, 300);
        }}
        className="ml-2 text-[#94A3B8] hover:text-[#475569] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <style>{`
        @keyframes hc-notification-in {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes hc-toast-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(120%); }
        }
      `}</style>
    </div>
  );
};

export default SuccessToast;

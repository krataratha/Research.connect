import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Ban } from 'lucide-react';
import Button from '@/components/common/Button.jsx';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[var(--color-brand-bg)] text-[var(--color-brand-text-secondary)] text-center relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 max-w-md w-full glass-card p-8 rounded-2xl border border-[var(--color-brand-border)] shadow-xl flex flex-col items-center">
        {/* Ban sign icon */}
        <div className="w-16 h-16 bg-[var(--color-brand-light-purple)] text-[var(--color-brand-indigo)] rounded-full flex items-center justify-center mb-6">
          <Ban className="w-8 h-8" />
        </div>

        <h1 className="text-6xl font-extrabold font-display text-gradient mb-2">404</h1>
        <h2 className="text-xl font-bold font-display text-[var(--color-brand-text-primary)] mb-3">Document Not Found</h2>
        
        <p className="text-sm text-[var(--color-brand-text-secondary)] font-sans leading-relaxed mb-8">
          The research article, project group, or user URL you are trying to access does not exist or has been archived.
        </p>

        <Link to="/" className="w-full">
          <Button variant="primary" className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full border-t border-[var(--color-brand-border)] py-8 bg-[var(--color-brand-bg)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--color-brand-text-secondary)] font-sans">
            &copy; {new Date().getFullYear()} ResearchConnect. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">Privacy Policy</a>
          <a href="#" className="text-xs text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">Terms of Service</a>
          <a href="#" className="text-xs text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-blue)] transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

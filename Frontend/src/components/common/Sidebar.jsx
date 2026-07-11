import React, { useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Microscope } from 'lucide-react';

const Sidebar = ({
  items = [],
  isOpen = true,
  onClose,
  title = 'ResearchConnect',
  className = '',
}) => {
  /**
   * items: Array of { label, to, icon: LucideIcon, badge? }
   *   – `to`   : route path for NavLink
   *   – `icon` : a lucide-react component, e.g. Home
   *   – `badge`: optional string/number to render as a pill
   */

  /** Close sidebar on Escape (mobile overlay mode) */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    const isMobileOverlay = window.innerWidth < 1024 && isOpen;
    if (isMobileOverlay) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const navLinkBaseStyles =
    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200';
  const navLinkActiveStyles =
    'bg-[var(--color-brand-light-blue)] text-[var(--color-brand-blue)] font-semibold';
  const navLinkInactiveStyles =
    'text-[var(--color-brand-text-secondary)] hover:bg-[var(--color-brand-light-blue)]/50 hover:text-[var(--color-brand-blue)]';

  const sidebarContent = (
    <aside
      className={`flex flex-col w-64 h-full bg-[var(--color-brand-card)] border-r border-[var(--color-brand-border)] ${className}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--color-brand-border)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--color-brand-light-blue)] text-[var(--color-brand-blue)] border border-blue-200/50 rounded-lg flex items-center justify-center">
            <Microscope className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold font-display text-gradient tracking-tight">
            {title}
          </span>
        </div>

        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[var(--color-brand-text-secondary)] hover:text-[var(--color-brand-red)] hover:bg-red-50 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => {
                // Close sidebar on mobile after navigation
                if (window.innerWidth < 1024 && onClose) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `${navLinkBaseStyles} ${isActive ? navLinkActiveStyles : navLinkInactiveStyles}`
              }
            >
              {IconComponent && <IconComponent className="w-5 h-5 flex-shrink-0" />}
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge !== null && (
                <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--color-brand-blue)] text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="px-4 py-3 border-t border-[var(--color-brand-border)] flex-shrink-0">
        <p className="text-[10px] text-[var(--color-brand-text-secondary)] text-center font-sans">
          &copy; {new Date().getFullYear()} ResearchConnect
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* ─── Desktop: static sidebar ─── */}
      <div className="hidden lg:block flex-shrink-0">
        {sidebarContent}
      </div>

      {/* ─── Mobile: overlay drawer ─── */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[var(--color-brand-text-primary)]/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

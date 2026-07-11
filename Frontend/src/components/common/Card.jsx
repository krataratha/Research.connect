import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  footer,
  ...props
}) => {
  return (
    <div className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:border-[var(--color-brand-blue)]/20 ${className}`} {...props}>
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-brand-border)] pb-4 mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-bold font-display text-[var(--color-brand-text-primary)] tracking-wide">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--color-brand-text-secondary)] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Main Body Content */}
      <div className="text-sm text-[var(--color-brand-text-secondary)] leading-relaxed font-sans">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-[var(--color-brand-border)] pt-4 mt-4 flex items-center justify-end gap-2 text-xs">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

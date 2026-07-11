import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue-hover)] text-white shadow-lg shadow-blue-500/10 focus:ring-[var(--color-brand-blue)]',
    secondary: 'bg-[var(--color-brand-light-blue)] hover:bg-blue-100 text-[var(--color-brand-blue)] border border-blue-200/50 focus:ring-[var(--color-brand-blue)]',
    outline: 'bg-transparent border border-[var(--color-brand-blue)] text-[var(--color-brand-blue)] hover:bg-[var(--color-brand-light-blue)] focus:ring-[var(--color-brand-blue)]',
    danger: 'bg-[var(--color-brand-red)] hover:bg-red-600 text-white shadow-lg shadow-red-500/10 focus:ring-[var(--color-brand-red)]',
    ghost: 'bg-transparent text-[var(--color-brand-text-secondary)] hover:bg-[var(--color-brand-light-blue)] hover:text-[var(--color-brand-blue)] focus:ring-[var(--color-brand-blue)]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;

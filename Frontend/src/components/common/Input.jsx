import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  placeholder,
  className = '',
  id,
  helperText,
  required = false,
  ...props
}, ref) => {
  const inputId = id || `input-${label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random()}`;

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand-text-secondary)]">
          {label} {required && <span className="text-[var(--color-brand-red)]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        ref={ref}
        placeholder={placeholder}
        required={required}
        className={`glass-input w-full px-4 py-3 rounded-xl text-sm font-sans placeholder-slate-400 focus:outline-none text-[var(--color-brand-text-primary)] ${
          error ? 'border-[var(--color-brand-red)]/50 focus:border-[var(--color-brand-red)] focus:ring-[var(--color-brand-red)]/20' : 'border-[var(--color-brand-border)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs font-medium text-[var(--color-brand-red)] font-sans mt-0.5" id={`${inputId}-error`}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-xs text-slate-500 font-sans mt-0.5" id={`${inputId}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-14 h-14 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  /** Extract up to two initials from the name string */
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const baseStyles =
    'rounded-full flex items-center justify-center flex-shrink-0 select-none overflow-hidden';
  const colorStyles =
    'bg-[var(--color-brand-light-blue)] border border-[var(--color-brand-border)] text-[var(--color-brand-blue)]';

  // If an image src is provided, render it
  if (src) {
    return (
      <div
        className={`${baseStyles} ${colorStyles} ${sizes[size]} ${className}`}
        {...props}
      >
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Hide broken image and fall back to initials/icon rendered behind
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }

  // If a name is provided, render initials
  if (name) {
    return (
      <div
        className={`${baseStyles} ${colorStyles} ${sizes[size]} font-semibold font-sans ${className}`}
        title={name}
        {...props}
      >
        {getInitials(name)}
      </div>
    );
  }

  // Fallback: generic user icon
  return (
    <div
      className={`${baseStyles} ${colorStyles} ${sizes[size]} ${className}`}
      {...props}
    >
      <User className={iconSizes[size]} />
    </div>
  );
};

export default Avatar;

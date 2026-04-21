import React from 'react';

interface FuturisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gradient' | 'outline-glow' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function FuturisticButton({
  variant = 'gradient',
  size = 'md',
  className = '',
  children,
  ...props
}: FuturisticButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-[18px] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    gradient: 'bg-gradient-to-r from-[#34D7FF] to-[#7C5CFF] text-white hover:shadow-[0_0_24px_rgba(52,215,255,0.4)] hover:scale-[1.02] active:scale-[0.98]',
    'outline-glow': 'border-2 border-[rgba(52,215,255,0.3)] text-[#0B1220] hover:border-[rgba(52,215,255,0.6)] hover:shadow-[0_0_16px_rgba(52,215,255,0.2)] hover:bg-[rgba(52,215,255,0.05)] active:bg-[rgba(52,215,255,0.1)]',
    ghost: 'text-[#0B1220] hover:bg-[rgba(52,215,255,0.08)] active:bg-[rgba(52,215,255,0.15)]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

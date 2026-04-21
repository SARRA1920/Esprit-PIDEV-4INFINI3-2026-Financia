import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-2xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-[#0F2747] text-white hover:bg-[#1a3a5f] active:bg-[#0a1d33] shadow-sm',
    secondary: 'bg-[#F6F8FC] text-[#0F2747] hover:bg-[#E2E8F0] active:bg-[#CBD5E1]',
    outline: 'border-2 border-[#E2E8F0] text-[#0F2747] hover:border-[#CBD5E1] hover:bg-[#F6F8FC] active:bg-[#E2E8F0]',
    ghost: 'text-[#0F2747] hover:bg-[#F6F8FC] active:bg-[#E2E8F0]',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3',
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

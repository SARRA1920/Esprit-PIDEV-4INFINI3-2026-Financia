import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}

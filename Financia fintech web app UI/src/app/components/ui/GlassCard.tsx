import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ children, className = '', padding = 'md', hover = false, glow = false }: GlassCardProps) {
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-[0_0_20px_rgba(52,215,255,0.15)] hover:border-[rgba(52,215,255,0.3)] transition-all duration-300' : '';
  const glowStyles = glow ? 'shadow-[0_0_20px_rgba(52,215,255,0.1)] border-[rgba(52,215,255,0.2)]' : '';

  return (
    <div
      className={`bg-[rgba(255,255,255,0.65)] backdrop-blur-[14px] rounded-[20px] border border-[rgba(40,60,90,0.12)] shadow-sm ${paddingStyles[padding]} ${hoverStyles} ${glowStyles} ${className}`}
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.6) 100%)',
      }}
    >
      {children}
    </div>
  );
}

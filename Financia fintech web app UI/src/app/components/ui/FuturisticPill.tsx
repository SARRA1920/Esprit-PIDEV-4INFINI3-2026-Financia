import React from 'react';

interface FuturisticPillProps {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'ACTIVE' | 'OVERDUE';
  label?: string;
}

export function FuturisticPill({ status, label }: FuturisticPillProps) {
  const styles = {
    PENDING: 'bg-gradient-to-r from-amber-400/20 to-amber-500/20 text-amber-700 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    PAID: 'bg-gradient-to-r from-emerald-400/20 to-emerald-500/20 text-emerald-700 border-emerald-400/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
    FAILED: 'bg-gradient-to-r from-red-400/20 to-red-500/20 text-red-700 border-red-400/40 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
    CANCELLED: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 text-gray-700 border-gray-400/40',
    ACTIVE: 'bg-gradient-to-r from-cyan-400/20 to-cyan-500/20 text-cyan-700 border-cyan-400/40 shadow-[0_0_12px_rgba(52,215,255,0.15)]',
    OVERDUE: 'bg-gradient-to-r from-orange-400/20 to-orange-500/20 text-orange-700 border-orange-400/40 shadow-[0_0_12px_rgba(251,146,60,0.15)]',
  };

  const displayLabel = label || status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${styles[status]}`}>
      {displayLabel}
    </span>
  );
}

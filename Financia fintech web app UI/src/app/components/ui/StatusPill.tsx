import React from 'react';

interface StatusPillProps {
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'ACTIVE' | 'OVERDUE';
  label?: string;
}

export function StatusPill({ status, label }: StatusPillProps) {
  const styles = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    PAID: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    FAILED: 'bg-red-100 text-red-800 border-red-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    ACTIVE: 'bg-blue-100 text-blue-800 border-blue-200',
    OVERDUE: 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const displayLabel = label || status.charAt(0) + status.slice(1).toLowerCase();

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {displayLabel}
    </span>
  );
}

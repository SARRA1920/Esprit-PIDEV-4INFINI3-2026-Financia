interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAID' | 'OVERDUE' | 'CLOSED' | 'FAILED';
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const styles = {
    PENDING: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
    APPROVED: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
    ACTIVE: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    PAID: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
    OVERDUE: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
    CLOSED: 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20',
    FAILED: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  };

  const displayLabel = label || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${styles[status]}`}>
      {displayLabel}
    </span>
  );
}

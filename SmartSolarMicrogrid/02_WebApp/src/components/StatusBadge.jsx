import React from 'react';

export const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'pending':
      case 'pendingactivation':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'deactivated':
      case 'cancelled':
      case 'closed':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'full':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status || 'Unknown'}
    </span>
  );
};

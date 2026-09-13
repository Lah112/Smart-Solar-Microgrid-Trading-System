import React from 'react';

export const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'amber', trend }) => {
  const colorMap = {
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/30',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30',
  };

  const iconBgMap = {
    amber: 'bg-amber-500/20 text-amber-300',
    emerald: 'bg-emerald-500/20 text-emerald-300',
    blue: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
    rose: 'bg-rose-500/20 text-rose-300',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b p-5 backdrop-blur-xl shadow-lg transition-all duration-300 hover:scale-[1.02] ${colorMap[color] || colorMap.amber}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${iconBgMap[color] || iconBgMap.amber}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {trend && (
          <span className="text-xs font-semibold text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Radio,
  CalendarDays,
  QrCode,
  BatteryCharging,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { isBackoffice, isGridOperator } = useAuth();

  const backofficeNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Staff Management', path: '/admin/users', icon: Users },
    { name: 'Prosumer Accounts', path: '/admin/prosumers', icon: UserCheck },
    { name: 'Solar Node Hubs', path: '/admin/nodes', icon: Radio },
    { name: 'Slot Reservations', path: '/admin/reservations', icon: CalendarDays },
  ];

  const operatorNavItems = [
    { name: 'Station Overview', path: '/operator', icon: LayoutDashboard },
    { name: 'QR Scan & Dispatch', path: '/operator/scan-qr', icon: QrCode },
    { name: 'Battery Slots Control', path: '/operator/stations', icon: BatteryCharging },
    { name: 'Trading Queue', path: '/operator/reservations', icon: CalendarDays },
  ];

  const items = isBackoffice ? backofficeNavItems : isGridOperator ? operatorNavItems : [];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/60 p-4 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div>
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          {isBackoffice ? 'Administration Menu' : 'Operational Tools'}
        </div>
        <nav className="mt-2 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/operator'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>FAT Service API</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
          All validation rules (7-day rule, 12-hr notice, node deactivation checks) are enforced strictly on the central API.
        </p>
      </div>
    </aside>
  );
};

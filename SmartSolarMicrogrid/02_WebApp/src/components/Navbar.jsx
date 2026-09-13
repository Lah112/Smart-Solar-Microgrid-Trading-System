import React from 'react';
import { Sun, Zap, Shield, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Brand */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Sun className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              SmartSolar <span className="text-amber-400 font-extrabold">Microgrid</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block -mt-1 font-semibold">
              Trading & Grid Control Portal
            </span>
          </div>
        </div>

        {/* User Info / Actions */}
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                {user?.role}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                {user?.fullName} ({user?.nic})
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600/80 border border-rose-500/20 transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Shield className="w-4 h-4 text-slate-950" />
            <span>Portal Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

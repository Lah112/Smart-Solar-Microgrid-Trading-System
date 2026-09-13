import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Lock, User as UserIcon, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [username, setUsername] = useState('admin@smartsolar.lk');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(username, password);
    setLoading(false);

    if (res.success) {
      if (res.data.role.toLowerCase() === 'backoffice') {
        navigate('/admin');
      } else if (res.data.role.toLowerCase() === 'gridoperator') {
        navigate('/operator');
      } else {
        navigate('/');
      }
    } else {
      setError(res.error);
    }
  };

  const fillCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg shadow-amber-500/20">
            <Sun className="h-8 w-8 text-slate-950 stroke-[2.5]" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-white tracking-tight">Staff Portal Login</h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access Backoffice administration or Grid Operator dispatch tools.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              NIC or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <UserIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="ADMIN001 or admin@smartsolar.lk"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-300 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Microgrid</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Demo Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('admin@smartsolar.lk', 'Password@123')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-left transition"
            >
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Backoffice</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">ADMIN001</p>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('operator.colombo@smartsolar.lk', 'Password@123')}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-800/60 text-left transition"
            >
              <div className="flex items-center gap-1 text-blue-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Grid Operator</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">OPERATOR001</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

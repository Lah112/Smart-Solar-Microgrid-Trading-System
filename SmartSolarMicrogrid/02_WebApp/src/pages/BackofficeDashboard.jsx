import React, { useEffect, useState } from 'react';
import {
  Radio,
  UserCheck,
  CalendarDays,
  Zap,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { dashboardApi, usersApi, reservationsApi, stationsApi } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';

export const BackofficeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes, resRes, stationsRes] = await Promise.all([
        dashboardApi.getStats(),
        usersApi.getPendingActivations(),
        reservationsApi.getAll({ pageSize: 5 }),
        stationsApi.getAll(),
      ]);
      setStats(statsRes.data);
      setPendingUsers(pendingRes.data);
      setRecentReservations(resRes.data.slice(0, 6));
      setStations(stationsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveUser = async (nic) => {
    setActionLoading(nic);
    setMessage('');
    try {
      await usersApi.approveActivation(nic);
      setMessage(`User account with NIC '${nic}' has been successfully approved and activated.`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span>Backoffice Administration Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System administration, user role controls, microgrid node supervision, and transaction logs.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Solar Stations"
          value={stats ? `${stats.activeStationsCount} / ${stats.totalStationsCount}` : '...'}
          subtitle="Operating grid hubs"
          icon={Radio}
          color="amber"
        />
        <StatsCard
          title="Pending Registrations"
          value={stats ? stats.pendingActivationsCount : '0'}
          subtitle="Prosumers awaiting approval"
          icon={UserCheck}
          color="rose"
        />
        <StatsCard
          title="Active Energy Bookings"
          value={stats ? stats.activeReservationsCount : '...'}
          subtitle="Scheduled drop-offs/charges"
          icon={CalendarDays}
          color="blue"
        />
        <StatsCard
          title="Completed Traded Energy"
          value={stats ? `${stats.totalEnergyKWhTraded} kWh` : '0 kWh'}
          subtitle={`Rs. ${stats ? stats.totalRevenueLKR.toLocaleString() : 0} turnover`}
          icon={Zap}
          color="emerald"
        />
      </div>

      {/* Pending Account Activations Section */}
      {pendingUsers.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="text-base font-bold text-white">Pending Account Activations</h3>
                <p className="text-xs text-slate-400">Solar prosumers registered through mobile requiring Backoffice verification</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingUsers.length} Action Needed
            </span>
          </div>

          <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
            {pendingUsers.map((u) => (
              <div key={u.nic} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{u.fullName}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                      NIC: {u.nic}
                    </span>
                    <StatusBadge status={u.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>Email: {u.email}</span>
                    <span>Phone: {u.phone}</span>
                    <span>Solar Cap: {u.solarCapacityKWh || 5} kWh</span>
                  </div>
                </div>

                <button
                  onClick={() => handleApproveUser(u.nic)}
                  disabled={actionLoading === u.nic}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{actionLoading === u.nic ? 'Activating...' : 'Approve & Activate'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Overview & Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Microgrid Nodes Status */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              <span>Solar Grid Hub Nodes</span>
            </h3>
            <span className="text-xs text-slate-400">{stations.length} Registered</span>
          </div>

          <div className="space-y-3">
            {stations.map((s) => (
              <div
                key={s.stationCode}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">{s.stationCode}</span>
                    <span className="text-sm font-semibold text-white">{s.name}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Lat: {s.latitude.toFixed(4)}, Lon: {s.longitude.toFixed(4)} | {s.capacityKWh} kWh
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={s.isActive ? 'Active' : 'Deactivated'} />
                  <p className="text-[11px] text-slate-400 mt-1">
                    {s.availableBatterySlots} / {s.totalBatterySlots} slots
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Power Reservations */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-blue-400" />
              <span>Recent Energy Reservations</span>
            </h3>
            <span className="text-xs text-slate-400">Latest 5</span>
          </div>

          <div className="space-y-3">
            {recentReservations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No reservations found.</p>
            ) : (
              recentReservations.map((r) => (
                <div
                  key={r.reservationNumber}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">{r.reservationNumber}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.prosumerName} ({r.prosumerNic}) • {r.stationName}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(r.reservationDate).toLocaleDateString()} ({r.startTime} - {r.endTime})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-amber-300 block">{r.energyAmountKWh} kWh</span>
                    <span className="text-[11px] text-slate-400">Rs. {r.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

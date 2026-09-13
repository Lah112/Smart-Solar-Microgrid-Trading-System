import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sun,
  Zap,
  Battery,
  Shield,
  Radio,
  ArrowRight,
  TrendingUp,
  Cpu,
  Smartphone,
  Server,
  Database,
} from 'lucide-react';
import { dashboardApi, stationsApi } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';

export const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, stationsRes] = await Promise.all([
          dashboardApi.getStats(),
          stationsApi.getAll(true),
        ]);
        setStats(statsRes.data);
        setStations(stationsRes.data);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-8 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
            <Zap className="h-3.5 w-3.5" />
            <span>Next-Gen Decentralized Energy Trading Platform</span>
          </div>

          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Smart Solar <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">Microgrid Trading</span> System
          </h1>

          <p className="mt-4 text-base md:text-lg text-slate-300 leading-relaxed">
            Enterprise client-server architecture empowering solar prosumers to trade clean energy seamlessly with regional microgrid hubs, backed by centralized C# Web API on IIS and pure native Android clients.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <span>Access Staff Portal</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('architecture-overview');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-700/80 transition-all"
            >
              <Cpu className="h-4 w-4 text-amber-400" />
              <span>System Specs</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid SVG */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Sun className="w-96 h-96 text-amber-400" />
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <span>Real-Time Network Telemetry</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Active Microgrid Hubs"
            value={stats ? `${stats.activeStationsCount} / ${stats.totalStationsCount}` : '5 Nodes'}
            subtitle="Operational grid locations"
            icon={Radio}
            color="amber"
          />
          <StatsCard
            title="Registered Prosumers"
            value={stats ? stats.totalProsumersCount : '4 Accounts'}
            subtitle="Solar rooftop generators"
            icon={Sun}
            color="emerald"
          />
          <StatsCard
            title="Total Energy Traded"
            value={stats ? `${stats.totalEnergyKWhTraded} kWh` : '40.0 kWh'}
            subtitle="Drop-off & charging transactions"
            icon={Zap}
            color="blue"
          />
          <StatsCard
            title="Trading Turnover"
            value={stats ? `Rs. ${stats.totalRevenueLKR.toLocaleString()}` : 'Rs. 1,940'}
            subtitle="Settled energy volume (LKR)"
            icon={Battery}
            color="purple"
          />
        </div>
      </div>

      {/* Active Microgrid Solar Hubs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Active Solar Hub Nodes</h3>
            <p className="text-xs text-slate-400">Regional microgrid hubs equipped with battery storage and trading docks</p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
            {stations.length} Active Stations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((st) => (
            <div
              key={st.id || st.stationCode}
              className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">{st.stationCode}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{st.name}</h4>
                </div>
                <StatusBadge status={st.isActive ? 'Active' : 'Deactivated'} />
              </div>

              <p className="mt-2 text-xs text-slate-400 line-clamp-1">{st.locationDescription}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Storage Capacity</span>
                  <span className="font-semibold text-slate-200">{st.capacityKWh} kWh</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Battery Slots</span>
                  <span className="font-semibold text-emerald-400">{st.availableBatterySlots} / {st.totalBatterySlots} free</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Buy Rate</span>
                  <span className="font-semibold text-amber-300">Rs. {st.unitRateBuy}/kWh</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Hours</span>
                  <span className="font-semibold text-slate-300">{st.schedule?.openTime} - {st.schedule?.closeTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Section */}
      <div id="architecture-overview" className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h3 className="text-lg font-bold text-white mb-2">SE4040 Enterprise Architecture Overview</h3>
        <p className="text-xs text-slate-400 mb-6">Designed strictly according to FAT Service pattern and Client-Server constraints.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">C# Web API & IIS</h4>
                <span className="text-xs text-blue-400">FAT Service Pattern</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Houses all business logic (7-day booking window, 12-hour cancellation notice, node deactivation safety rules, QR signature verification).
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pure Android Client</h4>
                <span className="text-xs text-emerald-400">Native + SQLite DB</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pure native Android app without third-party cross-platform frameworks. Uses local SQLite DB for caching and JWT session persistence.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">MongoDB NoSQL</h4>
                <span className="text-xs text-amber-400">4 Core Collections</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Persists Users (NIC key), SolarStationInfo (GPS & capacity), EnergyBookingSlots (time intervals), and EnergyReservations (QR tokens).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

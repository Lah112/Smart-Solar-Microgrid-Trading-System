import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BatteryCharging,
  QrCode,
  CalendarDays,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Radio,
  Sliders,
} from 'lucide-react';
import { stationsApi, reservationsApi } from '../services/api';
import { StatsCard } from '../components/StatsCard';
import { StatusBadge } from '../components/StatusBadge';

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [activeQueue, setActiveQueue] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotAdjustVal, setSlotAdjustVal] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [stRes, resRes] = await Promise.all([
        stationsApi.getAll(true),
        reservationsApi.getAll({ status: 'Approved' }),
      ]);
      setStations(stRes.data);
      setActiveQueue(resRes.data);
      if (stRes.data.length > 0 && !selectedStation) {
        setSelectedStation(stRes.data[0]);
        setSlotAdjustVal(stRes.data[0].availableBatterySlots);
      }
    } catch (err) {
      console.error('Failed to load operator data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectStation = (st) => {
    setSelectedStation(st);
    setSlotAdjustVal(st.availableBatterySlots);
  };

  const handleUpdateSlots = async () => {
    if (!selectedStation) return;
    try {
      const updated = await stationsApi.updateBatterySlots(selectedStation.id, slotAdjustVal);
      setSelectedStation(updated.data);
      setStatusMessage(`Battery slots for '${selectedStation.name}' updated to ${slotAdjustVal}.`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update battery slots');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-amber-400" />
            <span>Grid Operator Command Console</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor live trading queues, adjust battery storage slot availability, and finalize transactions via QR verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/operator/scan-qr')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Open QR Scanner</span>
          </button>

          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Active Queued Bookings"
          value={activeQueue.length}
          subtitle="Approved prosumer slots today"
          icon={CalendarDays}
          color="amber"
        />
        <StatsCard
          title="Monitored Solar Hubs"
          value={stations.length}
          subtitle="Active microgrid nodes"
          icon={Radio}
          color="blue"
        />
        <StatsCard
          title="Current Hub Battery Slots"
          value={selectedStation ? `${selectedStation.availableBatterySlots} / ${selectedStation.totalBatterySlots}` : '...'}
          subtitle={selectedStation ? selectedStation.name : 'Select station below'}
          icon={BatteryCharging}
          color="emerald"
        />
      </div>

      {/* Main Grid: Hub Selector & Battery Slot Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hub Selector */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Operational Station</h3>
          <div className="space-y-2">
            {stations.map((st) => (
              <div
                key={st.stationCode}
                onClick={() => handleSelectStation(st)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedStation?.id === st.id
                    ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                    : 'border-slate-800 bg-slate-900/90 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-400">{st.stationCode}</span>
                  <StatusBadge status={st.isActive ? 'Active' : 'Offline'} />
                </div>
                <h4 className="text-sm font-bold text-white mt-1">{st.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Storage: {st.currentStoredKWh || 0} / {st.capacityKWh} kWh ({st.availableBatterySlots} slots free)
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Battery Slot & Node Controller */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          {selectedStation ? (
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-mono text-amber-400 font-bold">{selectedStation.stationCode}</span>
                  <h3 className="text-lg font-bold text-white">{selectedStation.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedStation.locationDescription}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Operating Hours</span>
                  <span className="text-sm font-bold text-slate-200">
                    {selectedStation.schedule?.openTime} - {selectedStation.schedule?.closeTime}
                  </span>
                </div>
              </div>

              {/* Live Battery Storage Gauge */}
              <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Energy Storage Level</span>
                  <span className="font-bold text-white">
                    {selectedStation.currentStoredKWh || 0} kWh / {selectedStation.capacityKWh} kWh
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          5,
                          ((selectedStation.currentStoredKWh || 0) / selectedStation.capacityKWh) * 100
                        )
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Slot Adjustment Control */}
              <div className="mt-6 p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Battery Slot Availability Override</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {slotAdjustVal} / {selectedStation.totalBatterySlots} Available
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max={selectedStation.totalBatterySlots}
                    value={slotAdjustVal}
                    onChange={(e) => setSlotAdjustVal(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <button
                    onClick={handleUpdateSlots}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition shrink-0"
                  >
                    Save Slots
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Slide to adjust free battery slots for real-time drop-off reservation availability.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center py-10">Select a solar station on the left to control.</p>
          )}
        </div>
      </div>

      {/* Live Operational Queue */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Today's Approved Dispatch Queue</span>
          </h3>
          <span className="text-xs text-slate-400">{activeQueue.length} Pending Execution</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {activeQueue.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No active bookings currently queued.</p>
          ) : (
            activeQueue.map((r) => (
              <div key={r.reservationNumber} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs">{r.reservationNumber}</span>
                    <span className="font-semibold text-white text-xs">{r.prosumerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({r.prosumerNic})</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {r.stationName} • {new Date(r.reservationDate).toLocaleDateString()} ({r.startTime} - {r.endTime})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 block">{r.energyAmountKWh} kWh</span>
                    <span className="text-[10px] text-slate-400">Rs. {r.totalAmount}</span>
                  </div>
                  <button
                    onClick={() => navigate('/operator/scan-qr')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
                  >
                    Verify QR
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

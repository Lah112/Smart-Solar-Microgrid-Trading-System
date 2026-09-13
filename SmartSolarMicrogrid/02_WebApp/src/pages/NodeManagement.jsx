import React, { useEffect, useState } from 'react';
import { Radio, Plus, MapPin, Battery, Clock, AlertTriangle, CheckCircle, RefreshCw, Edit } from 'lucide-react';
import { stationsApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const NodeManagement = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Create form state
  const [createForm, setCreateForm] = useState({
    stationCode: '',
    name: '',
    locationDescription: '',
    latitude: 6.9271,
    longitude: 79.8612,
    capacityKWh: 400.0,
    totalBatterySlots: 15,
    unitRateBuy: 48.5,
    unitRateSell: 56.0,
    schedule: {
      openTime: '06:00',
      closeTime: '22:00',
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  });

  const loadStations = async () => {
    setLoading(true);
    try {
      const res = await stationsApi.getAll();
      setStations(res.data);
    } catch (err) {
      console.error('Failed to load stations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    try {
      await stationsApi.create(createForm);
      setStatusMessage(`Solar Hub '${createForm.stationCode}' created successfully.`);
      setIsCreateModalOpen(false);
      loadStations();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to create station');
    }
  };

  const handleEditClick = (station) => {
    setSelectedStation(station);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    try {
      await stationsApi.update(selectedStation.id, selectedStation);
      setStatusMessage(`Station '${selectedStation.name}' updated successfully.`);
      setIsEditModalOpen(false);
      loadStations();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleDeactivate = async (station) => {
    setStatusMessage('');
    setErrorMessage('');

    if (station.isActive) {
      const confirmDeact = window.confirm(
        `Are you sure you want to DEACTIVATE station '${station.name}' (${station.stationCode})?\n\n` +
        `Note: The system will verify that NO active or pending energy reservations exist before proceeding.`
      );
      if (!confirmDeact) return;

      try {
        await stationsApi.deactivate(station.id);
        setStatusMessage(`Station '${station.name}' deactivated successfully.`);
        loadStations();
      } catch (err) {
        setErrorMessage(
          err.response?.data?.message ||
          'Failed to deactivate node. Active reservations may be present.'
        );
      }
    } else {
      try {
        await stationsApi.reactivate(station.id);
        setStatusMessage(`Station '${station.name}' reactivated successfully.`);
        loadStations();
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Reactivation failed.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Radio className="w-6 h-6 text-amber-400" />
            <span>Microgrid Solar Hub Node Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure solar microgrid hubs with GPS coordinates, capacity specs (kW/h), battery slots, and schedules. Deactivation is safely blocked if active bookings exist.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Solar Hub</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stations.map((st) => (
          <div
            key={st.stationCode}
            className={`rounded-2xl border p-5 bg-slate-900/80 backdrop-blur-sm transition-all duration-200 flex flex-col justify-between ${
              st.isActive ? 'border-slate-800 hover:border-amber-500/40' : 'border-rose-900/50 bg-rose-950/10'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400">{st.stationCode}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{st.name}</h3>
                </div>
                <StatusBadge status={st.isActive ? 'Active' : 'Deactivated'} />
              </div>

              <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>{st.locationDescription}</span>
              </div>

              <div className="mt-1 text-[11px] font-mono text-slate-500 pl-5">
                GPS: {st.latitude.toFixed(4)}° N, {st.longitude.toFixed(4)}° E
              </div>

              {/* Specs */}
              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Storage Capacity</span>
                  <span className="font-semibold text-slate-200">{st.capacityKWh} kW/h</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Battery Slots</span>
                  <span className="font-semibold text-emerald-400">
                    {st.availableBatterySlots} / {st.totalBatterySlots} free
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Rates (Buy / Sell)</span>
                  <span className="font-semibold text-amber-300">
                    Rs.{st.unitRateBuy} / Rs.{st.unitRateSell}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Operating Hours</span>
                  <span className="font-semibold text-slate-300">
                    {st.schedule?.openTime} - {st.schedule?.closeTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
              <button
                onClick={() => handleEditClick(st)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                Edit Hub
              </button>

              <button
                onClick={() => handleToggleDeactivate(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  st.isActive
                    ? 'text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20'
                    : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                {st.isActive ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Solar Microgrid Hub">
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Station Code *</label>
              <input
                type="text"
                required
                value={createForm.stationCode}
                onChange={(e) => setCreateForm({ ...createForm, stationCode: e.target.value })}
                placeholder="HUB-JAF-02"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Station Name *</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Jaffna Central Solar Dock"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Location Description</label>
            <input
              type="text"
              value={createForm.locationDescription}
              onChange={(e) => setCreateForm({ ...createForm, locationDescription: e.target.value })}
              placeholder="Main A9 Road, Solar Plaza"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Latitude (GPS) *</label>
              <input
                type="number"
                step="0.0001"
                required
                value={createForm.latitude}
                onChange={(e) => setCreateForm({ ...createForm, latitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Longitude (GPS) *</label>
              <input
                type="number"
                step="0.0001"
                required
                value={createForm.longitude}
                onChange={(e) => setCreateForm({ ...createForm, longitude: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Capacity (kW/h) *</label>
              <input
                type="number"
                step="10"
                required
                value={createForm.capacityKWh}
                onChange={(e) => setCreateForm({ ...createForm, capacityKWh: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Battery Storage Slots *</label>
              <input
                type="number"
                required
                value={createForm.totalBatterySlots}
                onChange={(e) => setCreateForm({ ...createForm, totalBatterySlots: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Open Time</label>
              <input
                type="text"
                value={createForm.schedule.openTime}
                onChange={(e) => setCreateForm({ ...createForm, schedule: { ...createForm.schedule, openTime: e.target.value } })}
                placeholder="06:00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Close Time</label>
              <input
                type="text"
                value={createForm.schedule.closeTime}
                onChange={(e) => setCreateForm({ ...createForm, schedule: { ...createForm.schedule, closeTime: e.target.value } })}
                placeholder="22:00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
            >
              Create Station
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedStation && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Station (${selectedStation.stationCode})`}
        >
          <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Station Name</label>
              <input
                type="text"
                required
                value={selectedStation.name}
                onChange={(e) => setSelectedStation({ ...selectedStation, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Location Description</label>
              <input
                type="text"
                value={selectedStation.locationDescription}
                onChange={(e) => setSelectedStation({ ...selectedStation, locationDescription: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Capacity (kW/h)</label>
                <input
                  type="number"
                  step="10"
                  required
                  value={selectedStation.capacityKWh}
                  onChange={(e) => setSelectedStation({ ...selectedStation, capacityKWh: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Battery Slots</label>
                <input
                  type="number"
                  required
                  value={selectedStation.totalBatterySlots}
                  onChange={(e) => setSelectedStation({ ...selectedStation, totalBatterySlots: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Available Slots</label>
                <input
                  type="number"
                  required
                  value={selectedStation.availableBatterySlots}
                  onChange={(e) => setSelectedStation({ ...selectedStation, availableBatterySlots: parseInt(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Buy Rate (Rs/kWh)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={selectedStation.unitRateBuy}
                  onChange={(e) => setSelectedStation({ ...selectedStation, unitRateBuy: parseFloat(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
              >
                Save Updates
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

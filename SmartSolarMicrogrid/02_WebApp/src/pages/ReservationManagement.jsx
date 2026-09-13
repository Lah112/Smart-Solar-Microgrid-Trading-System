import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  RefreshCw,
  QrCode,
  AlertTriangle,
} from 'lucide-react';
import { reservationsApi, stationsApi, usersApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stationFilter, setStationFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionSummary, setActionSummary] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    prosumerNic: '981234567V',
    stationId: '',
    reservationDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    transferType: 'DropOff_SolarEnergy',
    energyAmountKWh: 15.0,
    notes: 'Power grid tie-in drop-off',
  });

  const [updateForm, setUpdateForm] = useState({
    energyAmountKWh: 20.0,
    startTime: '09:00',
    endTime: '10:00',
    notes: '',
  });

  const [cancelReason, setCancelReason] = useState('Rescheduling solar dispatch time');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRes, stRes] = await Promise.all([
        reservationsApi.getAll({
          status: statusFilter || undefined,
          stationId: stationFilter || undefined,
          searchKeyword: searchTerm || undefined,
        }),
        stationsApi.getAll(true),
      ]);
      setReservations(resRes.data);
      setStations(stRes.data);
      if (stRes.data.length > 0 && !createForm.stationId) {
        setCreateForm((prev) => ({ ...prev, stationId: stRes.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, stationFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await reservationsApi.create({
        ...createForm,
        reservationDate: new Date(createForm.reservationDate).toISOString(),
      });
      setActionSummary(res.data);
      setIsCreateOpen(false);
      setIsSummaryOpen(true);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Creation failed (7-day rule violation or inactive hub)');
    }
  };

  const handleUpdateClick = (res) => {
    setSelectedReservation(res);
    setUpdateForm({
      energyAmountKWh: res.energyAmountKWh,
      startTime: res.startTime,
      endTime: res.endTime,
      notes: res.notes || '',
    });
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await reservationsApi.update(selectedReservation.id, updateForm);
      setActionSummary(res.data);
      setIsUpdateOpen(false);
      setIsSummaryOpen(true);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Modification failed (12-hour notice rule enforced)');
    }
  };

  const handleCancelClick = (res) => {
    setSelectedReservation(res);
    setIsCancelOpen(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    try {
      const res = await reservationsApi.cancel(selectedReservation.id, { reason: cancelReason });
      setActionSummary(res.data);
      setIsCancelOpen(false);
      setIsSummaryOpen(true);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Cancellation failed (12-hour notice rule enforced)');
    }
  };

  const handleApprove = async (res) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      const resp = await reservationsApi.approve(res.id);
      setActionSummary(resp.data);
      setIsSummaryOpen(true);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Approval failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-blue-400" />
            <span>Energy Slot Reservation Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage power trading reservations with automatic 7-day schedule bounds and 12-hour notice rule enforcement.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Energy Reservation</span>
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

      {/* Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Res #, Prosumer NIC, Station name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <select
          value={stationFilter}
          onChange={(e) => setStationFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Stations</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.stationCode})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Ref #</th>
                <th className="px-5 py-3.5">Prosumer (NIC)</th>
                <th className="px-5 py-3.5">Station & Slot Date</th>
                <th className="px-5 py-3.5">Energy & Type</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    {loading ? 'Loading reservations...' : 'No reservations found.'}
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.reservationNumber} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      {r.reservationNumber}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-200 block">{r.prosumerName}</span>
                      <span className="font-mono text-[11px] text-amber-400">NIC: {r.prosumerNic}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-300">{r.stationName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>{new Date(r.reservationDate).toLocaleDateString()} ({r.startTime} - {r.endTime})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-amber-300 block">{r.energyAmountKWh} kWh</span>
                      <span className="text-[11px] text-slate-400">
                        {r.transferType.includes('DropOff') ? 'Drop-Off to Grid' : 'Grid Charge'} (Rs. {r.totalAmount})
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {r.status === 'Pending' && (
                        <button
                          onClick={() => handleApprove(r)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                        >
                          Approve
                        </button>
                      )}

                      {(r.status === 'Approved' || r.status === 'Pending') && (
                        <>
                          <button
                            onClick={() => handleUpdateClick(r)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCancelClick(r)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Power Trading Reservation">
        <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Prosumer NIC *</label>
            <input
              type="text"
              required
              value={createForm.prosumerNic}
              onChange={(e) => setCreateForm({ ...createForm, prosumerNic: e.target.value })}
              placeholder="981234567V"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Microgrid Hub *</label>
            <select
              required
              value={createForm.stationId}
              onChange={(e) => setCreateForm({ ...createForm, stationId: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.stationCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Reservation Date (Max 7 days) *</label>
              <input
                type="date"
                required
                value={createForm.reservationDate}
                onChange={(e) => setCreateForm({ ...createForm, reservationDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Transfer Type *</label>
              <select
                value={createForm.transferType}
                onChange={(e) => setCreateForm({ ...createForm, transferType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="DropOff_SolarEnergy">Drop-Off Solar Energy to Grid</option>
                <option value="Charging">Charge Battery from Grid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Start Time *</label>
              <input
                type="text"
                required
                value={createForm.startTime}
                onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                placeholder="09:00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">End Time *</label>
              <input
                type="text"
                required
                value={createForm.endTime}
                onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                placeholder="10:00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amount (kW/h) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={createForm.energyAmountKWh}
                onChange={(e) => setCreateForm({ ...createForm, energyAmountKWh: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
            >
              Submit Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Modal (12-hr rule) */}
      {selectedReservation && (
        <Modal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          title={`Modify Reservation (${selectedReservation.reservationNumber})`}
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
              Note: Modifications require at least 12 hours notice prior to scheduled time.
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Energy Amount (kW/h)</label>
              <input
                type="number"
                step="0.5"
                required
                value={updateForm.energyAmountKWh}
                onChange={(e) => setUpdateForm({ ...updateForm, energyAmountKWh: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Start Time</label>
                <input
                  type="text"
                  value={updateForm.startTime}
                  onChange={(e) => setUpdateForm({ ...updateForm, startTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">End Time</label>
                <input
                  type="text"
                  value={updateForm.endTime}
                  onChange={(e) => setUpdateForm({ ...updateForm, endTime: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsUpdateOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
              >
                Save Modifications
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Cancel Modal (12-hr rule) */}
      {selectedReservation && (
        <Modal
          isOpen={isCancelOpen}
          onClose={() => setIsCancelOpen(false)}
          title={`Cancel Reservation (${selectedReservation.reservationNumber})`}
        >
          <form onSubmit={handleCancelSubmit} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
              Are you sure you want to cancel this reservation? Requires at least 12 hours notice.
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Cancellation Reason *</label>
              <textarea
                rows="3"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCancelOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition"
              >
                Confirm Cancellation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Summary / QR Result Modal */}
      {actionSummary && (
        <Modal isOpen={isSummaryOpen} onClose={() => setIsSummaryOpen(false)} title="Transaction Summary & QR Dispatch">
          <div className="space-y-4 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              {actionSummary.message}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Reservation Reference:</span>
                <span className="font-mono font-bold text-amber-400">{actionSummary.reservationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Prosumer:</span>
                <span className="font-semibold text-white">{actionSummary.prosumerName} ({actionSummary.prosumerNic})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Solar Hub:</span>
                <span className="text-slate-200">{actionSummary.stationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Slot Schedule:</span>
                <span className="text-slate-200">{actionSummary.formattedDateTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Traded Volume:</span>
                <span className="font-bold text-emerald-400">{actionSummary.energyAmountKWh} kW/h (Rs. {actionSummary.totalAmount})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <StatusBadge status={actionSummary.status} />
              </div>
            </div>

            {actionSummary.qrCodeBase64 && (
              <div className="mt-4 p-4 rounded-2xl border border-slate-800 bg-white/95 inline-block mx-auto shadow-xl">
                <img
                  src={actionSummary.qrCodeBase64}
                  alt="Transaction QR"
                  className="w-48 h-48 mx-auto"
                />
                <p className="mt-2 text-[10px] font-mono text-slate-800 font-bold">
                  SECURE TRANSACTION QR TOKEN
                </p>
              </div>
            )}

            <button
              onClick={() => setIsSummaryOpen(false)}
              className="w-full py-2.5 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition text-xs"
            >
              Close Summary
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

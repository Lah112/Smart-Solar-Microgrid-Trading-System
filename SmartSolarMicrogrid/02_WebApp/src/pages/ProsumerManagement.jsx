import React, { useEffect, useState } from 'react';
import { UserCheck, Search, CheckCircle, Edit, RefreshCw, Sun, Plus } from 'lucide-react';
import { usersApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const ProsumerManagement = () => {
  const [prosumers, setProsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProsumer, setSelectedProsumer] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    solarCapacityKWh: 5.0,
  });

  const loadProsumers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll('Prosumer', statusFilter || undefined);
      setProsumers(res.data);
    } catch (err) {
      console.error('Failed to load prosumers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProsumers();
  }, [statusFilter]);

  const handleEditClick = (p) => {
    setSelectedProsumer(p);
    setEditForm({
      fullName: p.fullName || '',
      email: p.email || '',
      phone: p.phone || '',
      address: p.address || '',
      solarCapacityKWh: p.solarCapacityKWh || 5.0,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await usersApi.updateProfile(selectedProsumer.nic, editForm);
      setStatusMessage(`Prosumer profile '${selectedProsumer.nic}' updated successfully.`);
      setIsEditModalOpen(false);
      loadProsumers();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleStatus = async (p) => {
    const isDeactivated = p.status === 'Deactivated' || !p.isActive;
    const confirmMsg = isDeactivated
      ? `Reactivate prosumer '${p.fullName}' (${p.nic})? (Backoffice Authority)`
      : `Deactivate prosumer '${p.fullName}' (${p.nic})?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isDeactivated) {
        await usersApi.reactivate(p.nic);
        setStatusMessage(`Prosumer '${p.fullName}' reactivated.`);
      } else {
        await usersApi.deactivate(p.nic);
        setStatusMessage(`Prosumer '${p.fullName}' deactivated.`);
      }
      loadProsumers();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleApprove = async (nic) => {
    try {
      await usersApi.approveActivation(nic);
      setStatusMessage(`Prosumer '${nic}' approved and activated.`);
      loadProsumers();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const filtered = prosumers.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(term) ||
      p.nic?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-400" />
            <span>Solar Prosumer Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage solar prosumer profiles using NIC as primary key. Deactivated accounts can only be reactivated by Backoffice.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prosumers by NIC, Name, Email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="PendingActivation">Pending Activation</option>
          <option value="Deactivated">Deactivated</option>
        </select>

        <button
          onClick={loadProsumers}
          className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Prosumer NIC</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Solar Specs</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                    {loading ? 'Loading prosumers...' : 'No prosumers matching criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.nic} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 font-mono font-bold text-amber-400">
                      {p.nic}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white">
                      {p.fullName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                        <Sun className="w-3.5 h-3.5" />
                        {p.solarCapacityKWh || 5} kWh Array
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      <div>{p.email}</div>
                      <div className="text-[11px] text-slate-500">{p.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {p.status === 'PendingActivation' && (
                        <button
                          onClick={() => handleApprove(p.nic)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        onClick={() => handleEditClick(p)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
                      >
                        Edit
                      </button>

                      {p.status === 'Deactivated' || !p.isActive ? (
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition"
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Prosumer Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Prosumer Profile (${selectedProsumer?.nic})`}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email</label>
              <input
                type="email"
                required
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone</label>
              <input
                type="text"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Rooftop Solar Array Capacity (kW/h)</label>
            <input
              type="number"
              step="0.5"
              required
              value={editForm.solarCapacityKWh}
              onChange={(e) => setEditForm({ ...editForm, solarCapacityKWh: parseFloat(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Premises Address</label>
            <textarea
              rows="2"
              value={editForm.address}
              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
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
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

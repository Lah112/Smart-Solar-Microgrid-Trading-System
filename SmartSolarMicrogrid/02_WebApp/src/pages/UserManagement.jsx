import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import { usersApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    nic: '',
    fullName: '',
    email: '',
    password: '',
    role: 'GridOperator',
    phone: '',
    address: '',
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll(roleFilter || undefined);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setStatusMessage('');
    try {
      await usersApi.createStaff(formData);
      setStatusMessage(`Staff user ${formData.fullName} (${formData.nic}) created successfully.`);
      setIsModalOpen(false);
      setFormData({
        nic: '',
        fullName: '',
        email: '',
        password: '',
        role: 'GridOperator',
        phone: '',
        address: '',
      });
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const isActivating = user.status === 'Deactivated' || !user.isActive;
    const confirmMsg = isActivating
      ? `Are you sure you want to REACTIVATE user '${user.fullName}' (${user.nic})?`
      : `Are you sure you want to DEACTIVATE user '${user.fullName}' (${user.nic})?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isActivating) {
        await usersApi.reactivate(user.nic);
        setStatusMessage(`User ${user.fullName} reactivated successfully.`);
      } else {
        await usersApi.deactivate(user.nic);
        setStatusMessage(`User ${user.fullName} deactivated.`);
      }
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Status change failed');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(term) ||
      u.nic?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            <span>Staff & User Administration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create Backoffice officers and Grid Operators, assign security roles, and manage access privileges.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Staff User</span>
        </button>
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
            placeholder="Search users by Name, NIC, Email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs text-slate-300 focus:border-amber-400 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="Backoffice">Backoffice Admin</option>
          <option value="GridOperator">Grid Operator</option>
          <option value="Prosumer">Prosumer</option>
        </select>

        <button
          onClick={loadUsers}
          className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">User / NIC</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                    {loading ? 'Loading users...' : 'No users matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.nic} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4">
                      <span className="font-bold text-white block">{u.fullName}</span>
                      <span className="font-mono text-xs text-amber-400">NIC: {u.nic}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 font-semibold text-slate-200">
                        <Shield className="w-3 h-3 text-amber-400" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      <div>{u.email}</div>
                      <div className="text-[11px] text-slate-500">{u.phone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {u.status === 'Deactivated' || !u.isActive ? (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
                        >
                          Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition"
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

      {/* Modal for Creating Staff User */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Staff User">
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">National Identity Card (NIC) *</label>
            <input
              type="text"
              required
              value={formData.nic}
              onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
              placeholder="e.g. OPERATOR003 or 881234567V"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Sunil Perera"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="sunil@smartsolar.lk"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="GridOperator">Grid Operator</option>
                <option value="Backoffice">Backoffice Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password@123"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+94771234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Assigned Station / Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Solar Hub Colombo Central"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition"
            >
              {actionLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

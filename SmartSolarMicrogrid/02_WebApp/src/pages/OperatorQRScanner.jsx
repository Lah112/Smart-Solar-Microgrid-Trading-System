import React, { useEffect, useState } from 'react';
import {
  QrCode,
  CheckCircle,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Search,
  ScanLine,
  Check,
} from 'lucide-react';
import { reservationsApi } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const OperatorQRScanner = () => {
  const [qrInput, setQrInput] = useState('');
  const [operatorNotes, setOperatorNotes] = useState('Meter verified. Grid tie-in completed successfully.');
  const [loading, setLoading] = useState(false);
  const [verifiedSummary, setVerifiedSummary] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentApproved, setRecentApproved] = useState([]);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await reservationsApi.getAll({ status: 'Approved' });
        setRecentApproved(res.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load approved bookings', err);
      }
    };
    fetchApproved();
  }, []);

  const handleVerify = async (e) => {
    e?.preventDefault();
    if (!qrInput.trim()) return;

    setLoading(true);
    setErrorMessage('');
    setVerifiedSummary(null);

    try {
      const res = await reservationsApi.verifyQr({
        qrToken: qrInput.trim(),
        operatorNotes: operatorNotes,
      });
      setVerifiedSummary(res.data);
      setQrInput('');
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
        'Verification failed. Invalid QR code token or transaction already completed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (res) => {
    setQrInput(res.qrCodePayload || res.qrCodeToken || res.reservationNumber);
    setErrorMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <QrCode className="w-6 h-6 text-amber-400" />
          <span>Grid Operator QR Dispatch & Energy Finalizer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Scan or input the prosumer's transaction QR code to verify live server records and finalize the energy transfer transaction.
        </p>
      </div>

      {/* Verification Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-6 border-b border-slate-800">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ScanLine className="w-10 h-10 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Live Station QR Terminal</h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports raw QR token strings, JSON QR payload, or Reservation reference numbers (e.g. RES-2026-0001).
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Transaction Verification Blocked</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {verifiedSummary && (
          <div className="mt-6 p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-300 space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="text-base font-bold text-white">Energy Transfer Finalized Successfully!</h4>
                <p className="text-emerald-400 text-xs">{verifiedSummary.message}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Reservation</span>
                <span className="font-mono font-bold text-white">{verifiedSummary.reservationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Prosumer</span>
                <span className="font-semibold">{verifiedSummary.prosumerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Station</span>
                <span className="font-semibold">{verifiedSummary.stationName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Volume Settled</span>
                <span className="font-bold text-amber-300">{verifiedSummary.energyAmountKWh} kWh (Rs. {verifiedSummary.totalAmount})</span>
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleVerify} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              QR Code Payload / Token / Res # *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder='e.g. RES-2026-0001 or {"resNo":"RES-2026-0001"...}'
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 py-3.5 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !qrInput.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Finalize Transfer'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Operator Physical Inspection Notes
            </label>
            <input
              type="text"
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              placeholder="e.g. Inverter synchronized. Transfer meter verified."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>
        </form>

        {/* Quick Test Demo Section */}
        {recentApproved.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Quick Test: Select an Approved Pending Booking to Scan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {recentApproved.map((res) => (
                <button
                  key={res.reservationNumber}
                  type="button"
                  onClick={() => handleSelectSample(res)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 text-left transition flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-400 block">
                      {res.reservationNumber}
                    </span>
                    <span className="text-xs text-white">{res.prosumerName}</span>
                    <span className="text-[10px] text-slate-400 block">{res.stationName} • {res.energyAmountKWh} kWh</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Test Scan
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

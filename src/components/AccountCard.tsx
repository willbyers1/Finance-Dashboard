import React, { useState } from 'react';
import { Institution, FinancialAccount } from '../types';
import { Landmark, CreditCard, Wallet, TrendingUp, RefreshCw, Trash2, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';

interface AccountCardProps {
  institution: Institution & { accounts: FinancialAccount[] };
  onSync: () => void;
  isSyncing: boolean;
  onDisconnect: (instId: string) => Promise<void>;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  institution,
  onSync,
  isSyncing,
  onDisconnect,
}) => {
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatCurrency = (val: number) => `$${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <CreditCard className="w-4 h-4 text-rose-600" />;
      case 'investment':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      default:
        return <Wallet className="w-4 h-4 text-indigo-600" />;
    }
  };

  const handleDisconnectConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDisconnect(institution.id);
    } catch (err) {
      console.error('Error disconnecting institution:', err);
    } finally {
      setIsDeleting(false);
      setShowConfirmDisconnect(false);
    }
  };

  return (
    <div id={`inst-card-${institution.id}`} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Institution Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-base shadow-2xs">
            {institution.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              {institution.name}
              <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">
                Active
              </span>
            </h4>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Last synced: {institution.updatedAt ? new Date(institution.updatedAt).toLocaleTimeString() : 'Just now'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmDisconnect(true)}
          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Disconnect Institution"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Account Items List */}
      <div className="space-y-2">
        {institution.accounts.map((acc) => (
          <div
            key={acc.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                {getAccountIcon(acc.type)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <span>{acc.name}</span>
                  <span className="text-slate-500 font-mono text-[11px]">•••• {acc.mask}</span>
                </div>
                <div className="text-[10px] text-slate-500 capitalize">{acc.officialName || acc.type}</div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-extrabold text-slate-900 text-sm">
                {formatCurrency(acc.currentBalance)}
              </div>
              {acc.availableBalance !== undefined && acc.availableBalance !== acc.currentBalance && (
                <div className="text-[10px] text-slate-500">
                  Avail: {formatCurrency(acc.availableBalance)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Disconnect Confirmation Modal */}
      {showConfirmDisconnect && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Disconnect {institution.name}?</h4>
              <p className="text-xs text-slate-500 mt-1">
                This will remove the encrypted access token and associated financial accounts.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDisconnect(false)}
                className="w-1/2 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectConfirm}
                disabled={isDeleting}
                className="w-1/2 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { X, Landmark, ShieldCheck, CheckCircle2, Lock, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { INST_PRESETS } from '../lib/plaidService';

interface PlaidLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExchangeToken: (publicToken: string, instPresetId: string) => Promise<void>;
}

export const PlaidLinkModal: React.FC<PlaidLinkModalProps> = ({ isOpen, onClose, onExchangeToken }) => {
  const [selectedInst, setSelectedInst] = useState(INST_PRESETS[0]);
  const [step, setStep] = useState<'select' | 'auth' | 'exchanging' | 'success'>('select');
  const [username, setUsername] = useState('user_good');
  const [password, setPassword] = useState('pass_good');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setError(null);
    setStep('exchanging');

    try {
      // Simulate Plaid public_token generation
      const publicToken = `public-sandbox-sim-${selectedInst.id}-${Date.now()}`;
      await onExchangeToken(publicToken, selectedInst.id);
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('select');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to connect institution');
      setStep('auth');
    }
  };

  return (
    <div id="plaid-modal-backdrop" className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Plaid Link Authentication</h3>
              <p className="text-[11px] text-slate-500">Secure 256-bit token exchange</p>
            </div>
          </div>
          <button
            id="btn-close-plaid-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Select Financial Institution */}
        {step === 'select' && (
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-3">
              Select your financial institution:
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {INST_PRESETS.map((inst) => (
                <button
                  key={inst.id}
                  onClick={() => setSelectedInst(inst)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${
                    selectedInst.id === inst.id
                      ? 'bg-slate-50 border-indigo-600 text-slate-900 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: inst.primaryColor }}
                    >
                      {inst.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{inst.name}</div>
                      <div className="text-[10px] text-slate-500">Checking, Savings, Credit & Brokerage</div>
                    </div>
                  </div>
                  {selectedInst.id === inst.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                id="btn-plaid-continue"
                onClick={() => setStep('auth')}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <span>Continue with {selectedInst.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Bank Credentials Input */}
        {step === 'auth' && (
          <div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                style={{ backgroundColor: selectedInst.primaryColor }}
              >
                {selectedInst.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedInst.name}</h4>
                <p className="text-[10px] text-indigo-600 font-semibold">Plaid Secure Sandbox Mode</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Online ID / Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-indigo-50 border border-indigo-200/60 text-[10px] text-slate-700 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Credentials pass through end-to-end token encryption. Tokens are saved securely server-side.</span>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-between items-center">
              <button
                onClick={() => setStep('select')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                &larr; Back
              </button>
              <button
                id="btn-plaid-submit"
                onClick={handleConnect}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit & Link Account</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Exchanging Token */}
        {step === 'exchanging' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
            <div>
              <h4 className="font-bold text-slate-900 text-base">Exchanging Plaid Public Token...</h4>
              <p className="text-xs text-slate-500 mt-1">Encrypting access token at rest & synchronizing initial transactions</p>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-slate-900 text-lg">Institution Connected!</h4>
            <p className="text-xs text-slate-500">Accounts and transactions imported successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
};

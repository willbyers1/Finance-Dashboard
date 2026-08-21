import React from 'react';
import { X, FileText, ShieldCheck, Database, Key, Terminal, Lock } from 'lucide-react';

interface READMEModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const READMEModal: React.FC<READMEModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="readme-modal-backdrop" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Architecture & Plaid Integration Guide</h2>
            <p className="text-xs text-slate-400">Personal Finance Dashboard FinTech Architecture</p>
          </div>
        </div>

        <div className="space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          {/* Section 1: Overview */}
          <div>
            <h3 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> 1. Overview & Security Design
            </h3>
            <p>
              The Personal Finance Dashboard is a full-stack financial technology application built with Express, Vite, React 19, and TypeScript. All sensitive Plaid operations (link token creation, public token exchange, access token storage) execute strictly server-side.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
              <li>Access tokens are encrypted at rest using server-side AES-256-GCM.</li>
              <li>Data is strictly scoped to the authenticated user ID obtained from JWT cookies.</li>
              <li>Raw bank credentials or unencrypted access tokens are never exposed to the client browser.</li>
            </ul>
          </div>

          {/* Section 2: Environment Variables */}
          <div>
            <h3 className="text-sm font-bold text-sky-400 mb-2 flex items-center gap-1.5">
              <Key className="w-4 h-4" /> 2. Environment Configuration (.env)
            </h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
              <div>DATABASE_URL="postgresql://user:pass@localhost:5432/fintech_db"</div>
              <div>PLAID_CLIENT_ID="your_plaid_client_id"</div>
              <div>PLAID_SECRET="your_plaid_secret_key"</div>
              <div>PLAID_ENV="sandbox" # or development / production</div>
              <div>ENCRYPTION_KEY="32_character_aes_secret_key"</div>
              <div>AUTH_SECRET="jwt_auth_secret_key"</div>
              <div>GEMINI_API_KEY="your_google_ai_studio_key"</div>
            </div>
          </div>

          {/* Section 3: Plaid Synchronization */}
          <div>
            <h3 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <Terminal className="w-4 h-4" /> 3. Plaid Token Exchange & Sync Flow
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-400">
              <li>Client requests link token via <code className="text-emerald-300">POST /api/plaid/create-link-token</code></li>
              <li>Client launches Plaid Link modal & receives public token.</li>
              <li>Server exchanges public token via <code className="text-emerald-300">POST /api/plaid/exchange-token</code></li>
              <li>Server encrypts access token & saves institution + accounts.</li>
              <li>Idempotent transaction sync executes without duplicates.</li>
            </ol>
          </div>

          {/* Section 4: Database Schema */}
          <div>
            <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> 4. Normalized Data Schema
            </h3>
            <p className="text-slate-400">
              Models are normalized into User, Institution, FinancialAccount, Transaction, Budget, and SyncState. User category overrides take precedence and are retained across subsequent bank synchronizations.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Landmark, ShieldCheck, Lock, LineChart, PieChart, Layers, ArrowRight, Zap, RefreshCw, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Banner */}
      <div className="bg-indigo-50 border-b border-indigo-200/60 px-4 py-2 text-center text-xs text-indigo-900 font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
        <span>Plaid API Integration & AES-256 Encrypted Token Storage Engine</span>
        <button onClick={onStartDemo} className="underline text-indigo-600 hover:text-indigo-800 font-bold ml-1">
          Launch Live Sandbox &rarr;
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-slate-700 font-semibold mb-8 shadow-xs">
          <Landmark className="w-4 h-4 text-indigo-600" />
          <span>Next-Gen FinTech Management Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Understand where your <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600">money goes</span> every month.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Connect your bank and financial accounts securely through Plaid. Automatically import transactions, categorize expenses, track monthly cash flow, and discover actionable spending insights.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            id="btn-landing-demo"
            onClick={onStartDemo}
            className="w-full sm:w-auto px-7 py-3.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Explore Live Sandbox Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            id="btn-landing-auth"
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            Sign In / Register
          </button>
        </div>

        {/* Security Badges */}
        <div className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>256-Bit AES Encrypted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Plaid API Integration</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Real-time Sync</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Built for financial clarity and effortless tracking
            </h2>
            <p className="mt-3 text-slate-500 text-sm">
              All your accounts in one unified dashboard with zero manual spreadsheet entry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-600 mb-5">
                <Landmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Plaid Account Connectivity</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connect checking, savings, credit cards, and investment accounts seamlessly with bank-grade token authentication.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200/60 flex items-center justify-center text-sky-600 mb-5">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Categorization</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Smart normalization categorizes transactions into Housing, Groceries, Dining, and Subscriptions with user override memory.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 mb-5">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Visual Cash Flow Analytics</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Interactive monthly charts and spending breakdowns reveal trends, net savings, and budget status in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">How It Works</h2>
          <p className="mt-2 text-slate-500 text-sm">Four simple steps to complete financial oversight</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Step 01</div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Connect Accounts</h4>
            <p className="text-slate-500 text-xs">Authenticate your institution securely via official Plaid Link.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Step 02</div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Import & Sync</h4>
            <p className="text-slate-500 text-xs">Transactions are synchronized idempotently with zero duplicates.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Step 03</div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Auto-Categorize</h4>
            <p className="text-slate-500 text-xs">Categories are mapped and normalized automatically with override options.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Step 04</div>
            <h4 className="font-bold text-slate-900 text-base mb-1">Analyze & Budget</h4>
            <p className="text-slate-500 text-xs">Inspect interactive charts, budget progress, and AI recommendations.</p>
          </div>
        </div>
      </section>

      {/* Security Guarantee Box */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bank-Grade Privacy & Security</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Plaid access tokens are encrypted at rest using server-side 256-bit AES-GCM encryption key. Raw bank passwords or account credentials are never stored or seen by our servers. All database records are strictly scoped to your authenticated identity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <Landmark className="w-4 h-4 text-indigo-600" />
            <span>Personal Finance Dashboard</span>
          </div>
          <div>&copy; {new Date().getFullYear()} FinTech Architecture. Built for security & clarity.</div>
        </div>
      </footer>
    </div>
  );
};

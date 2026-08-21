import React from 'react';
import { LayoutDashboard, ReceiptText, Building2, Wallet, Sparkles, HelpCircle } from 'lucide-react';

export type TabType = 'overview' | 'transactions' | 'accounts' | 'budgets' | 'insights';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenDocs: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenDocs }) => {
  const navItems = [
    { id: 'overview' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as TabType, label: 'Transactions', icon: ReceiptText },
    { id: 'accounts' as TabType, label: 'Accounts', icon: Building2 },
    { id: 'budgets' as TabType, label: 'Budgets', icon: Wallet },
    { id: 'insights' as TabType, label: 'AI Insights', icon: Sparkles, badge: 'Gemini' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside id="desktop-sidebar" className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 text-slate-700 min-h-[calc(100vh-4rem)] p-4 shrink-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 mb-3">
          Menu
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60'
                    : 'hover:bg-slate-100 hover:text-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Security & System Info Footer */}
        <div className="pt-4 mt-auto border-t border-slate-200 space-y-3">
          <button
            id="btn-sidebar-docs"
            onClick={onOpenDocs}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            <span>Architecture & Security</span>
          </button>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Plaid Sandbox Ready
            </div>
            AES-256 encrypted access tokens at rest. User-scoped financial state.
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav id="mobile-bottom-nav" className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-2 flex justify-around items-center text-slate-500 backdrop-blur-md shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

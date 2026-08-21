import React from 'react';
import { User } from '../types';
import { Landmark, RefreshCw, LogOut, ShieldCheck, FileCode2, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onOpenConnectModal: () => void;
  onOpenAuthModal: () => void;
  onOpenDocsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onSync,
  isSyncing,
  onOpenConnectModal,
  onOpenAuthModal,
  onOpenDocsModal,
}) => {
  return (
    <header id="main-navbar" className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/20">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Personal Finance
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
              Plaid Connected
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="btn-open-docs"
            onClick={onOpenDocsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-all"
            title="Setup & Architecture Docs"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Setup Docs</span>
          </button>

          {user ? (
            <>
              <button
                id="btn-sync-now"
                onClick={onSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <button
                id="btn-connect-account-nav"
                onClick={onOpenConnectModal}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>+ Connect Bank</span>
              </button>

              {/* User Dropdown / Profile Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-600">
                  {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-none">{user.name}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{user.email}</div>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              id="btn-login-nav"
              onClick={onOpenAuthModal}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-all"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

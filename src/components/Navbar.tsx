import React from 'react';
import { 
  CreditCard, 
  Plus, 
  Users, 
  Building2, 
  LayoutDashboard, 
  ReceiptText, 
  Download, 
  Moon, 
  Sun,
  FolderKanban
} from 'lucide-react';
import { AppSettings } from '../services/storage';

interface NavbarProps {
  currentTab: 'dashboard' | 'payments' | 'projects' | 'payees' | 'accounts';
  setCurrentTab: (tab: 'dashboard' | 'payments' | 'projects' | 'payees' | 'accounts') => void;
  onOpenAddPayment: () => void;
  onOpenExport: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  transactionCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAddPayment,
  onOpenExport,
  settings,
  onUpdateSettings,
  transactionCount
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Pay<span className="text-indigo-600 dark:text-indigo-400">Tracker</span></span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">Pro</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => setCurrentTab('payments')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'payments'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              All Payments
              <span className="ml-1 px-1.5 py-0.2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full text-[10px]">
                {transactionCount}
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('projects')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'projects'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5 text-amber-500" />
              Sites & Projects
            </button>

            <button
              onClick={() => setCurrentTab('payees')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'payees'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              To Whom (Payees)
            </button>

            <button
              onClick={() => setCurrentTab('accounts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'accounts'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              From Accounts
            </button>
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Toggle theme"
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Export & Backup */}
            <button
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Export records to Excel, PDF Statement or JSON Backup"
            >
              <Download className="w-3.5 h-3.5" />
              Export & Backup
            </button>

            {/* Add Payment CTA */}
            <button
              onClick={onOpenAddPayment}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Record Payment</span>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium ${
              currentTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('payments')}
            className={`flex flex-col items-center py-1 px-2.5 text-[11px] font-medium ${
              currentTab === 'payments' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
            }`}
          >
            <ReceiptText className="w-4 h-4 mb-0.5" />
            Payments
          </button>
          <button
            onClick={() => setCurrentTab('projects')}
            className={`flex flex-col items-center py-1 px-2.5 text-[11px] font-medium ${
              currentTab === 'projects' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
            }`}
          >
            <FolderKanban className="w-4 h-4 mb-0.5 text-amber-500" />
            Projects
          </button>
          <button
            onClick={() => setCurrentTab('payees')}
            className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium ${
              currentTab === 'payees' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            Payees
          </button>
          <button
            onClick={() => setCurrentTab('accounts')}
            className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium ${
              currentTab === 'accounts' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500'
            }`}
          >
            <Building2 className="w-4 h-4 mb-0.5" />
            Accounts
          </button>
        </div>

      </div>
    </header>
  );
};

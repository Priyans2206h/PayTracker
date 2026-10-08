import React from 'react';
import { Transaction, Account, Payee } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  TrendingDown, 
  Calendar, 
  Wallet, 
  ArrowUpRight
} from 'lucide-react';

interface StatsCardsProps {
  transactions: Transaction[];
  accounts: Account[];
  payees?: Payee[];
  currency: string;
  onFilterByPayee?: (payeeId: string) => void;
  onFilterByDate?: (dateFilter: 'this_month' | 'today') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  transactions,
  accounts,
  currency,
  onFilterByDate
}) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const todayStr = now.toISOString().split('T')[0];

  // This month's transactions
  const thisMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totalThisMonth = thisMonthTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Today's transactions
  const todayTransactions = transactions.filter(t => t.date === todayStr);
  const totalToday = todayTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Total Liquid Balance across cash, bank, wallets (exclude credit card limits)
  const liquidAccounts = accounts.filter(a => a.type !== 'credit_card');
  const totalLiquidBalance = liquidAccounts.reduce((acc, a) => acc + a.balance, 0);

  // Total Credit Card available limits
  const creditAccounts = accounts.filter(a => a.type === 'credit_card');
  const totalCreditLimit = creditAccounts.reduce((acc, a) => acc + a.balance, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      
      {/* Card 1: Total Paid This Month */}
      <div 
        onClick={() => onFilterByDate?.('this_month')}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Paid This Month
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(totalThisMonth, currency)}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{thisMonthTransactions.length} payments recorded</span>
          <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            View <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Card 2: Today's Outflow */}
      <div 
        onClick={() => onFilterByDate?.('today')}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Paid Today
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Calendar className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(totalToday, currency)}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{todayTransactions.length} payments today</span>
          <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Filter <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Card 3: Total Bank & Liquid Balance */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Bank & Cash Balance
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Wallet className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatCurrency(totalLiquidBalance, currency)}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Across {liquidAccounts.length} accounts {totalCreditLimit > 0 && `(Cards: ${formatCurrency(totalCreditLimit, currency)})`}
        </div>
      </div>

    </div>
  );
};

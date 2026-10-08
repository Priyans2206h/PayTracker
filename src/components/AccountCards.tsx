import React from 'react';
import { Account, Transaction } from '../types';
import { formatCurrency, getAccountBadgeColor } from '../utils/formatters';
import { 
  Building2, 
  CreditCard, 
  Wallet, 
  Coins, 
  Plus, 
  Check, 
  ChevronRight
} from 'lucide-react';

interface AccountCardsProps {
  accounts: Account[];
  transactions: Transaction[];
  currency: string;
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onOpenManageAccounts: () => void;
  onOpenAddAccount: () => void;
}

export const AccountCards: React.FC<AccountCardsProps> = ({
  accounts,
  transactions,
  currency,
  selectedAccountId,
  onSelectAccount,
  onOpenManageAccounts,
  onOpenAddAccount
}) => {
  // Calculate total spent from each account
  const spentByAccount: Record<string, number> = {};
  transactions.forEach(t => {
    spentByAccount[t.fromAccountId] = (spentByAccount[t.fromAccountId] || 0) + t.amount;
  });

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'bank': return <Building2 className="w-4 h-4" />;
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      case 'wallet': return <Wallet className="w-4 h-4" />;
      case 'cash': return <Coins className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Your Bank Accounts
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {selectedAccountId && (
            <button
              onClick={() => onSelectAccount('')}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 flex items-center gap-1 transition-colors"
            >
              <Check className="w-3 h-3" />
              Showing 1 Account (Clear)
            </button>
          )}

          <button
            onClick={onOpenManageAccounts}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors"
          >
            Manage Accounts <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Account Cards Carousel / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {accounts.map(account => {
          const isSelected = selectedAccountId === account.id;
          const totalSpent = spentByAccount[account.id] || 0;

          return (
            <div
              key={account.id}
              onClick={() => onSelectAccount(isSelected ? '' : account.id)}
              className={`relative group rounded-xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected 
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/30' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className={`p-1.5 rounded-lg ${getAccountBadgeColor(account.type)}`}>
                    {getAccountIcon(account.type)}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {account.accountNumberMasked}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {account.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {account.institution}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    {account.type === 'credit_card' ? 'Available Limit' : 'Balance'}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatCurrency(account.balance, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Outflow:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {formatCurrency(totalSpent, currency)}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping absolute"></span>
                  <span className="w-2 h-2 rounded-full bg-indigo-600 block"></span>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Account Card */}
        <button
          onClick={onOpenAddAccount}
          className="rounded-xl p-3.5 border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-all flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 min-h-[120px]"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">Add Account</span>
          <span className="text-[10px] text-slate-400">Bank, Card, UPI</span>
        </button>
      </div>
    </div>
  );
};

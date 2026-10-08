import React from 'react';
import { Transaction, Payee } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Users, Building2, FolderKanban } from 'lucide-react';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  payees: Payee[];
  currency: string;
  onFilterCategory?: (category: string) => void;
  onFilterPayee?: (payeeId: string) => void;
  onFilterAccount?: (accountId: string) => void;
  onFilterProject?: (project: string) => void;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  payees,
  currency,
  onFilterPayee,
  onFilterAccount,
  onFilterProject
}) => {
  const totalSpend = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Group by Site / Project ("For which site or project")
  const projectMap: Record<string, { name: string; amount: number; count: number }> = {};
  transactions.forEach(t => {
    const projName = t.project?.trim() || 'General / Unassigned';
    if (!projectMap[projName]) {
      projectMap[projName] = {
        name: projName,
        amount: 0,
        count: 0
      };
    }
    projectMap[projName].amount += t.amount;
    projectMap[projName].count += 1;
  });

  const sortedProjects = Object.values(projectMap).sort((a, b) => b.amount - a.amount).slice(0, 6);

  // Group by Payee ("To whom I pay")
  const payeeMap: Record<string, { id: string; name: string; amount: number; count: number; avatarColor?: string }> = {};
  transactions.forEach(t => {
    if (!payeeMap[t.payeeId]) {
      const p = payees.find(item => item.id === t.payeeId);
      payeeMap[t.payeeId] = {
        id: t.payeeId,
        name: t.payeeName,
        amount: 0,
        count: 0,
        avatarColor: p?.avatarColor || 'bg-indigo-500'
      };
    }
    payeeMap[t.payeeId].amount += t.amount;
    payeeMap[t.payeeId].count += 1;
  });

  const sortedPayees = Object.values(payeeMap).sort((a, b) => b.amount - a.amount).slice(0, 6);

  // Group by Account ("From which account")
  const accountMap: Record<string, { id: string; name: string; amount: number; count: number }> = {};
  transactions.forEach(t => {
    if (!accountMap[t.fromAccountId]) {
      accountMap[t.fromAccountId] = {
        id: t.fromAccountId,
        name: t.fromAccountName,
        amount: 0,
        count: 0
      };
    }
    accountMap[t.fromAccountId].amount += t.amount;
    accountMap[t.fromAccountId].count += 1;
  });

  const sortedAccounts = Object.values(accountMap).sort((a, b) => b.amount - a.amount);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      
      {/* 1. SITE / PROJECT SPENDING (Cost Breakdown) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Site / Project Cost
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {Object.keys(projectMap).length} active
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedProjects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No site / project payments recorded yet
              </div>
            ) : (
              sortedProjects.map(proj => {
              const percentage = totalSpend > 0 ? Math.round((proj.amount / totalSpend) * 100) : 0;
              return (
                <div 
                  key={proj.name}
                  onClick={() => onFilterProject?.(proj.name === 'General / Unassigned' ? '' : proj.name)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="truncate">{proj.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({proj.count})</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(proj.amount, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 w-8 text-right font-medium">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-500 group-hover:bg-amber-400"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Click any site / project to filter</span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">{Object.keys(projectMap).length} sites</span>
        </div>
      </div>

      {/* 2. TO WHOM I PAY (Payee Breakdown) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              To Whom I Pay (Top Payees)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Top 6
            </span>
          </div>

          <div className="space-y-3">
            {sortedPayees.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No payees recorded yet
              </div>
            ) : (
              sortedPayees.map((payee, idx) => {
              const percentage = totalSpend > 0 ? Math.round((payee.amount / totalSpend) * 100) : 0;
              return (
                <div 
                  key={payee.id}
                  onClick={() => onFilterPayee?.(payee.id)}
                  className="group flex items-center justify-between p-2 rounded-xl hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-900"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400 w-4 text-center">
                      #{idx + 1}
                    </span>
                    <div className={`w-7 h-7 rounded-lg ${payee.avatarColor || 'bg-purple-600'} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm`}>
                      {payee.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {payee.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {payee.count} {payee.count === 1 ? 'payment' : 'payments'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(payee.amount, currency)}
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">
                      {percentage}% of outflow
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Click any payee to see records</span>
          <span className="font-semibold text-purple-600 dark:text-purple-400">{sortedPayees.length} active</span>
        </div>
      </div>

      {/* 3. FROM WHICH ACCOUNT (Account Breakdown) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              From Which Account (Outflow)
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Source Breakdown
            </span>
          </div>

          <div className="space-y-3.5">
            {sortedAccounts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                No account outflows recorded yet
              </div>
            ) : (
              sortedAccounts.map(acc => {
              const percentage = totalSpend > 0 ? Math.round((acc.amount / totalSpend) * 100) : 0;
              return (
                <div 
                  key={acc.id}
                  onClick={() => onFilterAccount?.(acc.id)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {acc.name}
                      <span className="text-[10px] text-slate-400 ml-1">({acc.count})</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(acc.amount, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 w-8 text-right font-medium">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500 group-hover:bg-indigo-400"
                      style={{ width: `${Math.max(percentage, 3)}%` }}
                    />
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span>Click any account to filter</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">{sortedAccounts.length} sources used</span>
        </div>
      </div>

    </div>
  );
};

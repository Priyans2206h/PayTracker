import React, { useState, useMemo } from 'react';
import { Transaction, Payee } from '../types';
import { formatCurrency, formatRelativeDate } from '../utils/formatters';
import { 
  FolderKanban, 
  Search, 
  ChevronRight, 
  Plus, 
  TrendingUp, 
  Building, 
  Layers
} from 'lucide-react';

interface ProjectsViewProps {
  transactions: Transaction[];
  payees: Payee[];
  currency: string;
  onFilterByProject: (projectName: string) => void;
  onRecordPaymentForProject: (projectName: string) => void;
  onOpenAddPayment: () => void;
}

interface ProjectSummary {
  name: string;
  totalSpent: number;
  paymentCount: number;
  lastDate?: string;
  payeeBreakdown: { payeeId: string; payeeName: string; amount: number; count: number }[];
  recentTransactions: Transaction[];
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  transactions,
  currency,
  onFilterByProject,
  onRecordPaymentForProject,
  onOpenAddPayment
}) => {
  const [search, setSearch] = useState('');

  // Compute Project Aggregations
  const { projectList, totalProjectSpend, highestSpendProject } = useMemo(() => {
    const map: Record<string, ProjectSummary> = {};

    transactions.forEach(tx => {
      const projName = tx.project?.trim() || 'General / Unassigned';
      if (!map[projName]) {
        map[projName] = {
          name: projName,
          totalSpent: 0,
          paymentCount: 0,
          payeeBreakdown: [],
          recentTransactions: []
        };
      }

      map[projName].totalSpent += tx.amount;
      map[projName].paymentCount += 1;

      if (!map[projName].lastDate || new Date(tx.date) > new Date(map[projName].lastDate!)) {
        map[projName].lastDate = tx.date;
      }

      // Track payee breakdown for this project
      const existingPayee = map[projName].payeeBreakdown.find(p => p.payeeId === tx.payeeId);
      if (existingPayee) {
        existingPayee.amount += tx.amount;
        existingPayee.count += 1;
      } else {
        map[projName].payeeBreakdown.push({
          payeeId: tx.payeeId,
          payeeName: tx.payeeName,
          amount: tx.amount,
          count: 1
        });
      }

      map[projName].recentTransactions.push(tx);
    });

    const list = Object.values(map).map(p => {
      p.payeeBreakdown.sort((a, b) => b.amount - a.amount);
      p.recentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return p;
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    const total = list.reduce((sum, p) => sum + p.totalSpent, 0);
    const topProj = list.length > 0 ? list[0] : null;

    return {
      projectList: list,
      totalProjectSpend: total,
      highestSpendProject: topProj
    };
  }, [transactions]);

  // Filtered list
  const filteredList = useMemo(() => {
    if (!search.trim()) return projectList;
    const q = search.toLowerCase();
    return projectList.filter(p => p.name.toLowerCase().includes(q));
  }, [projectList, search]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Sites & Projects Cost Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Total cost, outflow, and payees breakdown for every site or project
          </p>
        </div>

        <button
          onClick={onOpenAddPayment}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Record Payment
        </button>
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Metric 1: Total Projects */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Active Sites & Projects
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {projectList.length}
            </div>
            <span className="text-[10px] text-slate-400">Total sites tracked</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Total Spent on Projects */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Project Cost (Spend)
            </span>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
              {formatCurrency(totalProjectSpend, currency)}
            </div>
            <span className="text-[10px] text-slate-400">Across all recorded payments</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Top Spending Project */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Highest Cost Project
            </span>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1 truncate max-w-[180px]">
              {highestSpendProject?.name || 'None'}
            </div>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              {highestSpendProject ? formatCurrency(highestSpendProject.totalSpent, currency) : '₹0'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search site or project name..."
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
        />
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredList.map((project) => {
          const percentage = totalProjectSpend > 0 ? Math.round((project.totalSpent / totalProjectSpend) * 100) : 0;

          return (
            <div
              key={project.name}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800/80 transition-all group"
            >
              <div>
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      <FolderKanban className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {project.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {project.paymentCount} {project.paymentCount === 1 ? 'payment recorded' : 'payments recorded'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                    {percentage}% of outflow
                  </span>
                </div>

                {/* Total Cost Highlight Box */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 mb-4">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block mb-0.5">
                    Total Cost of this Project / Site
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {formatCurrency(project.totalSpent, currency)}
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Payees / Beneficiaries for this project */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    To Whom Paid for this Project ({project.payeeBreakdown.length})
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {project.payeeBreakdown.slice(0, 4).map(payee => (
                      <div 
                        key={payee.payeeId}
                        className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate mr-2">
                          {payee.payeeName}
                          <span className="text-[10px] text-slate-400 font-normal ml-1">({payee.count})</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">
                          {formatCurrency(payee.amount, currency)}
                        </span>
                      </div>
                    ))}
                    {project.payeeBreakdown.length > 4 && (
                      <span className="text-[10px] text-slate-400 italic block text-right">
                        +{project.payeeBreakdown.length - 4} more payees
                      </span>
                    )}
                  </div>
                </div>

                {/* Recent Transaction */}
                {project.recentTransactions.length > 0 && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2.5 mb-4">
                    <span className="text-slate-400">Latest: </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{project.recentTransactions[0].why}</span>
                    <span className="text-slate-400"> • {formatRelativeDate(project.recentTransactions[0].date)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onRecordPaymentForProject(project.name === 'General / Unassigned' ? '' : project.name)}
                  className="px-2.5 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Pay for this Site
                </button>

                <button
                  onClick={() => onFilterByProject(project.name === 'General / Unassigned' ? '' : project.name)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                >
                  View Ledger <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            {projectList.length === 0 ? 'No sites or projects recorded yet' : 'No sites or projects match your search'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {projectList.length === 0
              ? 'Whenever you record a payment, assign a site or project name to track its cost breakdown here.'
              : 'Try adjusting your search query or clear filters.'}
          </p>
        </div>
      )}

    </div>
  );
};

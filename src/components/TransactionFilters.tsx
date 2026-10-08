import React from 'react';
import { Account, Payee, FilterOptions } from '../types';
import { CATEGORIES } from '../data/initialData';
import { 
  Search, 
  X, 
  ArrowUpDown, 
  SlidersHorizontal,
  User
} from 'lucide-react';

interface TransactionFiltersProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  accounts: Account[];
  payees: Payee[];
  projects?: string[];
  filteredCount: number;
  totalCount: number;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  setFilters,
  accounts,
  payees,
  projects = [],
  filteredCount,
  totalCount
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleDateRangeChange = (range: FilterOptions['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      dateRange: 'all',
      accountId: '',
      payeeId: '',
      category: '',
      project: '',
      paymentMode: '',
      status: '',
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'date_desc'
    });
  };

  const isFiltered = 
    Boolean(filters.search) || 
    filters.dateRange !== 'all' || 
    Boolean(filters.accountId) || 
    Boolean(filters.payeeId) || 
    Boolean(filters.category) || 
    Boolean(filters.project) || 
    Boolean(filters.paymentMode) ||
    Boolean(filters.minAmount) ||
    Boolean(filters.maxAmount);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      
      {/* Top Search & Primary Filters Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search by payee, purpose / why, account, or UTR..."
            className="w-full bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['all', 'today', 'this_week', 'this_month', 'last_month'] as const).map(range => (
            <button
              key={range}
              onClick={() => handleDateRangeChange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filters.dateRange === range
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {range === 'all' && 'All Time'}
              {range === 'today' && 'Today'}
              {range === 'this_week' && 'This Week'}
              {range === 'this_month' && 'This Month'}
              {range === 'last_month' && 'Last Month'}
            </button>
          ))}
        </div>

        {/* Person / Payee Dropdown (Person-wise Setting) */}
        <div className="relative">
          <select
            value={filters.payeeId}
            onChange={(e) => setFilters(prev => ({ ...prev, payeeId: e.target.value }))}
            className={`w-full sm:w-auto appearance-none text-xs font-semibold py-2 pl-8 pr-8 rounded-xl border cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
              filters.payeeId
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <option value="">All Persons (Everyone)</option>
            {payees.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} {p.nickname ? `(${p.nickname})` : ''}
              </option>
            ))}
          </select>
          <User className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
            filters.payeeId ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'
          }`} />
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            showAdvanced || isFiltered
              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {isFiltered && (
            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
          )}
        </button>

        {/* Sort Select */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }))}
            className="w-full sm:w-auto appearance-none bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
          <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Quick Person-wise Selector Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <User className="w-3 h-3 text-purple-500" />
          Person:
        </span>
        <button
          type="button"
          onClick={() => setFilters(prev => ({ ...prev, payeeId: '' }))}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            !filters.payeeId
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All ({totalCount})
        </button>
        {payees.map(p => {
          const isSelected = filters.payeeId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, payeeId: isSelected ? '' : p.id }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`} />
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-fadeIn">
          
          {/* Site / Project Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Site / Project
            </label>
            <select
              value={filters.project || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, project: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sites & Projects</option>
              {projects.map(proj => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>
          </div>

          {/* Account Filter ("From Which Account") */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              From Which Account
            </label>
            <select
              value={filters.accountId}
              onChange={(e) => setFilters(prev => ({ ...prev, accountId: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.accountNumberMasked})
                </option>
              ))}
            </select>
          </div>

          {/* Payee Filter ("To Whom") */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              To Whom (Payee)
            </label>
            <select
              value={filters.payeeId}
              onChange={(e) => setFilters(prev => ({ ...prev, payeeId: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Payees</option>
              {payees.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.nickname ? `(${p.nickname})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter ("Why I Paid") */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Why / Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Payment Mode
            </label>
            <select
              value={filters.paymentMode}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMode: e.target.value }))}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Modes</option>
              <option value="upi">UPI / QR</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

        </div>
      )}

      {/* Filter Status Bar */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
        <div>
          {filters.payeeId ? (
            <span>
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCount}</span> records for <span className="font-bold text-purple-600 dark:text-purple-400">{payees.find(p => p.id === filters.payeeId)?.name || 'Selected Person'}</span>
            </span>
          ) : (
            <span>
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredCount}</span> of {totalCount} payment records
            </span>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        )}
      </div>

    </div>
  );
};

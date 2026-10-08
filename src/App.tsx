import React, { useState, useEffect, useMemo } from 'react';
import { Account, Payee, Transaction, FilterOptions } from './types';
import { StorageService, subscribeToStorage, AppSettings } from './services/storage';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { AccountCards } from './components/AccountCards';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionFilters } from './components/TransactionFilters';
import { TransactionList } from './components/TransactionList';
import { ProjectsView } from './components/ProjectsView';
import { AddPaymentModal } from './components/AddPaymentModal';
import { AccountsModal } from './components/AccountsModal';
import { PayeesModal } from './components/PayeesModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ExportModal } from './components/ExportModal';
import { Plus, ReceiptText, Users, Building2, ChevronRight, FolderKanban, X, Download } from 'lucide-react';

export const App: React.FC = () => {
  // Global Data State
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  // Navigation & Tabs
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'payments' | 'projects' | 'payees' | 'accounts'>('dashboard');

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    dateRange: 'all',
    accountId: '',
    payeeId: '',
    category: '',
    project: '',
    paymentMode: '',
    status: '',
    sortBy: 'date_desc',
  });

  // Modals
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Transaction | null>(null);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isPayeesModalOpen, setIsPayeesModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Load data & subscribe
  const loadData = () => {
    setAccounts(StorageService.getAccounts());
    setPayees(StorageService.getPayees());
    setTransactions(StorageService.getTransactions());
    setSettings(StorageService.getSettings());
  };

  useEffect(() => {
    const CLEAN_SLATE_FLAG = 'paytracker_clean_slate_v4';
    if (!localStorage.getItem(CLEAN_SLATE_FLAG)) {
      StorageService.clearAll();
    }
    loadData();
    const unsubscribe = subscribeToStorage(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  // Sync theme with DOM
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Existing unique projects
  const existingProjects = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.project?.trim()) set.add(t.project.trim());
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered and Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // 1. Search Query
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesPayee = t.payeeName.toLowerCase().includes(query);
        const matchesWhy = t.why.toLowerCase().includes(query);
        const matchesAccount = t.fromAccountName.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const matchesProject = t.project?.toLowerCase().includes(query);
        const matchesNotes = t.notes?.toLowerCase().includes(query);
        const matchesRef = t.referenceNumber?.toLowerCase().includes(query);
        const matchesTags = t.tags?.some(tag => tag.toLowerCase().includes(query));

        if (!matchesPayee && !matchesWhy && !matchesAccount && !matchesCategory && !matchesProject && !matchesNotes && !matchesRef && !matchesTags) {
          return false;
        }
      }

      // 2. Date Range
      if (filters.dateRange !== 'all') {
        const txDate = new Date(t.date);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (filters.dateRange === 'today') {
          if (t.date !== todayStr) return false;
        } else if (filters.dateRange === 'this_week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (txDate < weekAgo) return false;
        } else if (filters.dateRange === 'this_month') {
          if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) {
            return false;
          }
        } else if (filters.dateRange === 'last_month') {
          const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          if (txDate.getFullYear() !== lastMonthYear || txDate.getMonth() !== lastMonth) {
            return false;
          }
        }
      }

      // 3. Account Filter
      if (filters.accountId && t.fromAccountId !== filters.accountId) {
        return false;
      }

      // 4. Payee Filter (Person-wise)
      if (filters.payeeId) {
        const selectedP = payees.find(p => p.id === filters.payeeId);
        const matchesId = t.payeeId === filters.payeeId;
        const matchesName = Boolean(selectedP && t.payeeName.trim().toLowerCase() === selectedP.name.trim().toLowerCase());
        if (!matchesId && !matchesName) {
          return false;
        }
      }

      // 5. Category Filter
      if (filters.category && t.category !== filters.category) {
        return false;
      }

      // 6. Site / Project Filter
      if (filters.project && (t.project || '') !== filters.project) {
        return false;
      }

      // 7. Payment Mode Filter
      if (filters.paymentMode && t.paymentMode !== filters.paymentMode) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'date_desc' || filters.sortBy === 'date_asc') {
        const getTimeVal = (d: string, t?: string) => {
          const parts = d.split('-').map(Number);
          const y = parts[0] || 1970;
          const m = (parts[1] || 1) - 1;
          const day = parts[2] || 1;
          let h = 0, min = 0;
          if (t) {
            const tm = t.match(/(\d{1,2}):(\d{2})/);
            if (tm) {
              h = parseInt(tm[1], 10);
              min = parseInt(tm[2], 10);
            }
          }
          return new Date(y, m, day, h, min).getTime();
        };
        const timeA = getTimeVal(a.date, a.time);
        const timeB = getTimeVal(b.date, b.time);
        return filters.sortBy === 'date_desc' ? timeB - timeA : timeA - timeB;
      }
      if (filters.sortBy === 'amount_desc') {
        return b.amount - a.amount;
      }
      if (filters.sortBy === 'amount_asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, filters]);

  // Selected Person details for Person-wise Ledger view
  const selectedPayee = useMemo(() => {
    if (!filters.payeeId) return null;
    return payees.find(p => p.id === filters.payeeId) || null;
  }, [filters.payeeId, payees]);

  const selectedPersonTotal = useMemo(() => {
    if (!selectedPayee) return 0;
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [selectedPayee, filteredTransactions]);

  // Actions
  const handleSaveTransaction = (transaction: Transaction) => {
    StorageService.saveTransaction(transaction);
  };

  const handleDeleteTransaction = (id: string) => {
    StorageService.deleteTransaction(id);
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      referenceNumber: undefined,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveTransaction(duplicated);
  };

  const handleAddNewPayeeInline = async (payeeData: Partial<Payee>): Promise<Payee> => {
    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
    const newPayee: Payee = {
      id: `payee-${Date.now()}`,
      name: payeeData.name || 'New Payee',
      category: payeeData.category || 'Personal & Splits',
      totalPaid: 0,
      paymentCount: 0,
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      ...payeeData,
    };
    StorageService.savePayee(newPayee);
    return newPayee;
  };

  // Quick Drilldowns
  const handleFilterByAccount = (accountId: string) => {
    setFilters(prev => ({ ...prev, accountId }));
    setCurrentTab('payments');
  };

  const handleFilterByPayee = (payeeId: string) => {
    setFilters(prev => ({ ...prev, payeeId }));
    setCurrentTab('payments');
  };

  const handleFilterByCategory = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
    setCurrentTab('payments');
  };

  const handleFilterByDate = (dateFilter: 'this_month' | 'today') => {
    setFilters(prev => ({ ...prev, dateRange: dateFilter }));
    setCurrentTab('payments');
  };

  const handleFilterByProject = (project: string) => {
    setFilters(prev => ({ ...prev, project }));
    setCurrentTab('payments');
  };

  const handleRecordPaymentForProject = (projectName: string) => {
    setEditingTransaction({
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      amount: 0,
      currency: settings.currency,
      payeeId: payees[0]?.id || '',
      payeeName: payees[0]?.name || '',
      fromAccountId: accounts[0]?.id || '',
      fromAccountName: accounts[0]?.name || '',
      category: 'Housing & Rent',
      why: '',
      project: projectName,
      paymentMode: 'upi',
      status: 'completed',
      tags: [],
      createdAt: new Date().toISOString()
    });
    setIsAddPaymentOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddPayment={() => { setEditingTransaction(null); setIsAddPaymentOpen(true); }}
        onOpenExport={() => setIsExportModalOpen(true)}
        settings={settings}
        onUpdateSettings={(newSettings) => StorageService.saveSettings(newSettings)}
        transactionCount={transactions.length}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: DASHBOARD VIEW */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Metric Cards */}
            <StatsCards
              transactions={transactions}
              accounts={accounts}
              payees={payees}
              currency={settings.currency}
              onFilterByPayee={handleFilterByPayee}
              onFilterByDate={handleFilterByDate}
            />

            {/* From Which Account Strip */}
            <AccountCards
              accounts={accounts}
              transactions={transactions}
              currency={settings.currency}
              selectedAccountId={filters.accountId}
              onSelectAccount={(accId) => setFilters(prev => ({ ...prev, accountId: accId }))}
              onOpenManageAccounts={() => setIsAccountsModalOpen(true)}
              onOpenAddAccount={() => setIsAccountsModalOpen(true)}
            />

            {/* Analytics Breakdown: Site / Project, To Whom, From Which Account */}
            <AnalyticsCharts
              transactions={transactions}
              payees={payees}
              currency={settings.currency}
              onFilterCategory={handleFilterByCategory}
              onFilterPayee={handleFilterByPayee}
              onFilterAccount={handleFilterByAccount}
              onFilterProject={handleFilterByProject}
            />

            {/* Recent Payments Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ReceiptText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Recent Payment Records
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Latest outflows recorded with payee, account, and reason
                  </p>
                </div>

                <button
                  onClick={() => setCurrentTab('payments')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                >
                  View All ({transactions.length}) <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <TransactionList
                transactions={transactions.slice(0, 5)}
                payees={payees}
                currency={settings.currency}
                onEdit={(tx) => { setEditingTransaction(tx); setIsAddPaymentOpen(true); }}
                onDelete={handleDeleteTransaction}
                onDuplicate={handleDuplicateTransaction}
                onViewReceipt={(tx) => setViewingReceipt(tx)}
                onSelectPayee={handleFilterByPayee}
                onSelectAccount={handleFilterByAccount}
                onSelectProject={handleFilterByProject}
              />
            </div>
          </div>
        )}

        {/* TAB 2: ALL PAYMENTS LEDGER VIEW */}
        {currentTab === 'payments' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Payment Records & Ledger
                </h1>
              </div>

              <button
                onClick={() => { setEditingTransaction(null); setIsAddPaymentOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Record Payment
              </button>
            </div>

            {/* Filter Bar */}
            <TransactionFilters
              filters={filters}
              setFilters={setFilters}
              accounts={accounts}
              payees={payees}
              projects={existingProjects}
              filteredCount={filteredTransactions.length}
              totalCount={transactions.length}
            />

            {/* Person-wise Statement Banner (when person is selected) */}
            {selectedPayee && (
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 border border-purple-200/80 dark:border-purple-800/60 rounded-2xl p-4 sm:p-5 shadow-sm animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl ${selectedPayee.avatarColor || 'bg-purple-600'} text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0`}>
                      {selectedPayee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                          {selectedPayee.name}
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          Person Ledger & History
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedPayee.category} {selectedPayee.nickname ? `• ${selectedPayee.nickname}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-purple-200/50 dark:border-purple-800/40">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                        Total Paid
                      </div>
                      <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {settings.currency}{selectedPersonTotal.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                        History Records
                      </div>
                      <div className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-200">
                        {filteredTransactions.length} payments
                      </div>
                    </div>
                    <button
                      onClick={() => setIsExportModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white bg-purple-100 dark:bg-purple-950/60 hover:bg-purple-200 dark:hover:bg-purple-900/60 rounded-xl border border-purple-200 dark:border-purple-800 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      title={`Export Excel / PDF / JSON backup for ${selectedPayee.name}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Data
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, payeeId: '' }))}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Show All Records
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction List */}
            <TransactionList
              transactions={filteredTransactions}
              payees={payees}
              currency={settings.currency}
              onEdit={(tx) => { setEditingTransaction(tx); setIsAddPaymentOpen(true); }}
              onDelete={handleDeleteTransaction}
              onDuplicate={handleDuplicateTransaction}
              onViewReceipt={(tx) => setViewingReceipt(tx)}
              onSelectPayee={handleFilterByPayee}
              onSelectAccount={handleFilterByAccount}
              onSelectProject={handleFilterByProject}
            />
          </div>
        )}

        {/* TAB 3: SITES & PROJECTS LEDGER */}
        {currentTab === 'projects' && (
          <ProjectsView
            transactions={transactions}
            payees={payees}
            currency={settings.currency}
            onFilterByProject={handleFilterByProject}
            onRecordPaymentForProject={handleRecordPaymentForProject}
            onOpenAddPayment={() => { setEditingTransaction(null); setIsAddPaymentOpen(true); }}
          />
        )}

        {/* TAB 4: PAYEES (TO WHOM) VIEW */}
        {currentTab === 'payees' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Users className="w-6 h-6 text-purple-600" />
                  To Whom I Pay (Payees & Beneficiaries)
                </h1>
              </div>
              <button
                onClick={() => setIsPayeesModalOpen(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Manage Payees
              </button>
            </div>

            {payees.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No payees registered yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Add people, contractors, staff, or vendors you make payments to.
                </p>
                <button
                  onClick={() => setIsPayeesModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Payee
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {payees.map(payee => (
                  <div
                    key={payee.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl ${payee.avatarColor || 'bg-purple-600'} text-white flex items-center justify-center font-bold text-base shadow-sm`}>
                            {payee.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {payee.name}
                            </div>
                            {payee.nickname && (
                              <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                                {payee.nickname}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {payee.category}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                        {payee.upiId && <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300">UPI: {payee.upiId}</div>}
                        {payee.phone && <div>Tel: {payee.phone}</div>}
                        {payee.notes && <div className="italic text-slate-400 text-[11px]">"{payee.notes}"</div>}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Lifetime Paid</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {settings.currency}{payee.totalPaid.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {payee.paymentCount} {payee.paymentCount === 1 ? 'payment' : 'payments'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleFilterByPayee(payee.id)}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                      >
                        View Ledger <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FROM ACCOUNTS VIEW */}
        {currentTab === 'accounts' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                  Your Bank Accounts
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bank accounts, credit cards, UPI wallets, and petty cash balances
                </p>
              </div>

              <button
                onClick={() => setIsAccountsModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Manage Accounts
              </button>
            </div>

            {accounts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  No payment source accounts yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  Add your bank accounts, credit cards, UPI wallets, or cash to start tracking outflows.
                </p>
                <button
                  onClick={() => setIsAccountsModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Account
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => {
                  const totalSpent = transactions
                    .filter(t => t.fromAccountId === acc.id)
                    .reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div
                      key={acc.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-800 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {acc.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {acc.institution} • {acc.accountNumberMasked}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                            {acc.type.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                            {acc.type === 'credit_card' ? 'Available Limit' : 'Current Balance'}
                          </span>
                          <div className="text-2xl font-black text-slate-900 dark:text-white">
                            {settings.currency}{acc.balance.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Outflow</span>
                          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                            {settings.currency}{totalSpent.toLocaleString()}
                          </span>
                        </div>

                        <button
                          onClick={() => handleFilterByAccount(acc.id)}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                        >
                          Statements <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODALS */}
      
      {/* 1. Add / Edit Payment Modal */}
      <AddPaymentModal
        isOpen={isAddPaymentOpen}
        onClose={() => { setIsAddPaymentOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        accounts={accounts}
        payees={payees}
        currency={settings.currency}
        initialTransaction={editingTransaction}
        existingProjects={existingProjects}
        onAddNewPayeeInline={handleAddNewPayeeInline}
        onOpenManageAccounts={() => setIsAccountsModalOpen(true)}
      />

      {/* 2. Manage Accounts Modal */}
      <AccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        accounts={accounts}
        onSaveAccount={(acc) => StorageService.saveAccount(acc)}
        onDeleteAccount={(id) => StorageService.deleteAccount(id)}
        currency={settings.currency}
        onFilterByAccount={handleFilterByAccount}
      />

      {/* 3. Manage Payees Modal */}
      <PayeesModal
        isOpen={isPayeesModalOpen}
        onClose={() => setIsPayeesModalOpen(false)}
        payees={payees}
        onSavePayee={(p) => StorageService.savePayee(p)}
        onDeletePayee={(id) => StorageService.deletePayee(id)}
        currency={settings.currency}
        onSelectPayeeLedger={handleFilterByPayee}
      />

      {/* 4. Payment Receipt / Voucher Modal */}
      <ReceiptModal
        transaction={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        currency={settings.currency}
      />

      {/* 5. Export Payment Records Modal (Excel, PDF & JSON Backup) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        accounts={accounts}
        payees={payees}
        currency={settings.currency}
        defaultPayeeId={filters.payeeId || 'all'}
      />

    </div>
  );
};

export default App;

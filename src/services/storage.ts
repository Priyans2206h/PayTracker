import { Account, Payee, Transaction } from '../types';
const STORAGE_KEYS = {
  ACCOUNTS: 'paytracker_accounts_v4',
  PAYEES: 'paytracker_payees_v4',
  TRANSACTIONS: 'paytracker_transactions_v4',
  SETTINGS: 'paytracker_settings_v4',
};

// Automatic one-time purge of all mock and legacy data
const CLEAN_SLATE_FLAG = 'paytracker_clean_slate_v4';
try {
  if (typeof window !== 'undefined' && !localStorage.getItem(CLEAN_SLATE_FLAG)) {
    localStorage.clear();
    localStorage.setItem(CLEAN_SLATE_FLAG, 'true');
  }
} catch (_) {}

export interface AppSettings {
  currency: string;
  theme: 'light' | 'dark' | 'system';
  userName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  currency: '₹',
  theme: 'dark',
  userName: 'Priyansh Patel',
};

// Simple event bus for reactive UI updates
type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export const subscribeToStorage = (listener: StorageListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const notifyListeners = () => {
  listeners.forEach(fn => fn());
};

// Safe storage access
const getItem = <T>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const StorageService = {
  // Accounts
  getAccounts: (): Account[] => {
    return getItem<Account[]>(STORAGE_KEYS.ACCOUNTS, []);
  },

  saveAccount: (account: Account): void => {
    const accounts = StorageService.getAccounts();
    const index = accounts.findIndex(a => a.id === account.id);
    if (index >= 0) {
      accounts[index] = account;
    } else {
      accounts.push(account);
    }
    setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  deleteAccount: (id: string): void => {
    const accounts = StorageService.getAccounts().filter(a => a.id !== id);
    setItem(STORAGE_KEYS.ACCOUNTS, accounts);
  },

  // Payees
  getPayees: (): Payee[] => {
    return getItem<Payee[]>(STORAGE_KEYS.PAYEES, []);
  },

  savePayee: (payee: Payee): void => {
    const payees = StorageService.getPayees();
    const index = payees.findIndex(p => p.id === payee.id);
    if (index >= 0) {
      payees[index] = payee;
    } else {
      payees.push(payee);
    }
    setItem(STORAGE_KEYS.PAYEES, payees);
  },

  deletePayee: (id: string): void => {
    const payees = StorageService.getPayees().filter(p => p.id !== id);
    setItem(STORAGE_KEYS.PAYEES, payees);
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    return getItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  },

  saveTransaction: (tx: Transaction): void => {
    const txs = StorageService.getTransactions();
    const accounts = StorageService.getAccounts();
    const payees = StorageService.getPayees();

    const existingIndex = txs.findIndex(t => t.id === tx.id);
    const oldTx = existingIndex >= 0 ? txs[existingIndex] : null;

    // 1. Adjust Account Balance(s)
    if (oldTx) {
      if (oldTx.fromAccountId === tx.fromAccountId) {
        const acc = accounts.find(a => a.id === tx.fromAccountId);
        if (acc) {
          acc.balance += (oldTx.amount - tx.amount);
        }
      } else {
        // Refund old account
        const oldAcc = accounts.find(a => a.id === oldTx.fromAccountId);
        if (oldAcc) {
          oldAcc.balance += oldTx.amount;
        }
        // Debit new account
        const newAcc = accounts.find(a => a.id === tx.fromAccountId);
        if (newAcc) {
          newAcc.balance -= tx.amount;
        }
      }
    } else {
      // New payment: debit account
      const acc = accounts.find(a => a.id === tx.fromAccountId);
      if (acc) {
        acc.balance -= tx.amount;
      }
    }
    setItem(STORAGE_KEYS.ACCOUNTS, accounts);

    // 2. Save transaction
    if (existingIndex >= 0) {
      txs[existingIndex] = tx;
    } else {
      txs.unshift(tx); // Place newest at beginning
    }
    setItem(STORAGE_KEYS.TRANSACTIONS, txs);

    // 3. Update Payee Stats for all affected payees
    const affectedPayeeIds = new Set<string>([tx.payeeId]);
    if (oldTx && oldTx.payeeId) {
      affectedPayeeIds.add(oldTx.payeeId);
    }

    affectedPayeeIds.forEach(payeeId => {
      const pIndex = payees.findIndex(p => p.id === payeeId);
      if (pIndex >= 0) {
        const payeeTxs = txs.filter(t => t.payeeId === payeeId);
        payees[pIndex].totalPaid = payeeTxs.reduce((sum, t) => sum + t.amount, 0);
        payees[pIndex].paymentCount = payeeTxs.length;
        if (payeeTxs.length > 0) {
          const sorted = [...payeeTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          payees[pIndex].lastPaidDate = sorted[0].date;
        } else {
          payees[pIndex].lastPaidDate = undefined;
        }
      }
    });
    setItem(STORAGE_KEYS.PAYEES, payees);
  },

  deleteTransaction: (id: string): void => {
    const txs = StorageService.getTransactions();
    const target = txs.find(t => t.id === id);
    if (!target) return;

    // Revert account balance
    const accounts = StorageService.getAccounts();
    const accountIndex = accounts.findIndex(a => a.id === target.fromAccountId);
    if (accountIndex >= 0) {
      accounts[accountIndex].balance += target.amount;
      setItem(STORAGE_KEYS.ACCOUNTS, accounts);
    }

    const filtered = txs.filter(t => t.id !== id);
    setItem(STORAGE_KEYS.TRANSACTIONS, filtered);

    // Update Payee stats
    const payees = StorageService.getPayees();
    const payeeIndex = payees.findIndex(p => p.id === target.payeeId);
    if (payeeIndex >= 0) {
      const remainingPayeeTxs = filtered.filter(t => t.payeeId === target.payeeId);
      payees[payeeIndex].totalPaid = remainingPayeeTxs.reduce((sum, t) => sum + t.amount, 0);
      payees[payeeIndex].paymentCount = remainingPayeeTxs.length;
      if (remainingPayeeTxs.length > 0) {
        const sorted = [...remainingPayeeTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        payees[payeeIndex].lastPaidDate = sorted[0].date;
      } else {
        payees[payeeIndex].lastPaidDate = undefined;
      }
      setItem(STORAGE_KEYS.PAYEES, payees);
    }
  },

  // Settings
  getSettings: (): AppSettings => {
    const settings = getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return { ...settings, currency: '₹' };
  },

  saveSettings: (settings: Partial<AppSettings>): void => {
    const current = StorageService.getSettings();
    const updated = { ...current, ...settings, currency: '₹' };
    setItem(STORAGE_KEYS.SETTINGS, updated);
  },

  // Export / Import
  exportAllDataJSON: (): string => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      accounts: StorageService.getAccounts(),
      payees: StorageService.getPayees(),
      transactions: StorageService.getTransactions(),
      settings: StorageService.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  },

  importDataFromJSON: (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.accounts)) setItem(STORAGE_KEYS.ACCOUNTS, data.accounts);
      if (Array.isArray(data.payees)) setItem(STORAGE_KEYS.PAYEES, data.payees);
      if (Array.isArray(data.transactions)) setItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.settings) setItem(STORAGE_KEYS.SETTINGS, data.settings);
      notifyListeners();
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  },

  exportToCSV: (): string => {
    const txs = StorageService.getTransactions();
    const headers = [
      'Transaction ID',
      'Date',
      'Time',
      'To Whom (Payee)',
      'Site / Project',
      'From Account',
      'Why / Purpose',
      'Category',
      'Amount',
      'Currency',
      'Payment Mode',
      'Reference / UTR',
      'Status',
      'Tags',
      'Notes'
    ];

    const rows = txs.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.time || ''}"`,
      `"${(t.payeeName || '').replace(/"/g, '""')}"`,
      `"${(t.project || 'General').replace(/"/g, '""')}"`,
      `"${(t.fromAccountName || '').replace(/"/g, '""')}"`,
      `"${(t.why || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${t.currency}"`,
      `"${t.paymentMode}"`,
      `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${(t.tags || []).join('; ')}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  },

  resetToDefaults: (): void => {
    StorageService.clearAll();
  },

  clearAll: (): void => {
    try {
      localStorage.clear();
      localStorage.setItem('paytracker_clean_slate_v4', 'true');
    } catch (_) {}
    setItem(STORAGE_KEYS.ACCOUNTS, []);
    setItem(STORAGE_KEYS.PAYEES, []);
    setItem(STORAGE_KEYS.TRANSACTIONS, []);
    notifyListeners();
  }
};

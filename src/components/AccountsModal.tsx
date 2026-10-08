import React, { useState } from 'react';
import { Account, AccountType } from '../types';
import { formatCurrency, getAccountBadgeColor } from '../utils/formatters';
import { X, Building2, Plus, Trash2, Edit2, Check, CreditCard, Wallet, Coins } from 'lucide-react';

interface AccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onSaveAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  currency: string;
  onFilterByAccount?: (accountId: string) => void;
}

export const AccountsModal: React.FC<AccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSaveAccount,
  onDeleteAccount,
  currency,
  onFilterByAccount
}) => {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [balance, setBalance] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingAccount(null);
    setName('');
    setInstitution('');
    setType('bank');
    setAccountNumberMasked('•• ');
    setBalance('0');
  };

  const handleStartEdit = (account: Account) => {
    setEditingAccount(account);
    setIsCreating(false);
    setName(account.name);
    setInstitution(account.institution);
    setType(account.type);
    setAccountNumberMasked(account.accountNumberMasked);
    setBalance(account.balance.toString());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numBalance = parseFloat(balance) || 0;

    const updated: Account = {
      id: editingAccount ? editingAccount.id : `acc-${Date.now()}`,
      name: name.trim(),
      institution: institution.trim() || name.trim(),
      type,
      accountNumberMasked: accountNumberMasked.trim() || '••••',
      balance: numBalance,
      currency,
      color: editingAccount ? editingAccount.color : 'from-blue-600 to-indigo-700',
    };

    onSaveAccount(updated);
    setIsCreating(false);
    setEditingAccount(null);
  };

  const getAccountIcon = (accType: string) => {
    switch (accType) {
      case 'bank': return <Building2 className="w-4 h-4" />;
      case 'credit_card': return <CreditCard className="w-4 h-4" />;
      case 'wallet': return <Wallet className="w-4 h-4" />;
      case 'cash': return <Coins className="w-4 h-4" />;
      default: return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Manage Payment Source Accounts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Banks, Credit Cards, UPI Wallets & Cash
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Add / Edit Account Form */}
          {(isCreating || editingAccount) ? (
            <form onSubmit={handleSave} className="bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HDFC Salary Account"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Bank / Institution
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="e.g. HDFC Bank, Axis, SBI"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Account Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="wallet">UPI / Wallet</option>
                    <option value="cash">Cash in Hand</option>
                    <option value="savings">Savings Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Account Identifier / Masked No
                  </label>
                  <input
                    type="text"
                    value={accountNumberMasked}
                    onChange={(e) => setAccountNumberMasked(e.target.value)}
                    placeholder="•• 4821 or UPI ID"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Current Balance ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingAccount(null); }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-indigo-700 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Account
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={handleStartCreate}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {accounts.length === 0 ? 'Add Your First Account' : 'Add Another Account'}
            </button>
          )}

          {/* Accounts List */}
          {accounts.length === 0 && !isCreating && !editingAccount ? (
            <div className="py-12 text-center text-slate-400">
              <Building2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                No accounts added yet
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Click "Add Your First Account" above to add your bank account, credit card, or cash wallet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${getAccountBadgeColor(acc.type)}`}>
                      {getAccountIcon(acc.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {acc.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {acc.accountNumberMasked}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {acc.institution} • {acc.type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(acc.balance, currency)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {acc.type === 'credit_card' ? 'Available Limit' : 'Current Balance'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {onFilterByAccount && (
                        <button
                          onClick={() => {
                            onFilterByAccount(acc.id);
                            onClose();
                          }}
                          className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
                        >
                          View Records
                        </button>
                      )}
                      <button
                        onClick={() => handleStartEdit(acc)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete account ${acc.name}?`)) {
                            onDeleteAccount(acc.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Transaction, Account, Payee, PaymentMode } from '../types';
import { CATEGORIES } from '../data/initialData';
import { 
  X, 
  Building2, 
  Camera, 
  Check
} from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  accounts: Account[];
  payees: Payee[];
  currency: string;
  initialTransaction?: Transaction | null;
  existingProjects?: string[];
  onAddNewPayeeInline: (payee: Partial<Payee>) => Promise<Payee>;
  onOpenManageAccounts?: () => void;
}

export const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  payees,
  currency,
  initialTransaction,
  existingProjects = [],
  onAddNewPayeeInline,
  onOpenManageAccounts
}) => {
  const [amount, setAmount] = useState<string>('');
  const [payeeName, setPayeeName] = useState<string>('');
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [why, setWhy] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [category, setCategory] = useState<string>('Salary');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [isReimbursable, setIsReimbursable] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialTransaction) {
      setAmount(initialTransaction.amount.toString());
      setPayeeName(initialTransaction.payeeName);
      setFromAccountId(initialTransaction.fromAccountId);
      setWhy(initialTransaction.why);
      setProject(initialTransaction.project || '');
      setCategory(initialTransaction.category);
      setPaymentMode(initialTransaction.paymentMode);
      setDate(initialTransaction.date);
      setTime(initialTransaction.time || '');
      setReferenceNumber(initialTransaction.referenceNumber || '');
      setReceiptImage(initialTransaction.receiptImage || '');
      setIsReimbursable(initialTransaction.isReimbursable || false);
    } else {
      // Defaults
      setAmount('');
      setPayeeName('');
      setWhy('');
      setProject('');
      setReferenceNumber('');
      setReceiptImage('');
      setIsReimbursable(false);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      
      // Auto-select first account or default
      const defaultAcc = accounts.find(a => a.isDefault) || accounts[0];
      if (defaultAcc) setFromAccountId(defaultAcc.id);
    }
  }, [initialTransaction, isOpen, accounts]);

  if (!isOpen) return null;

  const handleAddAmount = (add: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + add).toString());
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount greater than zero.');
      return;
    }

    const trimmedPayeeName = payeeName.trim();
    if (!trimmedPayeeName) {
      alert('Please enter who you paid ("To Whom I Pay").');
      return;
    }

    if (!fromAccountId) {
      alert('Please choose an account ("From Which Account").');
      return;
    }

    if (!why.trim()) {
      alert('Please specify the reason/purpose ("Why") for this payment.');
      return;
    }

    // Check if payee already exists in dataset (case-insensitive)
    let targetPayee = payees.find(
      p => p.name.trim().toLowerCase() === trimmedPayeeName.toLowerCase()
    );

    // If payee does not exist, automatically register in dataset
    if (!targetPayee) {
      targetPayee = await onAddNewPayeeInline({
        name: trimmedPayeeName,
        category,
        totalPaid: 0,
        paymentCount: 0,
      });
    }

    const selectedAccount = accounts.find(a => a.id === fromAccountId);

    const newTx: Transaction = {
      id: initialTransaction?.id || `tx-${Date.now()}`,
      date,
      time,
      amount: numAmount,
      currency,
      payeeId: targetPayee.id,
      payeeName: targetPayee.name,
      fromAccountId,
      fromAccountName: selectedAccount?.name || 'Unknown Account',
      category,
      why: why.trim(),
      project: project.trim() || undefined,
      paymentMode,
      referenceNumber: referenceNumber.trim() || undefined,
      status: 'completed',
      tags: [],
      receiptImage: receiptImage || undefined,
      isReimbursable,
      createdAt: initialTransaction?.createdAt || new Date().toISOString(),
    };

    onSave(newTx);
    onClose();
  };

  const selectedAccount = accounts.find(a => a.id === fromAccountId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              {initialTransaction ? 'Edit Payment Record' : 'Record New Payment'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track to whom you paid, from which account, and why
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Amount Box */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
            <label className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-1">
              Payment Amount *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {currency}
              </span>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Quick Increment Chips */}
            <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/30 overflow-x-auto">
              <span className="text-[10px] text-slate-500 font-medium mr-1">Quick add:</span>
              {[100, 500, 1000, 5000, 10000].map(add => (
                <button
                  key={add}
                  type="button"
                  onClick={() => handleAddAmount(add)}
                  className="px-2 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-2xs hover:bg-indigo-50 transition-colors"
                >
                  +{currency}{add}
                </button>
              ))}
            </div>
          </div>

          {/* Row 1: To Whom I Pay & From Which Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* TO WHOM (Payee) */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                To Whom I Pay (Payee) *
              </label>
              <input
                type="text"
                list="payees-datalist"
                required
                value={payeeName}
                onChange={(e) => {
                  const val = e.target.value;
                  setPayeeName(val);
                  const matched = payees.find(p => p.name.trim().toLowerCase() === val.trim().toLowerCase());
                  if (matched && matched.category) {
                    setCategory(matched.category);
                  }
                }}
                placeholder="Type or select person / vendor..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="payees-datalist">
                {payees.map(p => (
                  <option key={p.id} value={p.name}>
                    {p.nickname ? `${p.nickname} • ` : ''}{p.category}
                  </option>
                ))}
              </datalist>
            </div>

            {/* FROM WHICH ACCOUNT */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  From Which Account *
                </label>
                {selectedAccount && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Avail: {currency}{selectedAccount.balance.toLocaleString()}
                  </span>
                )}
              </div>

              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{accounts.length === 0 ? '-- No Accounts (Add one first) --' : '-- Choose Account --'}</option>
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.institution}) • {a.accountNumberMasked} [Bal: {currency}{a.balance.toLocaleString()}]
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <div className="flex items-center justify-between mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                    ⚠️ You need at least one account to record payments.
                  </span>
                  {onOpenManageAccounts && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenManageAccounts();
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      + Add Account Now
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Row 2: WHY / PURPOSE & SITE / PROJECT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Why / Purpose of Payment *
              </label>
              <input
                type="text"
                required
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                placeholder="e.g., Cement supply, October Rent, Electrician wages..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                For Which Site or Project
              </label>
              <input
                type="text"
                list="sites-projects-list"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="e.g. Site A - Villa, Downtown Office, Site 14..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="sites-projects-list">
                {existingProjects.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 3: Category & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="upi">UPI / QR (Google Pay, PhonePe, Paytm)</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="netbanking">Net Banking (NEFT / RTGS / IMPS)</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

          </div>

          {/* Row 4: Date, Time & Reference Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                UTR / Reference No
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="e.g. UTR-4910284"
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Receipt / Bill Attachment */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
              Receipt / Bill Attachment (Optional)
            </label>
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800 cursor-pointer text-xs text-slate-600 dark:text-slate-400 transition-colors">
              <Camera className="w-4 h-4 text-indigo-500" />
              <span>{receiptImage ? 'Change Receipt / Bill Image' : 'Attach Receipt / Bill Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptUpload}
                className="hidden"
              />
            </label>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{initialTransaction ? 'Update Record' : 'Save Payment Record'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

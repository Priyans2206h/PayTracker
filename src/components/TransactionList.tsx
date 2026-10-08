import React from 'react';
import { Transaction, Payee } from '../types';
import { formatCurrency, formatRelativeDate, getPaymentModeDetails, getCategoryColor } from '../utils/formatters';
import { 
  Building2, 
  Trash2, 
  Edit3, 
  Receipt, 
  Copy, 
  Smartphone, 
  CreditCard, 
  Coins, 
  FileText, 
  ArrowLeftRight, 
  HelpCircle,
  AlertCircle,
  FolderKanban
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  payees: Payee[];
  currency: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (transaction: Transaction) => void;
  onViewReceipt: (transaction: Transaction) => void;
  onSelectPayee: (payeeId: string) => void;
  onSelectAccount: (accountId: string) => void;
  onSelectProject?: (project: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  payees,
  currency,
  onEdit,
  onDelete,
  onDuplicate,
  onViewReceipt,
  onSelectPayee,
  onSelectAccount,
  onSelectProject
}) => {
  const getPayeeAvatar = (payeeId: string, name: string) => {
    const p = payees.find(item => item.id === payeeId);
    const color = p?.avatarColor || 'bg-indigo-500';
    return (
      <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'upi': return <Smartphone className="w-3.5 h-3.5" />;
      case 'credit_card':
      case 'debit_card': return <CreditCard className="w-3.5 h-3.5" />;
      case 'netbanking': return <Building2 className="w-3.5 h-3.5" />;
      case 'cash': return <Coins className="w-3.5 h-3.5" />;
      case 'cheque': return <FileText className="w-3.5 h-3.5" />;
      case 'bank_transfer': return <ArrowLeftRight className="w-3.5 h-3.5" />;
      default: return <HelpCircle className="w-3.5 h-3.5" />;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          No payment records yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-2">
          Your ledger is clean and ready. Click "Record Payment" to add your first payment entry.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => {
        const modeInfo = getPaymentModeDetails(tx.paymentMode);

        return (
          <div
            key={tx.id}
            className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left side: Avatar + Payee ("To Whom") + Why / Purpose */}
            <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
              {/* Payee Avatar */}
              <div 
                className="cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => onSelectPayee(tx.payeeId)}
                title={`Filter payments for ${tx.payeeName}`}
              >
                {getPayeeAvatar(tx.payeeId, tx.payeeName)}
              </div>

              {/* Transaction Main Details */}
              <div className="min-w-0 flex-1">
                {/* Top Line: To Whom + Date */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span 
                    onClick={() => onSelectPayee(tx.payeeId)}
                    className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {tx.payeeName}
                  </span>

                  <span className="text-[11px] text-slate-400 font-medium">
                    • {formatRelativeDate(tx.date)} {tx.time && `at ${tx.time}`}
                  </span>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    tx.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    {tx.status}
                  </span>
                </div>

                {/* Second Line: WHY / PURPOSE (The Core Focus!) */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {tx.why}
                  </span>
                </div>

                {/* Third Line: Source Account ("From Which Account") + Category + Mode + Tags */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* From Account Badge */}
                  <button
                    onClick={() => onSelectAccount(tx.fromAccountId)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                    title="From which account"
                  >
                    <Building2 className="w-3 h-3 text-indigo-500" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{tx.fromAccountName}</span>
                  </button>

                  {/* Site / Project Badge */}
                  {tx.project && (
                    <button
                      onClick={() => onSelectProject?.(tx.project!)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer"
                      title={`Filter payments for ${tx.project}`}
                    >
                      <FolderKanban className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span className="truncate max-w-[140px] sm:max-w-none">{tx.project}</span>
                    </button>
                  )}

                  {/* Category Pill */}
                  <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${getCategoryColor(tx.category)}`}>
                    {tx.category}
                  </span>

                  {/* Payment Mode Pill */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${modeInfo.bg} ${modeInfo.text}`}>
                    {getModeIcon(tx.paymentMode)}
                    <span>{modeInfo.label}</span>
                  </span>

                  {/* Reference UTR */}
                  {tx.referenceNumber && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                      Ref: {tx.referenceNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Amount & Action Buttons */}
            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0 gap-2">
              <div className="text-right">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(tx.amount, currency)}
                </div>
                <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                  Paid Out
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1">
                {/* View Receipt / Voucher */}
                <button
                  onClick={() => onViewReceipt(tx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                  title="View / Print Payment Voucher"
                >
                  <Receipt className="w-4 h-4" />
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => onDuplicate(tx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                  title="Duplicate this payment"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button
                  onClick={() => onEdit(tx)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                  title="Edit payment"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => {
                    if (window.confirm(`Delete payment of ${formatCurrency(tx.amount, currency)} to ${tx.payeeName}?\nThe account balance will be restored.`)) {
                      onDelete(tx.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Delete payment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

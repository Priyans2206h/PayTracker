import React from 'react';
import { Transaction } from '../types';
import { formatCurrency, formatDate, getPaymentModeDetails } from '../utils/formatters';
import { X, Printer, CheckCircle2, Building2, User, FolderKanban } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  currency: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
  currency
}) => {
  if (!transaction) return null;

  const modeInfo = getPaymentModeDetails(transaction.paymentMode);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Top Actions (Hidden when printing) */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between no-print bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Payment Voucher / Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Body */}
        <div className="p-6 sm:p-8 space-y-6 print-card">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Pay<span className="text-indigo-600 dark:text-indigo-400">Tracker</span></span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Official Payment Record & Voucher</p>
            </div>
            
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Voucher ID</span>
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {transaction.id}
              </span>
            </div>
          </div>

          {/* Amount Paid Spotlight */}
          <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Amount Paid
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {formatCurrency(transaction.amount, currency)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {formatDate(transaction.date)} {transaction.time && `• ${transaction.time}`}
            </div>
          </div>

          {/* Core Fields Grid: To Whom, From Account, Why */}
          <div className="space-y-4 text-xs">
            
            {/* TO WHOM */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Paid To (Payee)
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {transaction.payeeName}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {transaction.category}
              </span>
            </div>

            {/* FROM WHICH ACCOUNT */}
            <div className="flex items-start justify-between p-3 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Paid From (Account)
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {transaction.fromAccountName}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Mode: {modeInfo.label}
              </span>
            </div>

            {/* WHY / PURPOSE */}
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 block mb-1">
                Purpose of Payment (Why)
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {transaction.why}
              </div>
            </div>

            {/* SITE / PROJECT IF SPECIFIED */}
            {transaction.project && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold">
                    <FolderKanban className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                      For Site / Project
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {transaction.project}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Number & Mode */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  UTR / Reference No
                </span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {transaction.referenceNumber || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Payment Mode
                </span>
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                  {modeInfo.label}
                </span>
              </div>
            </div>

            {/* Receipt Image if available */}
            {transaction.receiptImage && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Attached Receipt / Bill Proof
                </span>
                <img
                  src={transaction.receiptImage}
                  alt="Receipt voucher"
                  className="rounded-xl border border-slate-200 dark:border-slate-700 max-h-48 object-cover w-full"
                />
              </div>
            )}

          </div>

          {/* Footer Timestamp */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-center text-[10px] text-slate-400 font-mono">
            Generated by PayTracker Ledger • {new Date().toLocaleString()}
          </div>

        </div>

      </div>
    </div>
  );
};

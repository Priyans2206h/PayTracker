import React, { useState, useEffect } from 'react';
import { Transaction, Account, Payee } from '../types';
import { formatCurrency, formatDate, getPaymentModeDetails } from '../utils/formatters';
import { X, FileSpreadsheet, FileText, Download, Printer, Calendar, CheckCircle, Database, User } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  accounts: Account[];
  payees: Payee[];
  currency: string;
  defaultPayeeId?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  accounts,
  payees,
  currency,
  defaultPayeeId = 'all'
}) => {
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_month'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      if (defaultPayeeId && defaultPayeeId !== 'all') {
        setSelectedPayeeId(defaultPayeeId);
      } else {
        setSelectedPayeeId('all');
      }
    }
  }, [isOpen, defaultPayeeId]);

  if (!isOpen) return null;

  // Filter transactions according to selected range, account, and payee (person-wise)
  const getFilteredTransactions = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions.filter(t => {
      // Account filter
      if (selectedAccountId !== 'all' && t.fromAccountId !== selectedAccountId) {
        return false;
      }

      // Person / Payee filter (person-wise)
      if (selectedPayeeId !== 'all') {
        const selectedP = payees.find(p => p.id === selectedPayeeId);
        const matchesId = t.payeeId === selectedPayeeId;
        const matchesName = Boolean(selectedP && t.payeeName.trim().toLowerCase() === selectedP.name.trim().toLowerCase());
        if (!matchesId && !matchesName) return false;
      }

      // Date range filter
      if (dateRange === 'this_month') {
        const d = new Date(t.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      } else if (dateRange === 'last_month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const d = new Date(t.date);
        return d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 1. EXCEL EXPORT HANDLER
  const handleExportExcel = () => {
    const dataToExport = getFilteredTransactions();

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
      'Status'
    ];

    const rows = dataToExport.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.time || ''}"`,
      `"${(t.payeeName || '').replace(/"/g, '""')}"`,
      `"${(t.project || 'General').replace(/"/g, '""')}"`,
      `"${(t.fromAccountName || '').replace(/"/g, '""')}"`,
      `"${(t.why || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${currency}"`,
      `"${t.paymentMode}"`,
      `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${t.status}"`
    ]);

    // Prepend UTF-8 BOM (\uFEFF) so Excel recognizes UTF-8 formatting & symbols properly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const selectedPayee = selectedPayeeId === 'all' ? null : payees.find(p => p.id === selectedPayeeId);
    const personSuffix = selectedPayee ? `_${selectedPayee.name.replace(/[^a-zA-Z0-9]/g, '_')}` : '';
    const rangeSuffix = dateRange === 'all' ? 'All' : dateRange === 'this_month' ? 'ThisMonth' : 'LastMonth';
    link.setAttribute('download', `PayTracker_Payments${personSuffix}_${rangeSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. PDF STATEMENT EXPORT HANDLER
  const handleExportPDF = () => {
    const dataToExport = getFilteredTransactions();
    const totalOutflow = dataToExport.reduce((sum, t) => sum + t.amount, 0);

    const rangeLabel = 
      dateRange === 'all' ? 'All Recorded Transactions' :
      dateRange === 'this_month' ? 'Current Month Statement' : 'Last Month Statement';

    const accountLabel = selectedAccountId === 'all' 
      ? 'All Payment Sources' 
      : accounts.find(a => a.id === selectedAccountId)?.name || 'Selected Account';

    const selectedPayee = selectedPayeeId === 'all' ? null : payees.find(p => p.id === selectedPayeeId);
    const personLabel = selectedPayee ? `${selectedPayee.name} (${selectedPayee.category})` : 'All Persons (Consolidated)';

    // Build standalone printable HTML document for clean PDF rendering
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate and save your PDF statement.');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PayTracker Payment Statement - ${rangeLabel}</title>
        <meta charset="utf-8">
        <style>
          @media print {
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            margin: 0;
            padding: 20px;
            font-size: 11px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .brand {
            font-size: 20px;
            font-weight: 800;
            color: #0f172a;
          }
          .brand span {
            color: #4f46e5;
          }
          .subtitle {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
          }
          .meta {
            text-align: right;
            font-size: 10px;
            color: #64748b;
          }
          .meta strong {
            color: #0f172a;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
          }
          .summary-label {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
          }
          .summary-value {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          .summary-value.highlight {
            color: #dc2626;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          th {
            background: #f1f5f9;
            color: #475569;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            font-size: 10px;
          }
          tr:nth-child(even) td {
            background-color: #fafafa;
          }
          .amount-cell {
            text-align: right;
            font-weight: 700;
            color: #0f172a;
          }
          .mode-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 600;
            background: #f1f5f9;
            color: #334155;
          }
          .footer {
            margin-top: 24px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Pay<span>Tracker</span> ${selectedPayee ? 'Person Statement' : 'Ledger'}</div>
            <div class="subtitle">
              ${selectedPayee ? `Official Payment History & Statement for ${selectedPayee.name}` : 'Official Payment Records & Outflow Statement'}
            </div>
          </div>
          <div class="meta">
            <div>Period: <strong>${rangeLabel}</strong></div>
            <div>Person / Payee: <strong>${personLabel}</strong></div>
            <div>Account Filter: <strong>${accountLabel}</strong></div>
            <div>Generated: <strong>${new Date().toLocaleString()}</strong></div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">${selectedPayee ? `Total Paid to ${selectedPayee.name}` : 'Total Outflow Amount'}</div>
            <div class="summary-value highlight">${formatCurrency(totalOutflow, currency)}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Payments Recorded</div>
            <div class="summary-value">${dataToExport.length}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Average Payment Value</div>
            <div class="summary-value">
              ${formatCurrency(dataToExport.length > 0 ? Math.round(totalOutflow / dataToExport.length) : 0, currency)}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 10%;">Date</th>
              <th style="width: 18%;">To Whom (Payee)</th>
              <th style="width: 18%;">From Account</th>
              <th style="width: 26%;">Why / Purpose</th>
              <th style="width: 12%;">Mode & Ref</th>
              <th style="width: 16%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${dataToExport.map(t => {
              const mode = getPaymentModeDetails(t.paymentMode);
              return `
                <tr>
                  <td>
                    <strong>${formatDate(t.date)}</strong>
                    ${t.time ? `<div style="font-size: 8px; color: #94a3b8;">${t.time}</div>` : ''}
                  </td>
                  <td>
                    <strong>${t.payeeName}</strong>
                    <div style="font-size: 8px; color: #64748b;">${t.category}</div>
                  </td>
                  <td>
                    <strong>${t.fromAccountName}</strong>
                  </td>
                  <td>
                    <strong>${t.why}</strong>
                    ${t.project ? `<div style="font-size: 8px; color: #b45309; font-weight: 600; margin-top: 2px;">📁 ${t.project}</div>` : ''}
                    ${t.notes ? `<div style="font-size: 8px; color: #64748b; font-style: italic;">"${t.notes}"</div>` : ''}
                  </td>
                  <td>
                    <span class="mode-badge">${mode.label}</span>
                    ${t.referenceNumber ? `<div style="font-size: 8px; color: #94a3b8; font-family: monospace;">${t.referenceNumber}</div>` : ''}
                  </td>
                  <td class="amount-cell">
                    ${formatCurrency(t.amount, currency)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>PayTracker Personal Financial Ledger • Confidential Statement</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // 3. JSON DATA BACKUP HANDLER (FULL OR PERSON-WISE)
  const handleExportJSON = () => {
    const dataToExport = getFilteredTransactions();
    const selectedPayee = selectedPayeeId === 'all' ? null : payees.find(p => p.id === selectedPayeeId);

    const backupPayload = selectedPayee ? {
      backupType: 'person_wise_history_backup',
      exportedAt: new Date().toISOString(),
      person: {
        id: selectedPayee.id,
        name: selectedPayee.name,
        category: selectedPayee.category,
        nickname: selectedPayee.nickname,
        phone: selectedPayee.phone,
        upiId: selectedPayee.upiId,
        totalPaidLifetime: selectedPayee.totalPaid,
        paymentCountLifetime: selectedPayee.paymentCount,
      },
      scope: {
        dateRange,
        accountId: selectedAccountId,
        accountName: selectedAccountId === 'all' ? 'All Accounts' : accounts.find(a => a.id === selectedAccountId)?.name,
      },
      summary: {
        totalAmount: dataToExport.reduce((sum, t) => sum + t.amount, 0),
        transactionCount: dataToExport.length,
        currency,
      },
      transactions: dataToExport,
    } : {
      backupType: 'full_consolidated_backup',
      exportedAt: new Date().toISOString(),
      version: '1.0',
      summary: {
        totalAmount: dataToExport.reduce((sum, t) => sum + t.amount, 0),
        transactionCount: dataToExport.length,
        currency,
      },
      accounts: selectedAccountId === 'all' ? accounts : accounts.filter(a => a.id === selectedAccountId),
      payees,
      transactions: dataToExport,
    };

    const jsonContent = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const personSuffix = selectedPayee ? `_${selectedPayee.name.replace(/[^a-zA-Z0-9]/g, '_')}` : '_All';
    link.setAttribute('download', `PayTracker_Backup${personSuffix}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCount = getFilteredTransactions().length;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Export & Backup Payment Records
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export to Excel, PDF Statement, or JSON Data Backup (Full or Person-wise)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope Configuration */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Select Export Scope
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {filteredCount} records included
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Time Period
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">All Time (All Payments)</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Payment Source Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="all">All Accounts (Consolidated)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumberMasked})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Person / Payee (Person-wise)
                </label>
                <select
                  value={selectedPayeeId}
                  onChange={(e) => setSelectedPayeeId(e.target.value)}
                  className={`w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
                    selectedPayeeId !== 'all'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  <option value="all">All Persons (Consolidated)</option>
                  {payees.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.nickname ? `(${p.nickname})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedPayeeId !== 'all' && (
              <div className="flex items-center gap-2 p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-700 dark:text-purple-300 font-semibold">
                <User className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Person-wise Filter Active: <strong>{payees.find(p => p.id === selectedPayeeId)?.name}</strong> ({filteredCount} records)</span>
              </div>
            )}
          </div>

          {/* EXPORT & BACKUP OPTIONS: EXCEL, PDF & JSON BACKUP */}
          <div className="space-y-3.5">
            
            {/* OPTION 1: EXCEL (.xlsx / .csv) */}
            <div className="group p-4 rounded-2xl border-2 border-emerald-100 hover:border-emerald-300 dark:border-emerald-950 dark:hover:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0">
                  <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Excel Spreadsheet</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      .CSV / Excel
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Structured columns ready for Microsoft Excel & Google Sheets with UTF-8 encoding.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportExcel}
                disabled={filteredCount === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>

            {/* OPTION 2: PDF STATEMENT (.pdf) */}
            <div className="group p-4 rounded-2xl border-2 border-rose-100 hover:border-rose-300 dark:border-rose-950 dark:hover:border-rose-800 bg-rose-50/30 dark:bg-rose-950/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/20 shrink-0">
                  <FileText className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>PDF Statement</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      .PDF
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Official financial statement with summary totals, account metrics, and formatted ledger table.
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportPDF}
                disabled={filteredCount === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>

            {/* OPTION 3: JSON DATA BACKUP (.json) */}
            <div className="group p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 dark:border-indigo-950 dark:hover:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20 shrink-0">
                  <Database className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{selectedPayeeId !== 'all' ? 'Person Data Backup' : 'Complete Data Backup'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      .JSON
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedPayeeId !== 'all'
                      ? `Full raw JSON backup of all payments and profile details for ${payees.find(p => p.id === selectedPayeeId)?.name}.`
                      : 'Raw JSON backup of all payment records, payees, and accounts for full data safekeeping.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportJSON}
                disabled={filteredCount === 0}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Backup</span>
              </button>
            </div>

          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Exports include Person (To Whom), Account (From), Why, Category, Mode, and Amount</span>
          </div>

        </div>

      </div>
    </div>
  );
};

import { PaymentMode } from '../types';

export const formatCurrency = (amount: number, _currency: string = '₹'): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Indian numbering format (e.g. ₹ 1,50,000)
  const formattedNumber = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
  });

  return `${isNegative ? '-' : ''}₹${formattedNumber}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  
  return formatDate(dateStr);
};

export const getPaymentModeDetails = (mode: PaymentMode): { label: string; bg: string; text: string; icon: string } => {
  switch (mode) {
    case 'upi':
      return { label: 'UPI / QR', bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', icon: 'Smartphone' };
    case 'credit_card':
      return { label: 'Credit Card', bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', icon: 'CreditCard' };
    case 'debit_card':
      return { label: 'Debit Card', bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', icon: 'CreditCard' };
    case 'netbanking':
      return { label: 'Net Banking', bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', icon: 'Building2' };
    case 'cash':
      return { label: 'Cash', bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', icon: 'Coins' };
    case 'cheque':
      return { label: 'Cheque', bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', icon: 'FileText' };
    case 'bank_transfer':
      return { label: 'Bank Transfer', bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', icon: 'ArrowLeftRight' };
    default:
      return { label: 'Other', bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', icon: 'HelpCircle' };
  }
};

export const getAccountBadgeColor = (type: string): string => {
  switch (type) {
    case 'bank':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    case 'credit_card':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border-rose-200 dark:border-rose-800';
    case 'wallet':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800';
    case 'cash':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-200 dark:border-amber-800';
    case 'savings':
      return 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200 border-violet-200 dark:border-violet-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
  }
};

export const getCategoryColor = (category: string): string => {
  const cat = category.toLowerCase();
  if (cat.includes('salary') || cat.includes('wages') || cat.includes('payroll')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
  if (cat.includes('hardware') || cat.includes('material') || cat.includes('tool')) return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300';
  if (cat.includes('labour') || cat.includes('labor') || cat.includes('worker')) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
  if (cat.includes('transport') || cat.includes('freight') || cat.includes('logistics')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300';
  if (cat.includes('rent') || cat.includes('housing')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
  if (cat.includes('grocer') || cat.includes('food')) return 'bg-lime-100 text-lime-800 dark:bg-lime-950/70 dark:text-lime-300';
  if (cat.includes('utilit') || cat.includes('bill') || cat.includes('power')) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
  if (cat.includes('staff') || cat.includes('maid')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/70 dark:text-yellow-300';
  if (cat.includes('health') || cat.includes('medical') || cat.includes('doctor')) return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300';
  if (cat.includes('gym') || cat.includes('fit')) return 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300';
  if (cat.includes('shop') || cat.includes('amazon')) return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300';
  if (cat.includes('dining') || cat.includes('restaurant')) return 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300';
  if (cat.includes('split') || cat.includes('friend') || cat.includes('personal')) return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300';
  if (cat.includes('travel') || cat.includes('commute')) return 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300';
  return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
};

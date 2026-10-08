import { Account, Payee, Transaction } from '../types';

export const INITIAL_ACCOUNTS: Account[] = [];

export const INITIAL_PAYEES: Payee[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];


export const CATEGORIES = [
  { name: 'Salary', icon: 'Banknote', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { name: 'Hardware', icon: 'Wrench', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  { name: 'Labour', icon: 'HardHat', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  { name: 'Transport', icon: 'Truck', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' },
  { name: 'Labour Transport', icon: 'Car', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
  { name: 'Housing & Rent', icon: 'Home', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { name: 'Food & Groceries', icon: 'ShoppingBag', color: 'bg-lime-100 text-lime-800 dark:bg-lime-950/60 dark:text-lime-300' },
  { name: 'Utilities', icon: 'Zap', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  { name: 'Household Staff', icon: 'Users', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300' },
  { name: 'Health & Medical', icon: 'HeartPulse', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
  { name: 'Fitness & Health', icon: 'Activity', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300' },
  { name: 'Shopping', icon: 'ShoppingBag', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
  { name: 'Dining Out', icon: 'UtensilsCrossed', color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
  { name: 'Personal & Splits', icon: 'UserCheck', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
  { name: 'Travel & Commute', icon: 'Car', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
  { name: 'Education & Courses', icon: 'GraduationCap', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
  { name: 'Loans & EMI', icon: 'Banknote', color: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300' },
  { name: 'Investments', icon: 'TrendingUp', color: 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300' },
  { name: 'Other / Miscellaneous', icon: 'HelpCircle', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' },
];

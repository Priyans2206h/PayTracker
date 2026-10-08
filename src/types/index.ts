export type AccountType = 'bank' | 'credit_card' | 'wallet' | 'cash' | 'savings' | 'other';

export type PaymentMode = 
  | 'upi' 
  | 'credit_card' 
  | 'debit_card' 
  | 'netbanking' 
  | 'cash' 
  | 'cheque' 
  | 'bank_transfer' 
  | 'other';

export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'scheduled';

export interface Account {
  id: string;
  name: string;             // e.g. "HDFC Salary Account"
  institution: string;      // e.g. "HDFC Bank"
  type: AccountType;
  accountNumberMasked: string; // e.g. "•• 8942"
  balance: number;          // Current balance
  currency: string;         // e.g. "₹"
  color: string;            // hex or tailwind color
  isDefault?: boolean;
}

export interface Payee {
  id: string;
  name: string;             // e.g. "Ramesh Landlord"
  nickname?: string;
  category: string;         // e.g. "Housing"
  phone?: string;
  upiId?: string;
  email?: string;
  notes?: string;
  avatarColor?: string;
  totalPaid: number;        // Computed or cached total
  paymentCount: number;
  lastPaidDate?: string;
}

export interface Transaction {
  id: string;
  date: string;             // YYYY-MM-DD
  time?: string;            // HH:mm
  amount: number;
  currency: string;
  
  // To whom
  payeeId: string;
  payeeName: string;
  
  // From which account
  fromAccountId: string;
  fromAccountName: string;
  
  // Why / Purpose
  category: string;         // e.g., "Housing & Rent", "Utilities", "Food & Groceries"
  why: string;              // Primary reason: "October House Rent & Water Bill"
  project?: string;         // Site / Project: e.g. "Site A - Whitefield Villa", "Office Renovation"
  notes?: string;           // Detailed notes/remarks
  
  // Additional details
  paymentMode: PaymentMode;
  referenceNumber?: string; // UTR / Transaction ID / Receipt #
  status: PaymentStatus;
  tags: string[];           // e.g. ["#rent", "#personal", "#tax-deductible"]
  receiptImage?: string;    // Base64 or object URL of receipt
  isReimbursable?: boolean;
  isReimbursed?: boolean;
  createdAt: string;
}

export interface FilterOptions {
  search: string;
  dateRange: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom';
  startDate?: string;
  endDate?: string;
  accountId: string;
  payeeId: string;
  category: string;
  project?: string;
  paymentMode: string;
  status: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

export interface SpendingSummary {
  totalSpent: number;
  transactionCount: number;
  byCategory: Record<string, number>;
  byPayee: Record<string, { amount: number; count: number; name: string }>;
  byAccount: Record<string, { amount: number; count: number; name: string }>;
  byProject?: Record<string, { amount: number; count: number; name: string }>;
  byPaymentMode: Record<string, number>;
  dailyTrend: { date: string; amount: number }[];
}

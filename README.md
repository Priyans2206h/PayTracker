# PayTracker 💳

A modern, privacy-first personal payment tracker and ledger built with React, TypeScript, and Tailwind CSS. Keep and maintain complete records of every single payment: **to whom you paid**, **from which account**, **why (the exact reason/purpose)**, amount, payment method, reference/UTR IDs, receipt attachments, and more.

---

## 🌟 Key Features

### 1. 👥 "To Whom I Pay" (Payee Directory & Auto-Registration)
- Dedicated directory of all recipients: Landlords, domestic staff, utility companies, vendors, contractors, workers, etc.
- **Smart Auto-Registration**: Type any name while recording a payment and it is automatically added to your beneficiaries directory.
- Contact details: UPI ID, Phone number, Category, and Nickname.
- **Lifetime Outflow Tracking**: View total lifetime amount paid to each person and total payment count.
- **Individual Payee Ledger & Exports**: 1-click drilldown to view person-specific payment history, and export individual PDF/Excel/JSON statements.

### 2. 📁 Site / Project Wise Cost Tracking
- Assign payments to specific sites, properties, or projects (e.g., *Site A - Villa*, *Downtown Office*, *Warehouse Renovation*).
- **Dedicated Projects View**: Real-time total expenditure per project, payment count, and recipient cost breakdown.
- Filter and drill down into all payments for any project with a single click.

### 2. 🏦 "From Which Account" (Payment Source Balances)
- Multiple account support:
  - **Bank Accounts** (e.g. HDFC Salary Account, ICICI Savings)
  - **Credit Cards** (e.g. Axis Bank Card with available limit tracking)
  - **UPI Wallets** (Google Pay, PhonePe, Paytm)
  - **Cash in Hand** (Petty Cash Wallet)
- **Automatic Balance Reconciliation**: Balances are automatically deducted when payments are recorded and restored if a payment is deleted or edited.
- Outflow tracking per account: See exactly how much money leaves each bank or card.

### 3. 🎯 "Why I Paid" (Purpose, Reasons & Categorization)
- Prominent display of the exact reason ("Why") on every payment record (e.g., *October House Rent & Maintenance*, *Weekly Groceries*, *Electricity Bill Flat 402*, *Dinner split with friends*).
- 14 pre-configured categories with colored indicators and icons.
- Quick preset buttons for instant recording: Rent, Groceries, Electricity, Broadband, Maid/Cook Salary, Food Delivery.
- Tagging system (e.g., `#rent`, `#personal`, `#tax-deductible`, `#reimbursable`).

### 4. 📝 Rich Payment Details & Records
- **Payment Modes**: UPI / QR, Credit Card, Debit Card, Net Banking (NEFT/RTGS/IMPS), Cash, Cheque, Bank Transfer.
- **Reference & UTR Numbers**: Store bank UTR, invoice numbers, or transaction IDs.
- **Voucher / Printable Receipt Modal**: View and print clean payment vouchers or save them as PDFs.
- **Receipt Proof Upload**: Attach photos of bills, receipts, or screenshots stored safely in your local offline storage.

### 5. 📊 Analytics & Interactive Dashboards
- **Paid This Month** vs. **Paid Today** summary cards.
- **Visual Breakdown by Why (Categories)**: Progress bars with percentages and currency totals.
- **Visual Breakdown by To Whom (Top Payees)**: Ranked leaderboard of recipients.
- **Visual Breakdown by From Which Account**: Outflow share across your payment sources.
- Click any slice or category to filter the ledger immediately!

### 6. 🔍 Powerful Search & Filters
- Instant search across payee names, reasons/why, accounts, notes, and UTR numbers.
- Filter by date preset (All Time, Today, This Week, This Month, Last Month) or custom criteria.
- Filter by Account, Payee, Category, Payment Mode, or Amount range.
- Sort by Date (newest/oldest) or Amount (highest/lowest).

### 7. 🔒 Privacy & Data Portability
- **100% Private & Local-First**: All data is stored securely in your browser's local storage. No third-party servers track your sensitive financial records.
- **Export to Excel (.xlsx / .csv)**: Download standard spreadsheet files compatible with Microsoft Excel, Apple Numbers, and Google Sheets, complete with UTF-8 BOM encoding.
- **Export to PDF Statement**: Generate official payment statements with summary metrics, account breakdown, and tabular transaction records ready to save as PDF.
- **Multi-Currency Support**: Instant toggle between ₹ (INR), $ (USD), € (EUR), £ (GBP), and ¥ (JPY).
- **Dark Mode**: Seamless toggle between sleek Dark and clean Light modes.

---

## 🚀 How to Run the App

1. In the project directory (`/Users/priyanshpatel/Downloads/PayTracker`), launch the local dev server:
   ```bash
   npm run dev
   ```
2. Open your web browser at:
   ```
   http://localhost:5173
   ```
3. Or to launch and automatically open your browser in one command:
   ```bash
   npm start
   ```

---

## 🛠️ Tech Stack
- **React 18** with **TypeScript**
- **Vite 6** (lightning-fast build tool and HMR)
- **Tailwind CSS** (responsive, modern UI styling)
- **Lucide Icons** (clean icons for finance, banking, and payment methods)
- **Local Storage Engine** (reactive event-bus with ACID balance adjustments and CSV/JSON backup)

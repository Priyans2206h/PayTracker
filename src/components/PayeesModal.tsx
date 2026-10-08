import React, { useState } from 'react';
import { Payee } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES } from '../data/initialData';
import { X, Users, Plus, Trash2, Edit2, Check, Smartphone, ArrowUpRight, Search } from 'lucide-react';

interface PayeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  payees: Payee[];
  onSavePayee: (payee: Payee) => void;
  onDeletePayee: (id: string) => void;
  currency: string;
  onSelectPayeeLedger: (payeeId: string) => void;
}

export const PayeesModal: React.FC<PayeesModalProps> = ({
  isOpen,
  onClose,
  payees,
  onSavePayee,
  onDeletePayee,
  currency,
  onSelectPayeeLedger
}) => {
  const [search, setSearch] = useState('');
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [category, setCategory] = useState('Housing & Rent');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingPayee(null);
    setName('');
    setNickname('');
    setCategory('Salary');
    setPhone('');
    setUpiId('');
    setNotes('');
  };

  const handleStartEdit = (payee: Payee) => {
    setEditingPayee(payee);
    setIsCreating(false);
    setName(payee.name);
    setNickname(payee.nickname || '');
    setCategory(payee.category);
    setPhone(payee.phone || '');
    setUpiId(payee.upiId || '');
    setNotes(payee.notes || '');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500', 'bg-cyan-500', 'bg-orange-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const updated: Payee = {
      id: editingPayee ? editingPayee.id : `payee-${Date.now()}`,
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      category,
      phone: phone.trim() || undefined,
      upiId: upiId.trim() || undefined,
      notes: notes.trim() || undefined,
      avatarColor: editingPayee?.avatarColor || randomColor,
      totalPaid: editingPayee ? editingPayee.totalPaid : 0,
      paymentCount: editingPayee ? editingPayee.paymentCount : 0,
      lastPaidDate: editingPayee?.lastPaidDate,
    };

    onSavePayee(updated);
    setIsCreating(false);
    setEditingPayee(null);
  };

  const filteredPayees = payees.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase())) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Payees Directory ("To Whom I Pay")
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maintain beneficiaries, landlords, staff, utility providers, and friends
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
          
          {/* Search & Add New Payee Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search payees by name, nickname, or category..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {!isCreating && !editingPayee && (
              <button
                onClick={handleStartCreate}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New Payee
              </button>
            )}
          </div>

          {/* Create / Edit Payee Form */}
          {(isCreating || editingPayee) && (
            <form onSubmit={handleSave} className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-900/50 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                {editingPayee ? 'Edit Payee Profile' : 'Create New Payee'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Payee / Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Nickname / Role
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. Landlord, Cook, Supermarket"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    UPI ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. name@okaxis"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Notes / Details
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Flat #402 rent and maintenance contact"
                  className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setEditingPayee(null); }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-purple-700 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Payee
                </button>
              </div>
            </form>
          )}

          {/* Payees List */}
          {filteredPayees.length === 0 && !isCreating && !editingPayee ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {search ? 'No payees match your search' : 'No payees added yet'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {search ? 'Try clearing or changing your search terms.' : 'Click "Add New Payee" to register your first payee.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPayees.map(payee => (
                <div
                  key={payee.id}
                  className="flex flex-col justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all hover:shadow-sm"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${payee.avatarColor || 'bg-purple-600'} text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0`}>
                          {payee.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {payee.name}
                          </div>
                          {payee.nickname && (
                            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                              {payee.nickname}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {payee.category}
                      </span>
                    </div>

                    {/* Extra details (UPI, Phone, Notes) */}
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      {payee.upiId && (
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Smartphone className="w-3 h-3 text-emerald-500" />
                          <span>{payee.upiId}</span>
                        </div>
                      )}
                      {payee.phone && (
                        <div className="text-[11px]">{payee.phone}</div>
                      )}
                      {payee.notes && (
                        <div className="text-[11px] italic text-slate-400 line-clamp-1">"{payee.notes}"</div>
                      )}
                    </div>
                  </div>

                  {/* Ledger summary & Action Buttons */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Paid Out</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(payee.totalPaid, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1.5">
                        ({payee.paymentCount} {payee.paymentCount === 1 ? 'payment' : 'payments'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onSelectPayeeLedger(payee.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-1"
                        title="View all payments made to this person"
                      >
                        Ledger <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleStartEdit(payee)}
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete payee ${payee.name}?`)) {
                            onDeletePayee(payee.id);
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

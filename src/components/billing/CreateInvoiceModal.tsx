import React, { useState } from 'react';
import { X, Plus, Trash2, Calculator, Sparkles, Building2, User, Check, AlertCircle } from 'lucide-react';
import { BillingInvoice, InvoiceItem, InvoiceStatus } from '../../types';

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInvoice: (newInvoice: BillingInvoice) => void;
  triggerToast: (msg: string) => void;
}

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onCreateInvoice,
  triggerToast
}: CreateInvoiceModalProps) {
  // Form states
  const [guestName, setGuestName] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('+91 ');
  const [roomNumber, setRoomNumber] = useState('Villa 304');
  const [companyName, setCompanyName] = useState('');
  const [guestGstin, setGuestGstin] = useState('');
  const [issueDate, setIssueDate] = useState('Oct 25, 2023');
  const [dueDate, setDueDate] = useState('Oct 25, 2023');
  const [status, setStatus] = useState<InvoiceStatus>('Pending');
  const [discount, setDiscount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('Thank you for staying with ResortDesk Resort & Spa.');

  // Dynamic Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-new-1',
      description: 'Heritage Sea-Facing Suite (2 Nights)',
      sacCode: '996311',
      qty: 2,
      unitPrice: 16000,
      gstRate: 18,
      amount: 32000,
      gstAmount: 5760
    },
    {
      id: 'item-new-2',
      description: 'Coastal Deck Fine Dining & In-Room Dining',
      sacCode: '996331',
      qty: 1,
      unitPrice: 4500,
      gstRate: 18,
      amount: 4500,
      gstAmount: 810
    }
  ]);

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (it.qty * it.unitPrice), 0);
  const gstAmount = items.reduce((acc, it) => acc + ((it.qty * it.unitPrice * it.gstRate) / 100), 0);
  const totalAmount = Math.max(0, subtotal + gstAmount - discount);
  const dueAmount = status === 'Paid' ? 0 : Math.max(0, totalAmount - advancePaid);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-custom-${Date.now()}`,
      description: 'Ayurvedic Spa & Wellness Session',
      sacCode: '999721',
      qty: 1,
      unitPrice: 3500,
      gstRate: 18,
      amount: 3500,
      gstAmount: 630
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        if (field === 'qty' || field === 'unitPrice' || field === 'gstRate') {
          const qty = field === 'qty' ? Number(val) : item.qty;
          const unitPrice = field === 'unitPrice' ? Number(val) : item.unitPrice;
          const gstRate = field === 'gstRate' ? Number(val) : item.gstRate;
          updated.amount = qty * unitPrice;
          updated.gstAmount = (updated.amount * gstRate) / 100;
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      triggerToast('Please enter the Guest Name');
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNum = `INV-2023-${randomNum}`;

    const newInvoice: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      guestName,
      bookingId: bookingId || `BK-${Math.floor(100 + Math.random() * 900)}`,
      guestEmail: guestEmail || undefined,
      guestPhone: guestPhone || undefined,
      companyName: companyName || undefined,
      guestGstin: guestGstin || undefined,
      roomNumber,
      issueDate,
      dueDate,
      items,
      subtotal,
      gstAmount,
      cgstAmount: gstAmount / 2,
      sgstAmount: gstAmount / 2,
      discount,
      totalAmount,
      paidAmount: status === 'Paid' ? totalAmount : advancePaid,
      dueAmount,
      status: status === 'Paid' ? 'Paid' : (advancePaid > 0 ? 'Partial' : 'Pending'),
      paymentMethod: status === 'Paid' || advancePaid > 0 ? paymentMethod : undefined,
      notes
    };

    onCreateInvoice(newInvoice);
    triggerToast(`Invoice ${invoiceNum} generated for ₹${new Intl.NumberFormat('en-IN').format(totalAmount)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#0c4033] text-white p-5 px-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">Create GST Tax Invoice</h3>
              <p className="text-xs text-emerald-200/80">SAC 9963 compliant billing for accommodation &amp; resort services</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-6 text-slate-800">
          {/* Guest & Room Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Guest Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Siddharth Singhania"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Room / Villa No.
              </label>
              <input
                type="text"
                placeholder="e.g. Villa 304"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Booking Reference
              </label>
              <input
                type="text"
                placeholder="e.g. BK-994A"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Phone (for WhatsApp Bill)
              </label>
              <input
                type="text"
                placeholder="+91 98200 12345"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Optional Corporate GSTIN section */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-700">B2B Corporate Billing (Optional)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company / Entity Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-teal-700"
              />
              <input
                type="text"
                placeholder="Guest GSTIN (e.g. 27AAAC...)"
                value={guestGstin}
                onChange={(e) => setGuestGstin(e.target.value.toUpperCase())}
                className="border border-slate-200 bg-white rounded-xl px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Tariff &amp; Charge Line Items
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-800 hover:text-teal-950 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-2 w-20">SAC</th>
                    <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                    <th className="py-2.5 px-2 w-24 text-right">Price (₹)</th>
                    <th className="py-2.5 px-2 w-20 text-center">GST %</th>
                    <th className="py-2.5 px-3 w-24 text-right">Total (₹)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.sacCode || '996311'}
                          onChange={(e) => handleItemChange(item.id, 'sacCode', e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-1.5 py-1 text-[11px] font-mono text-center text-slate-600 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-1.5 py-1 text-xs text-center text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-1.5 py-1 text-xs text-right text-slate-800 focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => handleItemChange(item.id, 'gstRate', Number(e.target.value))}
                          className="w-full bg-slate-50/50 border border-slate-200 rounded-lg px-1 py-1 text-xs text-center text-slate-800 focus:bg-white focus:outline-none"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-900">
                        ₹{(item.amount + item.gstAmount).toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown & Payment Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                Payment Status &amp; Method
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Paid')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    status === 'Paid' 
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Mark as Paid
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Pending')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    status === 'Pending' 
                      ? 'bg-amber-700 text-white border-amber-700 shadow-xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Mark as Pending
                </button>
              </div>

              <div className="mt-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Payment Mode</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-700"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit Card (POS Terminal)</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Netbanking">Netbanking / NEFT / RTGS</option>
                  <option value="Cash">Cash at Front Desk</option>
                  <option value="Corporate Billing">Corporate Billing (Purchase Order)</option>
                </select>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="flex flex-col gap-2 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-6 pt-3 sm:pt-0">
              <div className="flex justify-between text-slate-600">
                <span>Taxable Subtotal:</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-indigo-700">
                <span>GST (CGST + SGST):</span>
                <span className="font-semibold">₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Discount / Voucher:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-24 text-right bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs"
                />
              </div>
              <div className="border-t border-slate-200 my-1 pt-2 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Invoice Value:</span>
                <span className="text-[#0c4033] font-sans text-base">₹{totalAmount.toLocaleString()}</span>
              </div>
              {status !== 'Paid' && (
                <div className="flex justify-between text-xs text-amber-800 font-medium">
                  <span>Balance Due:</span>
                  <span>₹{dueAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#0c4033] hover:bg-[#082e25] rounded-xl shadow-md shadow-[#0c4033]/20 transition-all cursor-pointer active:scale-98 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Generate &amp; Save Invoice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

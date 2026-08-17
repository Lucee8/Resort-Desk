import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Plus, 
  Trash2, 
  Building2, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Truck,
  Sparkles,
  Calculator
} from 'lucide-react';
import { InventoryItem, PurchaseOrder, PurchaseOrderItem } from '../../types';

interface LogPurchaseModalProps {
  items: InventoryItem[];
  existingSuppliers: string[];
  onClose: () => void;
  onSubmitPO: (newPO: Omit<PurchaseOrder, 'id'>, autoReceiveStock: boolean) => void;
}

export default function LogPurchaseModal({
  items,
  existingSuppliers,
  onClose,
  onSubmitPO
}: LogPurchaseModalProps) {
  const [supplierName, setSupplierName] = useState(existingSuppliers[0] || 'Oceanic Textiles Ltd.');
  const [poNumber, setPoNumber] = useState(`PO-2023-${Math.floor(130 + Math.random() * 800)}`);
  const [orderDate, setOrderDate] = useState(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [paymentStatus, setPaymentStatus] = useState<PurchaseOrder['paymentStatus']>('Pending');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer (NEFT)');
  const [notes, setNotes] = useState('Urgent delivery requested for weekend banquet operations.');

  // Multi line items
  const [lineItems, setLineItems] = useState<PurchaseOrderItem[]>([
    {
      itemId: items[0]?.id || 'inv-1',
      name: items[0]?.name || 'Luxury Cotton Towels',
      unit: items[0]?.unit || 'pieces',
      quantity: 50,
      unitPrice: items[0]?.costPerUnit || 350,
      total: 50 * (items[0]?.costPerUnit || 350)
    }
  ]);

  const [taxRate, setTaxRate] = useState<number>(18);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Add line item
  const handleAddLineItem = () => {
    const defaultItem = items[0] || { id: 'inv-1', name: 'Item', unit: 'units', costPerUnit: 100 };
    setLineItems([
      ...lineItems,
      {
        itemId: defaultItem.id,
        name: defaultItem.name,
        unit: defaultItem.unit,
        quantity: 20,
        unitPrice: defaultItem.costPerUnit,
        total: 20 * defaultItem.costPerUnit
      }
    ]);
  };

  // Remove line item
  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== index));
  };

  // Update line item
  const handleUpdateLineItem = (index: number, field: 'itemId' | 'quantity' | 'unitPrice', value: any) => {
    const updated = [...lineItems];
    if (field === 'itemId') {
      const selected = items.find(i => i.id === value);
      if (selected) {
        updated[index].itemId = selected.id;
        updated[index].name = selected.name;
        updated[index].unit = selected.unit;
        updated[index].unitPrice = selected.costPerUnit;
        updated[index].total = updated[index].quantity * selected.costPerUnit;
      }
    } else if (field === 'quantity') {
      const q = Math.max(1, Number(value) || 1);
      updated[index].quantity = q;
      updated[index].total = q * updated[index].unitPrice;
    } else if (field === 'unitPrice') {
      const p = Math.max(0, Number(value) || 0);
      updated[index].unitPrice = p;
      updated[index].total = updated[index].quantity * p;
    }
    setLineItems(updated);
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subtotal * (taxRate / 100));
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleSubmit = (status: PurchaseOrder['status'], autoReceiveStock: boolean) => {
    onSubmitPO({
      poNumber,
      supplierName,
      orderDate,
      expectedDelivery,
      status,
      items: lineItems,
      subtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount: grandTotal,
      paymentStatus,
      notes
    }, autoReceiveStock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <FileText className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Log Purchase Order
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Record new vendor procurements, invoice items, and payment schedules.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Supplier & Header Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Vendor / Supplier *
              </label>
              <select
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
              >
                {existingSuppliers.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                PO / Invoice Reference *
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                className="w-full bg-slate-50 font-mono text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Expected Delivery Date
              </label>
              <input
                type="text"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                placeholder="e.g. Oct 24, 2023"
                className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Procurement Line Items
              </span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Item Row</span>
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((li, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  {/* Item Selector */}
                  <div className="w-full sm:flex-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Supply Item
                    </label>
                    <select
                      value={li.itemId}
                      onChange={(e) => handleUpdateLineItem(idx, 'itemId', e.target.value)}
                      className="w-full bg-white text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
                    >
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>
                          {it.name} ({it.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="w-full sm:w-28">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={li.quantity}
                      onChange={(e) => handleUpdateLineItem(idx, 'quantity', e.target.value)}
                      className="w-full bg-white text-xs font-mono font-bold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  {/* Unit Cost */}
                  <div className="w-full sm:w-32">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Rate (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={li.unitPrice}
                      onChange={(e) => handleUpdateLineItem(idx, 'unitPrice', e.target.value)}
                      className="w-full bg-white text-xs font-mono font-bold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
                    />
                  </div>

                  {/* Total row cost */}
                  <div className="w-full sm:w-28 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Subtotal
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 block py-2">
                      ₹ {li.totalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveLineItem(idx)}
                    disabled={lineItems.length === 1}
                    className="p-2 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors cursor-pointer self-end sm:self-center"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing & GST Calculation Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
            {/* Payment & Terms */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PurchaseOrder['paymentStatus'])}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 cursor-pointer"
                >
                  <option value="Paid">Paid (Full Settlement)</option>
                  <option value="Partial">Partial Advance Paid</option>
                  <option value="Pending">Pending Invoice Verification</option>
                  <option value="Unpaid">Unpaid (30 Days Credit Term)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Method
                </label>
                <input
                  type="text"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="e.g. Bank Transfer (NEFT)"
                  className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Special Notes / Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">₹ {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1.5">
                  GST Applicable ({taxRate}%):
                </span>
                <span className="font-mono font-semibold text-slate-900">₹ {taxAmount.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Discount / Rebate:</span>
                <span className="font-mono font-semibold text-teal-800">- ₹ {discountAmount.toLocaleString()}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                <span className="text-xl font-bold font-mono text-teal-950">
                  ₹ {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('Draft', false)}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-all cursor-pointer"
            >
              Save as Draft
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('Ordered', false)}
              className="px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Truck className="w-4 h-4" />
              <span>Issue Purchase Order</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit('Received', true)}
              className="px-5 py-2.5 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Received & Update Stock</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

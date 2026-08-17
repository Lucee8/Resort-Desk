import React, { useState } from 'react';
import { 
  X, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Layers, 
  User, 
  FileText, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { InventoryItem, StockMovementType } from '../../types';

interface StockMovementModalProps {
  item: InventoryItem | null;
  items: InventoryItem[];
  onClose: () => void;
  onSubmitMovement: (itemId: string, qty: number, type: StockMovementType, user: string, reference: string, notes: string) => void;
}

export default function StockMovementModal({
  item,
  items,
  onClose,
  onSubmitMovement
}: StockMovementModalProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>(item?.id || items[0]?.id || '');
  const [movementType, setMovementType] = useState<StockMovementType>('Housekeeping');
  const [quantity, setQuantity] = useState<number>(10);
  const [isAddition, setIsAddition] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Sunita Patil (Housekeeping Lead)');
  const [reference, setReference] = useState<string>('Room 201-205 Daily Turnover');
  const [notes, setNotes] = useState<string>('');

  const currentSelectedItem = items.find(i => i.id === selectedItemId) || item || items[0];

  // Auto configure positive vs negative based on movement type
  const handleTypeChange = (type: StockMovementType) => {
    setMovementType(type);
    if (type === 'Purchase' || type === 'Return') {
      setIsAddition(true);
    } else if (type === 'Adjustment') {
      // User can choose
    } else {
      setIsAddition(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedItem || quantity <= 0) return;
    const finalQty = isAddition ? Math.abs(quantity) : -Math.abs(quantity);
    onSubmitMovement(
      currentSelectedItem.id,
      finalQty,
      movementType,
      userName,
      reference,
      notes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                Log Stock Movement
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Record stock addition, housekeeping consumption, or room replacement.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Selector */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Select Inventory Supply
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 focus:bg-white"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (Stock: {i.currentStock} {i.unit}) - {i.sku}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Preview Card */}
          {currentSelectedItem && (
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-teal-700">Held Stock Balance</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {currentSelectedItem.currentStock} {currentSelectedItem.unit} (Safety Threshold: {currentSelectedItem.minStock})
                </p>
              </div>
              <span className="font-mono text-teal-800 font-semibold">{currentSelectedItem.category}</span>
            </div>
          )}

          {/* Movement Type */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Movement Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Housekeeping', 'Purchase', 'Restaurant', 'Room Replacement', 'Damaged', 'Adjustment'] as StockMovementType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`py-2 px-2 text-[11px] font-bold rounded-xl border transition-all cursor-pointer truncate ${
                    movementType === type
                      ? 'bg-teal-900 text-white border-teal-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Direction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Direction
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsAddition(false)}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 cursor-pointer ${
                    !isAddition ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Deduct (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddition(true)}
                  className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 cursor-pointer ${
                    isAddition ? 'bg-teal-100 text-teal-900 border-teal-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>Add (+)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Quantity ({currentSelectedItem?.unit || 'units'})
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50 text-xs font-mono font-bold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700 focus:bg-white"
              />
            </div>
          </div>

          {/* Staff User & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Staff Name / Role
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Sunita Patil"
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                Reference / Order #
              </label>
              <input
                type="text"
                required
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. Room 204 Service"
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
              Internal Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prepared for weekend VIP arrival"
              className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save Stock Entry
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

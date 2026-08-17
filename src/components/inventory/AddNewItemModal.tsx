import React, { useState } from 'react';
import { 
  X, 
  PackagePlus, 
  Sparkles, 
  Building2, 
  MapPin, 
  DollarSign, 
  Check, 
  Upload
} from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../../types';

interface AddNewItemModalProps {
  onClose: () => void;
  onAddItem: (newItem: Omit<InventoryItem, 'id' | 'movements' | 'totalValue' | 'safetyLevel'>) => void;
  existingSuppliers: string[];
}

export default function AddNewItemModal({
  onClose,
  onAddItem,
  existingSuppliers
}: AddNewItemModalProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('LIN-NW-099');
  const [category, setCategory] = useState<InventoryCategory>('Linens');
  const [unit, setUnit] = useState('pieces');
  const [currentStock, setCurrentStock] = useState<number>(100);
  const [minStock, setMinStock] = useState<number>(30);
  const [maxStock, setMaxStock] = useState<number>(200);
  const [reorderQuantity, setReorderQuantity] = useState<number>(50);
  const [costPerUnit, setCostPerUnit] = useState<number>(350);
  const [supplier, setSupplier] = useState(existingSuppliers[0] || 'Oceanic Textiles Ltd.');
  const [storageLocation, setStorageLocation] = useState('Central Linen Storage');
  const [warehouseZone, setWarehouseZone] = useState('Zone A (Linens)');
  const [shelfBin, setShelfBin] = useState('Shelf A2-04');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=400&q=80');

  const categories: InventoryCategory[] = [
    'Linens',
    'Toiletries',
    'Cleaning',
    'Kitchen',
    'Food & Beverage',
    'Maintenance',
    'Guest Supplies',
    'Other'
  ];

  const units = ['pieces', 'liters', 'cans', 'kg', 'boxes', 'bottles', 'sets', 'packs', 'rolls'];

  const handleGenerateSKU = () => {
    const prefix = category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    setSku(`${prefix}-NEW-${randomNum}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      name,
      sku: sku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category,
      unit,
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      maxStock: Number(maxStock),
      reorderQuantity: Number(reorderQuantity),
      costPerUnit: Number(costPerUnit),
      supplier,
      storageLocation,
      warehouseZone,
      shelfBin,
      lastRestocked: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description,
      image,
      consumptionRateWeekly: Math.round(minStock * 0.4),
      turnoverDays: 14
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <PackagePlus className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Add New Inventory Item
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Define specifications, safety stock buffers, unit pricing, and vendor details.
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section 1: Item Basic Info */}
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block mb-3">
              1. Basic Identification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Microfiber Poolside Lounge Towel"
                  className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="text-[11px] text-teal-800 hover:text-teal-950 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-teal-700" />
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-slate-50 font-mono text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Unit of Measure *
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Purchase Cost Per Unit (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={costPerUnit}
                  onChange={(e) => setCostPerUnit(Number(e.target.value))}
                  className="w-full bg-slate-50 font-mono text-xs font-bold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Stock Thresholds */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block mb-3">
              2. Stock Limits & Safety Levels
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={currentStock}
                  onChange={(e) => setCurrentStock(Number(e.target.value))}
                  className="w-full bg-slate-50 font-mono text-xs font-bold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Min Safety Stock
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={minStock}
                  onChange={(e) => setMinStock(Number(e.target.value))}
                  className="w-full bg-slate-50 font-mono text-xs font-bold text-amber-700 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Max Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={maxStock}
                  onChange={(e) => setMaxStock(Number(e.target.value))}
                  className="w-full bg-slate-50 font-mono text-xs font-bold text-slate-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Reorder Qty
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={reorderQuantity}
                  onChange={(e) => setReorderQuantity(Number(e.target.value))}
                  className="w-full bg-slate-50 font-mono text-xs font-bold text-teal-800 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Supplier & Storage */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider block mb-3">
              3. Procurement & Location
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Primary Supplier *
                </label>
                <select
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-slate-50 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
                >
                  {existingSuppliers.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Storage Location *
                </label>
                <input
                  type="text"
                  required
                  value={storageLocation}
                  onChange={(e) => setStorageLocation(e.target.value)}
                  placeholder="e.g. Central Linen Storage"
                  className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Warehouse Zone
                </label>
                <input
                  type="text"
                  value={warehouseZone}
                  onChange={(e) => setWarehouseZone(e.target.value)}
                  placeholder="e.g. Zone A (Linens)"
                  className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Shelf / Bin Number
                </label>
                <input
                  type="text"
                  value={shelfBin}
                  onChange={(e) => setShelfBin(e.target.value)}
                  placeholder="e.g. Rack B-3, Shelf 2"
                  className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="pt-3 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Quality Specification / Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 500 GSM 100% combed cotton, double-stitched hem."
              className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-slate-200 focus:outline-none focus:border-teal-700"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Create Inventory Item</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

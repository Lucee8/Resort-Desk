import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Building2, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { InventorySupplier } from '../../types';

interface SuppliersModalProps {
  suppliers: InventorySupplier[];
  onClose: () => void;
  onOpenNewPOForSupplier: (supplierName: string) => void;
}

export default function SuppliersModal({
  suppliers,
  onClose,
  onOpenNewPOForSupplier
}: SuppliersModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredSuppliers = suppliers.filter((s) => {
    if (selectedCategory !== 'All' && !s.categoriesSupplied.includes(selectedCategory as any)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesContact = s.contactPerson.toLowerCase().includes(q);
      const matchesCategory = s.categoriesSupplied.some(c => c.toLowerCase().includes(q));
      if (!matchesName && !matchesContact && !matchesCategory) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200">
              <Users className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-slate-900">
                Supplier & Vendor Directory
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Manage vetted hospitality supply partners, contract rates, and contact channels.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor name, contact person..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:border-teal-700"
            />
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredSuppliers.length}</strong> active vendors
          </div>
        </div>

        {/* Supplier Cards List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-slate-50/80 hover:bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {sup.name}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      Rep: <strong className="text-slate-700">{sup.contactPerson}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-amber-900 text-xs font-bold shrink-0">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span>{sup.rating}</span>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {sup.categoriesSupplied.map((c) => (
                    <span key={c} className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                      {c}
                    </span>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 mt-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                </div>

                {/* Lead time & Spend */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Lead Time
                    </span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {sup.avgDeliveryTime}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Total Annual Spend
                    </span>
                    <span className="font-mono font-bold text-teal-900 block mt-0.5">
                      ₹ {sup.totalPurchases.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${sup.phone}`}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                    title="Call Vendor"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                  </a>
                  <a
                    href={`https://wa.me/${sup.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl border border-teal-200 transition-colors"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-teal-700" />
                  </a>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onOpenNewPOForSupplier(sup.name);
                  }}
                  className="px-3.5 py-1.5 bg-[#0c4a45] hover:bg-[#083834] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Create PO</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

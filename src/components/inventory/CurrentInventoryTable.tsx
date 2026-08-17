import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  SlidersHorizontal, 
  MoreVertical, 
  Eye, 
  PlusCircle, 
  RotateCcw, 
  Edit3, 
  Trash2, 
  Bed, 
  Droplets, 
  Sparkles, 
  Utensils, 
  Coffee, 
  Wrench, 
  Gift, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Package, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { InventoryItem, InventoryCategory, InventorySafetyLevel } from '../../types';

interface CurrentInventoryTableProps {
  items: InventoryItem[];
  selectedCategory: InventoryCategory;
  onSelectCategory: (category: InventoryCategory) => void;
  onSelectItem: (item: InventoryItem) => void;
  onLogMovement: (item: InventoryItem) => void;
  onQuickRestock: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onExportCSV: () => void;
}

export default function CurrentInventoryTable({
  items,
  selectedCategory,
  onSelectCategory,
  onSelectItem,
  onLogMovement,
  onQuickRestock,
  onEditItem,
  onDeleteItem,
  onExportCSV
}: CurrentInventoryTableProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [safetyFilter, setSafetyFilter] = useState<'All' | InventorySafetyLevel>('All');
  const [sortBy, setSortBy] = useState<'name' | 'stockAsc' | 'stockDesc' | 'value' | 'date'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const categories: InventoryCategory[] = [
    'All',
    'Linens',
    'Toiletries',
    'Cleaning',
    'Kitchen',
    'Food & Beverage',
    'Maintenance',
    'Guest Supplies',
    'Other'
  ];

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Linens':
        return <Bed className="w-4 h-4 text-teal-700" />;
      case 'Toiletries':
        return <Droplets className="w-4 h-4 text-sky-700" />;
      case 'Cleaning':
        return <Sparkles className="w-4 h-4 text-amber-700" />;
      case 'Kitchen':
        return <Utensils className="w-4 h-4 text-emerald-700" />;
      case 'Food & Beverage':
        return <Coffee className="w-4 h-4 text-orange-700" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-indigo-700" />;
      case 'Guest Supplies':
        return <Gift className="w-4 h-4 text-purple-700" />;
      default:
        return <Package className="w-4 h-4 text-slate-700" />;
    }
  };

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'Linens':
        return 'bg-teal-50 border-teal-200/60';
      case 'Toiletries':
        return 'bg-sky-50 border-sky-200/60';
      case 'Cleaning':
        return 'bg-amber-50 border-amber-200/60';
      case 'Kitchen':
        return 'bg-emerald-50 border-emerald-200/60';
      case 'Food & Beverage':
        return 'bg-orange-50 border-orange-200/60';
      case 'Maintenance':
        return 'bg-indigo-50 border-indigo-200/60';
      case 'Guest Supplies':
        return 'bg-purple-50 border-purple-200/60';
      default:
        return 'bg-slate-50 border-slate-200/60';
    }
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category check
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Safety filter check
      if (safetyFilter !== 'All' && item.safetyLevel !== safetyFilter) {
        return false;
      }
      // Search check
      if (localSearch.trim()) {
        const query = localSearch.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSku = item.sku.toLowerCase().includes(query);
        const matchesSupplier = item.supplier.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesSku && !matchesSupplier && !matchesCategory) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stockAsc') return (a.currentStock / a.maxStock) - (b.currentStock / b.maxStock);
      if (sortBy === 'stockDesc') return (b.currentStock / b.maxStock) - (a.currentStock / a.maxStock);
      if (sortBy === 'value') return b.totalValue - a.totalValue;
      if (sortBy === 'date') return new Date(b.lastRestocked).getTime() - new Date(a.lastRestocked).getTime();
      return 0;
    });
  }, [items, selectedCategory, safetyFilter, localSearch, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Stock Progress Bar Color Helper
  const getStockBarColor = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.maxStock) * 100;
    if (percentage <= 20 || item.safetyLevel === 'Critical') return 'bg-rose-500';
    if (percentage <= 40 || item.safetyLevel === 'Low') return 'bg-amber-500';
    return 'bg-teal-600';
  };

  const getSafetyBadge = (level: InventorySafetyLevel) => {
    switch (level) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
            Healthy
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Low Stock
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            Critical
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
            Out of Stock
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      id="current-inventory-section"
      className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
    >
      {/* Table Header with Category Filter Tabs matching reference */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Current Inventory
          </h2>

          {/* Category Tabs Pill Bar matching reference */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  id={`cat-tab-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter & Search Control Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100/80">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter current view..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl pl-9 pr-3 py-1.5 border border-slate-200 focus:outline-none focus:border-teal-700 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Safety Level Filter */}
            <select
              value={safetyFilter}
              onChange={(e) => {
                setSafetyFilter(e.target.value as unknown as InventorySafetyLevel);
                setCurrentPage(1);
              }}
              className="bg-slate-50 text-xs text-slate-700 font-medium rounded-xl px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
            >
              <option value="All">All Health Status</option>
              <option value="Healthy">Healthy</option>
              <option value="Low">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'stockAsc' | 'stockDesc' | 'value' | 'date')}
              className="bg-slate-50 text-xs text-slate-700 font-medium rounded-xl px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-teal-700 cursor-pointer"
            >
              <option value="name">Sort: Name (A-Z)</option>
              <option value="stockAsc">Sort: Stock Level (Lowest First)</option>
              <option value="stockDesc">Sort: Stock Level (Highest First)</option>
              <option value="value">Sort: Total Valuation (₹)</option>
              <option value="date">Sort: Last Restocked</option>
            </select>

            {/* Export Action */}
            <button
              onClick={onExportCSV}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Export Current View (CSV)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table matching reference design */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-3 px-5">ITEM NAME</th>
              <th className="py-3 px-4">CATEGORY</th>
              <th className="py-3 px-4 min-w-[140px]">STOCK LEVEL</th>
              <th className="py-3 px-4">UNIT</th>
              <th className="py-3 px-4">SAFETY LEVEL</th>
              <th className="py-3 px-4">LAST RESTOCKED</th>
              <th className="py-3 px-4 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => {
                const stockPct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectItem(item)}
                  >
                    {/* Item Name + SKU */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${getCategoryBg(item.category)}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-teal-900 block leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-medium">
                            {item.sku}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.category}
                    </td>

                    {/* Stock Level with Visual Progress Bar matching reference */}
                    <td className="py-3.5 px-4">
                      <div className="w-full max-w-[150px]">
                        <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${getStockBarColor(item)}`}
                            style={{ width: `${Math.max(5, stockPct)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono mt-1 font-semibold">
                          <span className="text-slate-800">{item.currentStock}</span>
                          <span className="text-slate-400 font-normal">/ {item.maxStock}</span>
                        </div>
                      </div>
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.unit}
                    </td>

                    {/* Safety Level */}
                    <td className="py-3.5 px-4">
                      {getSafetyBadge(item.safetyLevel)}
                    </td>

                    {/* Last Restocked Date */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.lastRestocked}
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Stock Log Button */}
                        <button
                          id={`log-movement-btn-${item.id}`}
                          onClick={() => onLogMovement(item)}
                          className="p-1.5 text-slate-400 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Log Stock In/Out Movement"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>

                        {/* Quick Restock PO Button */}
                        <button
                          id={`quick-restock-btn-${item.id}`}
                          onClick={() => onQuickRestock(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Generate Purchase Order"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* View Item Details */}
                        <button
                          id={`view-item-btn-${item.id}`}
                          onClick={() => onSelectItem(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No inventory supplies found matching the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination matching reference layout: Showing 1 to 4 of 248 entries | Previous 1 2 Next */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-800">{filteredItems.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to <span className="font-semibold text-slate-800">{Math.min(currentPage * pageSize, filteredItems.length)}</span> of <span className="font-semibold text-slate-800">{filteredItems.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            id="inventory-prev-page-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            id="inventory-next-page-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import BillingHeader from './BillingHeader';
import BillingKPICards from './BillingKPICards';
import RevenueBarChart from './RevenueBarChart';
import SubscriptionCard from './SubscriptionCard';
import RecentInvoicesTable from './RecentInvoicesTable';
import AdditionalFinanceCards from './AdditionalFinanceCards';

// Modals and Drawers
import CreateInvoiceModal from './CreateInvoiceModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import RecordPaymentModal from './RecordPaymentModal';
import ProcessRefundModal from './ProcessRefundModal';
import ManageSubscriptionModal from './ManageSubscriptionModal';
import UnbilledStaysDrawer from './UnbilledStaysDrawer';
import BankSettlementModal from './BankSettlementModal';
import AllInvoicesModal from './AllInvoicesModal';
import MyraFinanceAssistant from './MyraFinanceAssistant';

import { 
  BillingInvoice, 
  RevenueMonthlyMetric, 
  BillingSubscriptionUsage, 
  UnbilledStayItem, 
  BankSettlementBatch 
} from '../../types';

import { 
  initialInvoicesData, 
  initialMonthlyRevenueData, 
  initialSubscriptionData, 
  initialUnbilledStays, 
  initialBankSettlement, 
  bankSettlementHistory 
} from '../../data/billingData';

interface BillingViewProps {
  triggerToast?: (message: string) => void;
}

export default function BillingView({ triggerToast }: BillingViewProps) {
  // Safe toast helper
  const notify = (msg: string) => {
    if (triggerToast) {
      triggerToast(msg);
    } else {
      console.log('Toast:', msg);
    }
  };

  // State
  const [invoices, setInvoices] = useState<BillingInvoice[]>(initialInvoicesData);
  const [revenueData, setRevenueData] = useState<RevenueMonthlyMetric[]>(initialMonthlyRevenueData);
  const [subscription, setSubscription] = useState<BillingSubscriptionUsage>(initialSubscriptionData);
  const [unbilledStays, setUnbilledStays] = useState<UnbilledStayItem[]>(initialUnbilledStays);
  const [bankSettlement, setBankSettlement] = useState<BankSettlementBatch>(initialBankSettlement);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal controls
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isManageSubModalOpen, setIsManageSubModalOpen] = useState(false);
  const [isUnbilledDrawerOpen, setIsUnbilledDrawerOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isAllInvoicesModalOpen, setIsAllInvoicesModalOpen] = useState(false);

  // Totals calculations
  const netRevenue = invoices.reduce((acc, inv) => {
    if (inv.status === 'Refunded') return acc;
    return acc + inv.paidAmount;
  }, 0) || 2450000;

  const collected = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.paidAmount, 0) || 2180000;
  const pending = invoices.reduce((acc, i) => acc + i.dueAmount, 0) || 270000;
  const gstLiable = invoices.reduce((acc, i) => acc + i.gstAmount, 0) || 441000;
  const refunds = invoices.filter(i => i.status === 'Refunded').reduce((acc, i) => acc + (i.refundAmount || i.totalAmount), 0) || 45000;
  const refundsCount = invoices.filter(i => i.status === 'Refunded').length || 3;

  // Handlers
  const handleCreateInvoice = (newInvoice: BillingInvoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
  };

  const handleViewInvoice = (invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleOpenRecordPayment = (invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setIsRecordPaymentModalOpen(true);
  };

  const handleConfirmPayment = (invoiceId: string, amount: number, method: string, refId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paidAmount + amount;
        const newDue = Math.max(0, inv.totalAmount - newPaid);
        const newStatus = newDue === 0 ? 'Paid' : 'Partial';
        return {
          ...inv,
          paidAmount: newPaid,
          dueAmount: newDue,
          status: newStatus,
          paymentMethod: method
        };
      }
      return inv;
    }));
  };

  const handleOpenProcessRefund = (invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = (invoiceId: string, refundAmt: number, reason: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          status: 'Refunded',
          refundAmount: refundAmt,
          refundDate: 'Oct 25, 2023',
          refundReason: reason,
          dueAmount: 0
        };
      }
      return inv;
    }));
  };

  const handleSendWhatsApp = (invoice: BillingInvoice) => {
    notify(`✓ WhatsApp Tax Invoice & payment link dispatched to ${invoice.guestName} (${invoice.guestPhone || '+91 98200 12345'})`);
  };

  const handleGenerateInvoiceForStay = (stay: UnbilledStayItem) => {
    // Generate invoice from stay folio
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoiceNum = `INV-2023-${randomNum}`;
    const taxableTotal = stay.roomTariffPending + stay.diningPending + stay.spaPending + stay.laundryPending;
    const gst = Math.round(taxableTotal * 0.18);
    const grandTotal = taxableTotal + gst;

    const newInv: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      guestName: stay.guestName,
      bookingId: stay.bookingId,
      roomNumber: stay.roomNumber,
      issueDate: 'Oct 25, 2023',
      dueDate: 'Oct 25, 2023',
      items: [
        {
          id: `it-${Date.now()}-1`,
          description: `Room Accommodation Charges (${stay.roomNumber})`,
          sacCode: '996311',
          qty: stay.nightsStayed,
          unitPrice: stay.roomTariffPending / stay.nightsStayed,
          gstRate: 18,
          amount: stay.roomTariffPending,
          gstAmount: Math.round(stay.roomTariffPending * 0.18)
        },
        ...(stay.diningPending > 0 ? [{
          id: `it-${Date.now()}-2`,
          description: 'Dining & In-Room Dining Service',
          sacCode: '996331',
          qty: 1,
          unitPrice: stay.diningPending,
          gstRate: 18,
          amount: stay.diningPending,
          gstAmount: Math.round(stay.diningPending * 0.18)
        }] : []),
        ...(stay.spaPending > 0 ? [{
          id: `it-${Date.now()}-3`,
          description: 'Ayurvedic Wellness Spa Services',
          sacCode: '999721',
          qty: 1,
          unitPrice: stay.spaPending,
          gstRate: 18,
          amount: stay.spaPending,
          gstAmount: Math.round(stay.spaPending * 0.18)
        }] : [])
      ],
      subtotal: taxableTotal,
      gstAmount: gst,
      cgstAmount: gst / 2,
      sgstAmount: gst / 2,
      discount: 0,
      totalAmount: grandTotal,
      paidAmount: 0,
      dueAmount: grandTotal,
      status: 'Pending',
      notes: 'Generated from in-house folio checkout.'
    };

    setInvoices(prev => [newInv, ...prev]);
    setUnbilledStays(prev => prev.filter(s => s.id !== stay.id));
    setSelectedInvoice(newInv);
    setIsDetailModalOpen(true);
    notify(`Generated checkout invoice ${invoiceNum} for ${stay.roomNumber}`);
  };

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Invoice Number', 'Guest Name', 'Booking ID', 'Room', 'Date', 'Subtotal (INR)', 'GST (INR)', 'Total (INR)', 'Status'];
    const rows = invoices.map(inv => [
      inv.invoiceNumber,
      `"${inv.guestName}"`,
      inv.bookingId || '',
      inv.roomNumber,
      inv.issueDate,
      inv.subtotal,
      inv.gstAmount,
      inv.totalAmount,
      inv.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ResortDesk_Finance_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notify('✓ Invoices ledger exported as CSV.');
  };

  return (
    <div id="billing-view-container" className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 font-sans">
      {/* 1. Page Header */}
      <BillingHeader
        onExportCSV={handleExportCSV}
        onCreateInvoice={() => setIsCreateModalOpen(true)}
      />

      {/* 2. KPI Cards (5 Cards) */}
      <BillingKPICards
        invoices={invoices}
        netRevenue={2450000}
        collected={2180000}
        pending={270000}
        gstLiable={441000}
        refunds={45000}
        refundsCount={refundsCount}
        activeFilter={statusFilter}
        onFilterStatus={(st) => setStatusFilter(st)}
      />

      {/* 3. Middle Section: Revenue Chart (Left) + Subscription Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Revenue Analytics Chart (7 cols on lg) */}
        <div className="lg:col-span-7 h-full">
          <RevenueBarChart
            data={revenueData}
            onSelectMonth={(m) => notify(`Selected analytics for ${m} 2023.`)}
          />
        </div>

        {/* Right: Subscription Card (5 cols on lg) */}
        <div className="lg:col-span-5 h-full">
          <SubscriptionCard
            subscription={subscription}
            onManageSubscription={() => setIsManageSubModalOpen(true)}
          />
        </div>
      </div>

      {/* 4. Bottom Section: Recent Invoices (Left) + Additional Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Recent Invoices Table (7 cols on lg) */}
        <div className="lg:col-span-7">
          <RecentInvoicesTable
            invoices={invoices}
            selectedStatusFilter={statusFilter}
            onStatusFilterChange={(st) => setStatusFilter(st)}
            onViewInvoice={handleViewInvoice}
            onRecordPayment={handleOpenRecordPayment}
            onProcessRefund={handleOpenProcessRefund}
            onSendWhatsApp={handleSendWhatsApp}
            onViewAllInvoices={() => setIsAllInvoicesModalOpen(true)}
          />
        </div>

        {/* Right: Additional Finance Cards (Bank Settlement & Unbilled Stays) (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <AdditionalFinanceCards
            nextSettlementDate={bankSettlement.settlementDate}
            unbilledRoomsCount={unbilledStays.length}
            onOpenBankSettlement={() => setIsSettlementModalOpen(true)}
            onOpenUnbilledStays={() => setIsUnbilledDrawerOpen(true)}
          />

          {/* Quick GST Filing & Status Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Compliance &amp; GSTIN
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  GSTR-1 Monthly Return
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Due on 11th Nov • All SAC 9963 mapped
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
                ● In Sync
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">
                GSTIN: 27AAACR9921K1Z8
              </span>
              <button
                type="button"
                onClick={() => setIsAllInvoicesModalOpen(true)}
                className="text-xs font-bold text-[#0c4033] hover:underline cursor-pointer"
              >
                View Tax Ledger →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Myra AI Financial Assistant */}
      <MyraFinanceAssistant
        invoices={invoices}
        revenueData={revenueData}
        unbilledStays={unbilledStays}
        onCreateInvoiceClick={() => setIsCreateModalOpen(true)}
        onOpenSettlements={() => setIsSettlementModalOpen(true)}
        triggerToast={notify}
      />

      {/* Modals and Drawers */}
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateInvoice={handleCreateInvoice}
        triggerToast={notify}
      />

      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoice={selectedInvoice}
        onRecordPayment={handleOpenRecordPayment}
        onProcessRefund={handleOpenProcessRefund}
        onSendWhatsApp={handleSendWhatsApp}
        triggerToast={notify}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentModalOpen}
        onClose={() => setIsRecordPaymentModalOpen(false)}
        invoice={selectedInvoice}
        onConfirmPayment={handleConfirmPayment}
        triggerToast={notify}
      />

      <ProcessRefundModal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        invoice={selectedInvoice}
        onConfirmRefund={handleConfirmRefund}
        triggerToast={notify}
      />

      <ManageSubscriptionModal
        isOpen={isManageSubModalOpen}
        onClose={() => setIsManageSubModalOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(newSub) => setSubscription(newSub)}
        triggerToast={notify}
      />

      <UnbilledStaysDrawer
        isOpen={isUnbilledDrawerOpen}
        onClose={() => setIsUnbilledDrawerOpen(false)}
        unbilledStays={unbilledStays}
        onGenerateInvoiceForStay={handleGenerateInvoiceForStay}
        triggerToast={notify}
      />

      <BankSettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        currentBatch={bankSettlement}
        history={bankSettlementHistory}
        triggerToast={notify}
      />

      <AllInvoicesModal
        isOpen={isAllInvoicesModalOpen}
        onClose={() => setIsAllInvoicesModalOpen(false)}
        invoices={invoices}
        onViewInvoice={handleViewInvoice}
        onRecordPayment={handleOpenRecordPayment}
        onProcessRefund={handleOpenProcessRefund}
        onSendWhatsApp={handleSendWhatsApp}
        onExportCSV={handleExportCSV}
        triggerToast={notify}
      />
    </div>
  );
}

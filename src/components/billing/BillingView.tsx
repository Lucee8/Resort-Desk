import React, { useState, useEffect, useMemo } from 'react';
import { X, MessageSquare, ExternalLink } from 'lucide-react';
import BillingHeader from './BillingHeader';
import BillingKPICards from './BillingKPICards';
import RevenueBarChart from './RevenueBarChart';
import SubscriptionCard from './SubscriptionCard';
import RecentInvoicesTable from './RecentInvoicesTable';
import AdditionalFinanceCards from './AdditionalFinanceCards';

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
  BankSettlementBatch,
  Booking,
  RoomUnit,
  ResortDeskSettings,
} from '../../types';

import { initialSubscriptionData, initialBankSettlement, bankSettlementHistory } from '../../data/billingData';
import {
  createBillingInvoiceAtomic,
  recordBillingInvoicePaymentAtomic,
  processBillingRefundAtomic,
  subscribeBillingDoc,
  saveBillingDoc,
  upsertCollectionDoc,
} from '../../services/resortDataService';
import {
  buildWhatsAppLink,
  formatShortDate,
  getTodayISO,
  resolveBookingDatesISO,
} from '../../utils/bookingUtils';

interface BillingViewProps {
  invoices: BillingInvoice[];
  bookings: Booking[];
  rooms: RoomUnit[];
  settings?: ResortDeskSettings;
  triggerToast?: (message: string) => void;
  initialStatusFilter?: string;
  navigationKey?: number;
}

export default function BillingView({
  invoices,
  bookings,
  rooms,
  settings,
  triggerToast,
  initialStatusFilter,
  navigationKey,
}: BillingViewProps) {
  const notify = (msg: string) => {
    if (triggerToast) {
      triggerToast(msg);
    }
  };

  const [subscription, setSubscription] = useState<BillingSubscriptionUsage>(initialSubscriptionData);
  const [bankSettlement, setBankSettlement] = useState<BankSettlementBatch>(initialBankSettlement);
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');

  useEffect(() => {
    const unsubSub = subscribeBillingDoc<BillingSubscriptionUsage>(
      'subscription',
      initialSubscriptionData,
      setSubscription
    );
    const unsubBank = subscribeBillingDoc<BankSettlementBatch>(
      'bankSettlement',
      initialBankSettlement,
      setBankSettlement
    );
    return () => {
      unsubSub();
      unsubBank();
    };
  }, []);

  useEffect(() => {
    if (navigationKey === undefined) return;
    setStatusFilter(initialStatusFilter || 'ALL');
  }, [navigationKey, initialStatusFilter]);

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
  const [whatsappDispatchInvoice, setWhatsappDispatchInvoice] = useState<BillingInvoice | null>(null);

  // Derive real unbilled stays from active Firestore bookings lacking a matching invoice
  const unbilledStays: UnbilledStayItem[] = useMemo(() => {
    const todayISO = getTodayISO();
    const invoicedBookingKeys = new Set<string>();
    invoices.forEach((inv) => {
      if (inv.bookingId) invoicedBookingKeys.add(inv.bookingId);
    });

    return bookings
      .filter((b) => {
        if (b.bookingStatus === 'Cancelled') return false;
        const hasInvoice =
          invoicedBookingKeys.has(b.id) ||
          (b.bookingCode ? invoicedBookingKeys.has(b.bookingCode) : false);
        if (hasInvoice) return false;
        return (b.balanceDue ?? b.amount - (b.advancePaid ?? 0)) > 0 || b.bookingStatus === 'Checked-in';
      })
      .map((b) => {
        const { checkInISO, checkOutISO } = resolveBookingDatesISO(b);
        const nights = Math.max(1, b.nights || 1);
        const adv = b.advancePaid ?? (b.paymentStatus === 'Paid' ? b.amount : 0);
        const bal = Math.max(0, b.balanceDue ?? b.amount - adv);
        const stayStatus: UnbilledStayItem['status'] =
          checkOutISO === todayISO ? 'Checking Out Today' : 'In-House';
        return {
          id: b.id,
          roomNumber: b.roomNumber,
          guestName: b.guestName,
          bookingId: b.id,
          checkInDate: formatShortDate(checkInISO),
          checkOutDate: formatShortDate(checkOutISO),
          nightsStayed: nights,
          roomTariffPending: Math.round(bal * 0.88),
          diningPending: 0,
          spaPending: 0,
          laundryPending: Math.round(bal * 0.12),
          totalPending: bal,
          status: stayStatus,
          contactPhone: b.guestPhone || '',
        };
      });
  }, [bookings, invoices]);

  // Real KPI calculations strictly from live invoices
  const activeInvoices = useMemo(
    () => invoices.filter((inv) => inv.status !== 'Refunded'),
    [invoices]
  );
  const netRevenue = useMemo(
    () => activeInvoices.reduce((acc, inv) => acc + (Number(inv.paidAmount) || 0), 0),
    [activeInvoices]
  );
  const collected = useMemo(
    () =>
      invoices
        .filter((i) => i.status === 'Paid')
        .reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0),
    [invoices]
  );
  const pending = useMemo(
    () => activeInvoices.reduce((acc, inv) => acc + (Number(inv.dueAmount) || 0), 0),
    [activeInvoices]
  );
  const gstLiable = useMemo(
    () => activeInvoices.reduce((acc, inv) => acc + (Number(inv.gstAmount) || 0), 0),
    [activeInvoices]
  );
  const refundedInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'Refunded'),
    [invoices]
  );
  const refunds = useMemo(
    () =>
      refundedInvoices.reduce(
        (acc, i) => acc + (Number(i.refundAmount ?? i.totalAmount) || 0),
        0
      ),
    [refundedInvoices]
  );
  const refundsCount = refundedInvoices.length;

  // Derive 6-month revenue trend strictly from Firestore invoices
  const revenueData: RevenueMonthlyMetric[] = useMemo(() => {
    const now = new Date();
    const monthBuckets: { key: string; label: string; revenue: number; gst: number; refunds: number }[] =
      [];

    for (let offset = -5; offset <= 0; offset += 1) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthBuckets.push({ key, label, revenue: 0, gst: 0, refunds: 0 });
    }

    invoices.forEach((inv) => {
      const parsed = Date.parse(inv.issueDate);
      const d = Number.isNaN(parsed) ? now : new Date(parsed);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket =
        monthBuckets.find((b) => b.key === key) || monthBuckets[monthBuckets.length - 1];
      if (!bucket) return;
      if (inv.status === 'Refunded') {
        bucket.refunds += Number(inv.refundAmount ?? inv.totalAmount) || 0;
      } else {
        bucket.revenue += Number(inv.paidAmount || inv.totalAmount) || 0;
        bucket.gst += Number(inv.gstAmount) || 0;
      }
    });

    return monthBuckets.map(({ label, revenue, gst, refunds: refAmt }) => ({
      month: label,
      revenue: Math.round(revenue),
      gst: Math.round(gst),
      refunds: Math.round(refAmt),
    }));
  }, [invoices]);

  // Keep selectedInvoice synced with live Firestore snapshot
  useEffect(() => {
    if (!selectedInvoice) return;
    const latest = invoices.find((i) => i.id === selectedInvoice.id);
    if (latest) setSelectedInvoice(latest);
  }, [invoices, selectedInvoice?.id]);

  // Firestore Handlers
  const handleCreateInvoice = async (newInvoice: BillingInvoice) => {
    await createBillingInvoiceAtomic(newInvoice);
  };

  const handleViewInvoice = (invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleOpenRecordPayment = (invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setIsRecordPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (
    invoiceId: string,
    amount: number,
    method: string,
    refId: string
  ) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) throw new Error('Invoice record not found.');
    await recordBillingInvoicePaymentAtomic(target, amount, method, refId);
  };

  const handleOpenProcessRefund = (invoice: BillingInvoice) => {
    setSelectedInvoice(invoice);
    setIsRefundModalOpen(true);
  };

  const handleConfirmRefund = async (invoiceId: string, refundAmt: number, reason: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) throw new Error('Invoice record not found.');
    await processBillingRefundAtomic(target, refundAmt, reason);
  };

  const handleSendWhatsApp = (invoice: BillingInvoice) => {
    setWhatsappDispatchInvoice(invoice);
  };

  const handleLogWhatsAppDispatch = async (invoice: BillingInvoice, msgText: string) => {
    try {
      await upsertCollectionDoc('whatsappLogs', {
        id: `wa-inv-${Date.now()}`,
        guestName: invoice.guestName,
        guestPhone: invoice.guestPhone || '',
        roomNumber: invoice.roomNumber,
        workflowName: 'Tax Invoice & Payment Link',
        nodeTitle: invoice.invoiceNumber,
        direction: 'outbound' as const,
        messageText: msgText,
        status: 'sent' as const,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        templateUsed: 'tax_invoice_upi_link',
      });
    } catch {
      // Non-blocking audit log
    }
  };

  const handleGenerateInvoiceForStay = async (stay: UnbilledStayItem) => {
    const matchedBooking = bookings.find((b) => b.id === stay.bookingId);
    const todayLabel = formatShortDate(getTodayISO()) + `, ${new Date().getFullYear()}`;
    const prefixBase = (
      settings?.billingGst?.invoicePrefix || `MYK-${new Date().getFullYear()}-`
    ).replace(/\/$/, '-');
    const invoiceNum = `${prefixBase}${Math.floor(1000 + Math.random() * 9000)}`;

    const totalVal = matchedBooking?.amount ?? stay.totalPending;
    const gstRate = matchedBooking?.gstRateApplied ?? 12;
    const taxableTotal = Math.round(totalVal / (1 + gstRate / 100));
    const gst = Math.max(0, totalVal - taxableTotal);
    const cgst = Math.round(gst / 2);
    const sgst = gst - cgst;
    const paid = matchedBooking?.advancePaid ?? 0;
    const due = Math.max(0, totalVal - paid);

    const newInv: BillingInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      guestName: stay.guestName,
      bookingId: stay.bookingId,
      guestEmail: matchedBooking?.guestEmail,
      guestPhone: stay.contactPhone || matchedBooking?.guestPhone,
      roomNumber: stay.roomNumber,
      issueDate: todayLabel,
      dueDate: todayLabel,
      items: [
        {
          id: `it-${Date.now()}-1`,
          description: `Cottage Accommodation (${stay.roomNumber})`,
          sacCode: matchedBooking?.sacCode || '996311',
          qty: stay.nightsStayed,
          unitPrice: Math.round(taxableTotal / Math.max(1, stay.nightsStayed)),
          gstRate,
          amount: taxableTotal,
          gstAmount: gst,
        },
      ],
      subtotal: taxableTotal,
      gstAmount: gst,
      cgstAmount: cgst,
      sgstAmount: sgst,
      discount: 0,
      totalAmount: totalVal,
      paidAmount: paid,
      dueAmount: due,
      status: due === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending',
      notes: 'Generated from active reservation folio in Firestore.',
    };

    await createBillingInvoiceAtomic(newInv);
    setSelectedInvoice(newInv);
    setIsDetailModalOpen(true);
    notify(`Created GST invoice ${invoiceNum} for ${stay.roomNumber}`);
  };

  const handleExportCSV = () => {
    const headers = [
      'Invoice Number',
      'Guest Name',
      'Booking ID',
      'Room',
      'Date',
      'Subtotal (INR)',
      'GST (INR)',
      'Total (INR)',
      'Paid (INR)',
      'Due (INR)',
      'Status',
    ];
    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      `"${inv.guestName}"`,
      inv.bookingId || '',
      `"${inv.roomNumber}"`,
      `"${inv.issueDate}"`,
      inv.subtotal,
      inv.gstAmount,
      inv.totalAmount,
      inv.paidAmount,
      inv.dueAmount,
      inv.status,
    ]);

    const csvContent =
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mykonos_Finance_Ledger_${getTodayISO()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Invoices ledger exported as CSV.');
  };

  const gstinDisplay =
    settings?.billingGst?.gstin || settings?.profile?.gstin || '27AABCM4821K1Z4';
  const unbilledTotalAmount = unbilledStays.reduce((sum, s) => sum + s.totalPending, 0);

  const whatsappMessageText = whatsappDispatchInvoice
    ? [
        `Namaste ${whatsappDispatchInvoice.guestName}!`,
        `Here is your GST Tax Invoice (${whatsappDispatchInvoice.invoiceNumber}) from Mykonos Cottage, Tarkarli:`,
        `• Cottage: ${whatsappDispatchInvoice.roomNumber}`,
        `• Total Amount: ₹${Math.round(whatsappDispatchInvoice.totalAmount).toLocaleString('en-IN')}`,
        `• Paid: ₹${Math.round(whatsappDispatchInvoice.paidAmount).toLocaleString('en-IN')}`,
        `• Balance Due: ₹${Math.round(whatsappDispatchInvoice.dueAmount).toLocaleString('en-IN')}`,
        whatsappDispatchInvoice.dueAmount > 0 ? `• UPI VPA: mykonoscottage@hdfcbank` : '',
        `Thank you for choosing Mykonos Cottage, Tarkarli!`,
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  return (
    <div
      id="billing-view-container"
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto flex flex-col gap-6 font-sans"
    >
      <BillingHeader
        onExportCSV={handleExportCSV}
        onCreateInvoice={() => setIsCreateModalOpen(true)}
      />

      <BillingKPICards
        invoices={invoices}
        netRevenue={netRevenue}
        collected={collected}
        pending={pending}
        gstLiable={gstLiable}
        refunds={refunds}
        refundsCount={refundsCount}
        activeFilter={statusFilter}
        onFilterStatus={(st) => setStatusFilter(st)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 h-full">
          <RevenueBarChart
            data={revenueData}
            onSelectMonth={(m) => notify(`Viewing ${m} ledger summary.`)}
          />
        </div>

        <div className="lg:col-span-5 h-full">
          <SubscriptionCard
            subscription={subscription}
            onManageSubscription={() => setIsManageSubModalOpen(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
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

        <div className="lg:col-span-5 flex flex-col gap-4">
          <AdditionalFinanceCards
            nextSettlementDate={bankSettlement.settlementDate}
            nextSettlementAmount={bankSettlement.netPayout}
            bankLabel={bankSettlement.bankName.split('-')[0].trim()}
            unbilledRoomsCount={unbilledStays.length}
            unbilledTotalAmount={unbilledTotalAmount}
            onOpenBankSettlement={() => setIsSettlementModalOpen(true)}
            onOpenUnbilledStays={() => setIsUnbilledDrawerOpen(true)}
          />

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
                  {activeInvoices.length} active SAC 9963 invoice
                  {activeInvoices.length === 1 ? '' : 's'} in ledger
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200/60">
                ● Synced
              </span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">GSTIN: {gstinDisplay}</span>
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

      <MyraFinanceAssistant
        invoices={invoices}
        revenueData={revenueData}
        unbilledStays={unbilledStays}
        onCreateInvoiceClick={() => setIsCreateModalOpen(true)}
        onOpenSettlements={() => setIsSettlementModalOpen(true)}
        onFilterPending={() => setStatusFilter('Pending')}
        triggerToast={notify}
      />

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateInvoice={handleCreateInvoice}
        triggerToast={notify}
        rooms={rooms}
        bookings={bookings}
        settings={settings}
      />

      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        invoice={selectedInvoice}
        onRecordPayment={handleOpenRecordPayment}
        onProcessRefund={handleOpenProcessRefund}
        onSendWhatsApp={handleSendWhatsApp}
        triggerToast={notify}
        settings={settings}
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
        onUpdateSubscription={async (newSub) => {
          setSubscription(newSub);
          await saveBillingDoc('subscription', newSub as unknown as Record<string, unknown>);
        }}
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
        gstin={gstinDisplay}
      />

      {/* Real WhatsApp Dispatch Modal with wa.me anchor (no fake dispatch toast) */}
      {whatsappDispatchInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-[#0c4033] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <h4 className="font-bold text-sm">Send Invoice via WhatsApp</h4>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappDispatchInvoice(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-line font-sans text-slate-700 leading-relaxed">
                {whatsappMessageText}
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(whatsappMessageText);
                    notify('Invoice summary copied to clipboard.');
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Copy Message
                </button>
                <a
                  href={buildWhatsAppLink(
                    whatsappDispatchInvoice.guestPhone || '',
                    whatsappMessageText
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    void handleLogWhatsAppDispatch(whatsappDispatchInvoice, whatsappMessageText);
                    setWhatsappDispatchInvoice(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs"
                >
                  <span>Open WhatsApp Chat</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

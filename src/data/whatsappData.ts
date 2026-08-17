import { 
  WhatsAppWorkflow, 
  WhatsAppTemplate, 
  WhatsAppMessageLog, 
  MyraAIWorkflowInsight 
} from '../types';

export const initialWhatsAppKPIs = {
  messagesSent: 12450,
  messagesSentGrowth: 12,
  deliveryRate: 99.2,
  deliveryRateGrowth: 0.5,
  readRate: 87.5,
  readRateGrowth: 2.1,
  responseRate: 34.1,
  responseRateGrowth: 0,
  activeAutomations: 8
};

export const initialWhatsAppTemplates: WhatsAppTemplate[] = [
  {
    id: 'tmpl-booking-conf',
    name: 'resort_booking_confirmation_v2',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerContent: 'Booking Confirmed ✨',
    body: 'Hi {{GuestName}}, your reservation at {{ResortName}} is confirmed for {{CheckInDate}} in room/villa {{RoomNumber}}! Your Booking Ref is #{{BookingID}}. We look forward to hosting you for an unforgettable stay.',
    footer: 'Reply HELP for resort concierge or CANCEL to manage reservation',
    variables: ['GuestName', 'ResortName', 'CheckInDate', 'RoomNumber', 'BookingID'],
    sampleValues: {
      GuestName: 'Anand Sharma',
      ResortName: 'Majestic Serenity Resort',
      CheckInDate: 'Aug 18, 2026',
      RoomNumber: 'Villa 304',
      BookingID: 'RES-8924'
    },
    buttons: [
      { type: 'url', label: 'View Reservation', value: 'https://resortdesk.ai/guest/RES-8924' },
      { type: 'phone', label: 'Call Front Desk', value: '+18005550199' }
    ],
    lastUsed: '10 mins ago',
    useCount: 3840
  },
  {
    id: 'tmpl-welcome-msg',
    name: 'resort_welcome_experience_v1',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'IMAGE',
    headerContent: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80',
    body: 'Welcome to {{ResortName}}, {{GuestName}}! 🌺 Your room {{RoomNumber}} is freshly prepared. High-speed Wi-Fi network is "ResortGuest" (No password needed). Tap below to view our dining menus, spa bookings, or request complimentary concierge services anytime.',
    footer: 'Myra AI Concierge is available 24/7 in this chat',
    variables: ['ResortName', 'GuestName', 'RoomNumber'],
    sampleValues: {
      ResortName: 'Majestic Serenity Resort',
      GuestName: 'Elena Rostova',
      RoomNumber: 'Oceanfront Villa 102'
    },
    buttons: [
      { type: 'quick_reply', label: '📖 Breakfast & Menus' },
      { type: 'quick_reply', label: '💆‍♀️ Book Spa Treatment' },
      { type: 'quick_reply', label: '🛎️ Request Housekeeping' }
    ],
    lastUsed: '25 mins ago',
    useCount: 2940
  },
  {
    id: 'tmpl-spa-upsell',
    name: 'resort_spa_wellness_upsell',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerContent: 'Exclusive Wellness Privilege 🌿',
    body: 'Hi {{GuestName}}, enhance your stay with an exclusive 20% privilege on all Ayurvedic Aromatherapy & Couples Hot Stone Massages booked for tomorrow. Enjoy complimentary herbal tea and infinity pool access.',
    footer: 'Limited to the first 10 appointments daily',
    variables: ['GuestName'],
    sampleValues: {
      GuestName: 'Marcus Vance'
    },
    buttons: [
      { type: 'quick_reply', label: 'Reserve Spa Offer' },
      { type: 'quick_reply', label: 'View Spa Menu' }
    ],
    lastUsed: '1 hour ago',
    useCount: 1420
  },
  {
    id: 'tmpl-review-req',
    name: 'resort_review_and_feedback_v3',
    category: 'MARKETING',
    language: 'en_US',
    status: 'APPROVED',
    headerType: 'TEXT',
    headerContent: 'How was your stay at {{ResortName}}? ⭐',
    body: 'Dear {{GuestName}}, thank you for vacationing with us at {{ResortName}}! Our team strives to create magical moments. Could you spare 30 seconds to share your feedback on Google? It means the world to our staff.',
    footer: 'We appreciate your valuable feedback',
    variables: ['ResortName', 'GuestName'],
    sampleValues: {
      ResortName: 'Majestic Serenity Resort',
      GuestName: 'David Chen'
    },
    buttons: [
      { type: 'url', label: '⭐ Leave Google Review', value: 'https://g.page/r/resortdesk-demo/review' },
      { type: 'quick_reply', label: '💬 Send Private Feedback' }
    ],
    lastUsed: '3 hours ago',
    useCount: 2150
  },
  {
    id: 'tmpl-payment-rem',
    name: 'resort_pending_payment_reminder',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    body: 'Hello {{GuestName}}, this is a friendly reminder from {{ResortName}} regarding the pending balance of {{TotalAmount}} for reservation #{{BookingID}}. Please complete payment via our secure payment link to ensure uninterrupted services.',
    variables: ['GuestName', 'ResortName', 'TotalAmount', 'BookingID'],
    sampleValues: {
      GuestName: 'Sophia Loren',
      ResortName: 'Majestic Serenity Resort',
      TotalAmount: '$840.00',
      BookingID: 'RES-9012'
    },
    buttons: [
      { type: 'url', label: 'Pay Securely Online', value: 'https://pay.resortdesk.ai/RES-9012' }
    ],
    lastUsed: 'Yesterday',
    useCount: 680
  },
  {
    id: 'tmpl-airport-transfer',
    name: 'resort_airport_transfer_inquiry',
    category: 'UTILITY',
    language: 'en_US',
    status: 'APPROVED',
    body: 'Hi {{GuestName}}, would you like our private chauffeured luxury Mercedes transfer to pick you up from the airport on {{CheckInDate}}? Reply with your flight number and we will arrange seamless curbside greeting.',
    variables: ['GuestName', 'CheckInDate'],
    sampleValues: {
      GuestName: 'Anand Sharma',
      CheckInDate: 'Aug 18, 2026'
    },
    buttons: [
      { type: 'quick_reply', label: 'Yes, Book Transfer' },
      { type: 'quick_reply', label: 'No, Self Transport' }
    ],
    lastUsed: '4 hours ago',
    useCount: 910
  }
];

export const initialWorkflows: WhatsAppWorkflow[] = [
  {
    id: 'wf-standard-journey',
    name: 'Standard Guest Journey',
    description: 'Triggered on new booking to guide guests from confirmation to check-in, mid-stay concierge, and review generation.',
    triggerType: 'New Booking Created (Any Channel)',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-16 14:30',
    totalEnrolled: 1840,
    totalCompleted: 1690,
    conversionRate: 91.8,
    nodes: [
      {
        id: 'node-1',
        type: 'trigger',
        title: 'Booking Created',
        subtitle: 'All channels & direct bookings',
        badgeLabel: 'TRIGGER',
        config: {
          triggerEvent: 'booking_created'
        },
        stats: { sent: 1840, delivered: 1840, read: 1840, replied: 0 }
      },
      {
        id: 'node-2',
        type: 'wait',
        title: 'Wait 5m',
        subtitle: 'Allows payment processing to settle',
        config: {
          waitDuration: 5,
          waitUnit: 'minutes',
          waitTimingType: 'after_previous'
        }
      },
      {
        id: 'node-3',
        type: 'action',
        title: 'Send Confirmation',
        subtitle: 'resort_booking_confirmation_v2',
        badgeLabel: 'ACTION',
        config: {
          templateId: 'tmpl-booking-conf',
          templateName: 'resort_booking_confirmation_v2',
          messageText: '"Hi {{GuestName}}, your booking for {{ResortName}} is confirmed for {{CheckInDate}}. Booking ID: {{BookingID}}."',
          buttons: [
            { type: 'url', label: 'View Reservation' },
            { type: 'phone', label: 'Call Front Desk' }
          ]
        },
        stats: { sent: 1840, delivered: 1828, read: 1680, replied: 240 }
      },
      {
        id: 'node-4',
        type: 'wait',
        title: '2 Days Before',
        subtitle: 'Relative to Guest Check-in Date',
        config: {
          waitDuration: 2,
          waitUnit: 'days',
          waitTimingType: 'before_checkin'
        }
      },
      {
        id: 'node-5',
        type: 'action',
        title: 'Send Welcome Message',
        subtitle: 'resort_welcome_experience_v1',
        badgeLabel: 'ACTION',
        config: {
          templateId: 'tmpl-welcome-msg',
          templateName: 'resort_welcome_experience_v1',
          messageText: '"Welcome to {{ResortName}}, {{GuestName}}! 🌺 Room {{RoomNumber}} is ready with digital key and curated dining options..."',
          buttons: [
            { type: 'quick_reply', label: '📖 Breakfast & Menus' },
            { type: 'quick_reply', label: '💆‍♀️ Book Spa Treatment' }
          ]
        },
        stats: { sent: 1720, delivered: 1710, read: 1540, replied: 620 }
      },
      {
        id: 'node-6',
        type: 'ai_action',
        title: 'Myra AI Concierge Auto-Reply',
        subtitle: 'Handles FAQs, breakfast menus, spa slots & room service intake',
        badgeLabel: 'AI AGENT',
        config: {
          aiPrompt: 'Answer guest inquiries politely about dining hours, Wi-Fi, pool towels, late checkout, and local island excursions using ResortDesk official knowledge base.',
          aiTone: 'Warm & Hospitable',
          aiCapability: 'menu_concierge',
          fallbackToHuman: true
        },
        stats: { sent: 620, delivered: 620, read: 615, replied: 580 }
      },
      {
        id: 'node-7',
        type: 'wait',
        title: '1 Day After Checkout',
        subtitle: 'Sent post-departure at 11:00 AM',
        config: {
          waitDuration: 1,
          waitUnit: 'days',
          waitTimingType: 'after_checkout'
        }
      },
      {
        id: 'node-8',
        type: 'action',
        title: 'Review Request',
        subtitle: 'resort_review_and_feedback_v3',
        badgeLabel: 'ACTION',
        config: {
          templateId: 'tmpl-review-req',
          templateName: 'resort_review_and_feedback_v3',
          messageText: '"Dear {{GuestName}}, thank you for staying with us at {{ResortName}}! Could you take a moment to share a Google review?"',
          buttons: [
            { type: 'url', label: '⭐ Leave Google Review' }
          ]
        },
        stats: { sent: 1410, delivered: 1402, read: 1190, replied: 340 }
      },
      {
        id: 'node-9',
        type: 'end',
        title: 'Workflow Completed',
        subtitle: 'Logged to Guest CRM Lifetime Record',
        badgeLabel: 'END',
        config: {}
      }
    ]
  },
  {
    id: 'wf-vip-experience',
    name: 'VIP High Roller & Villa Experience',
    description: 'Specialized high-touch workflow with luxury chauffeur airport coordination, GM welcome note, and personalized butler channel.',
    triggerType: 'VIP Guest Booking or Penthouse/Villa Allocation',
    status: 'active',
    createdAt: '2026-08-05',
    updatedAt: '2026-08-15 11:15',
    totalEnrolled: 240,
    totalCompleted: 228,
    conversionRate: 95.0,
    nodes: [
      {
        id: 'node-vip-1',
        type: 'trigger',
        title: 'VIP Booking Detected',
        subtitle: 'Villa categories & Tier 1 VIPs',
        badgeLabel: 'TRIGGER',
        config: { triggerEvent: 'vip_arrival' }
      },
      {
        id: 'node-vip-2',
        type: 'action',
        title: 'Send Chauffeur & Pre-Arrival Form',
        subtitle: 'resort_airport_transfer_inquiry',
        badgeLabel: 'ACTION',
        config: {
          templateId: 'tmpl-airport-transfer',
          messageText: 'Greetings {{GuestName}}, your dedicated private butler has reserved your airport arrival transfer.'
        }
      },
      {
        id: 'node-vip-3',
        type: 'notification',
        title: 'Alert GM & Front Office Manager',
        subtitle: 'Staff Telegram & In-App Alert',
        badgeLabel: 'STAFF NOTIFY',
        config: {
          notifyRole: 'manager',
          notificationTitle: 'VIP Guest Arrival Imminent',
          notificationBody: 'Prepare chilled champagne, fruit tier, and handwritten greeting card.'
        }
      },
      {
        id: 'node-vip-4',
        type: 'end',
        title: 'VIP Active Protocol',
        badgeLabel: 'END',
        config: {}
      }
    ]
  },
  {
    id: 'wf-spa-upsell-campaign',
    name: 'Pre-Arrival Spa & Cabana Upsell',
    description: 'Automated 20% discount promotion dispatched 48h prior to check-in for guests without existing spa bookings.',
    triggerType: '3 Days Before Check-in (No Spa Addon)',
    status: 'active',
    createdAt: '2026-08-08',
    updatedAt: '2026-08-14 09:00',
    totalEnrolled: 780,
    totalCompleted: 710,
    conversionRate: 28.4,
    nodes: [
      {
        id: 'node-spa-1',
        type: 'trigger',
        title: '3 Days Before Check-in',
        badgeLabel: 'TRIGGER',
        config: { triggerEvent: 'checkin_reminder' }
      },
      {
        id: 'node-spa-2',
        type: 'condition',
        title: 'Has Existing Spa Booking?',
        badgeLabel: 'CONDITION',
        config: {
          conditionField: 'special_requests',
          conditionOperator: 'is_false',
          trueBranchLabel: 'No Spa Reserved yet',
          falseBranchLabel: 'Already Booked'
        }
      },
      {
        id: 'node-spa-3',
        type: 'action',
        title: 'Send Spa 20% Privilege Offer',
        subtitle: 'resort_spa_wellness_upsell',
        badgeLabel: 'ACTION',
        config: {
          templateId: 'tmpl-spa-upsell',
          messageText: 'Enhance your stay with an exclusive 20% privilege on all Ayurvedic Aromatherapy & Couples Hot Stone Massages.'
        }
      },
      {
        id: 'node-spa-4',
        type: 'end',
        title: 'Campaign Complete',
        badgeLabel: 'END',
        config: {}
      }
    ]
  },
  {
    id: 'wf-payment-reminder',
    name: 'Pending Balance Automated Reminder',
    description: 'Instant notification dispatched when unpaid booking balance exists 24h prior to check-in.',
    triggerType: 'Unpaid Balance > $0 at T-24h',
    status: 'active',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-16 10:20',
    totalEnrolled: 310,
    totalCompleted: 295,
    conversionRate: 88.5,
    nodes: [
      {
        id: 'node-pay-1',
        type: 'trigger',
        title: 'Payment Outstanding',
        badgeLabel: 'TRIGGER',
        config: { triggerEvent: 'payment_pending' }
      },
      {
        id: 'node-pay-2',
        type: 'action',
        title: 'Send Secure Payment Link',
        subtitle: 'resort_pending_payment_reminder',
        badgeLabel: 'ACTION',
        config: {
          templateId: 'tmpl-payment-rem',
          messageText: 'Friendly reminder from {{ResortName}} regarding the balance of {{TotalAmount}} for reservation #{{BookingID}}.'
        }
      },
      {
        id: 'node-pay-3',
        type: 'end',
        title: 'Follow-up Complete',
        badgeLabel: 'END',
        config: {}
      }
    ]
  }
];

export const initialMyraAIInsights: MyraAIWorkflowInsight[] = [
  {
    id: 'insight-1',
    type: 'condition',
    title: 'Breakfast Menu Auto-Reply',
    description: 'High guest inquiry frequency detected for breakfast hours and digital menus immediately after arrival welcome message.',
    recommendation: 'I\'ve analyzed this workflow. Most guests reply to the "Welcome Message" asking for the breakfast menu. Would you like me to add an auto-reply condition for that?',
    actionLabel: 'Yes, add condition',
    impact: '+24% response speed, reduces front desk calls by ~38/day',
    suggestedNode: {
      id: 'node-ai-breakfast-auto',
      type: 'ai_action',
      title: 'Auto-Reply: Breakfast Menu & Hours',
      subtitle: 'Instant PDF link & cabana reservation prompt',
      badgeLabel: 'AI AGENT',
      config: {
        aiPrompt: 'When guest inquires about breakfast, respond with daily timings (6:30 AM - 10:30 AM at The Azure Pavilion) and offer live table reservations.',
        aiTone: 'Warm & Hospitable',
        aiCapability: 'menu_concierge',
        fallbackToHuman: true
      }
    }
  },
  {
    id: 'insight-2',
    type: 'upsell',
    title: 'Spa Sunset Cabana Upsell Recommendation',
    description: 'Guests staying in Oceanview Suites have a 4.2x higher conversion rate for 5:00 PM sunset spa packages.',
    recommendation: 'Add a 2-day pre-arrival VIP spa prompt to increase ancillary revenue by an estimated $3,200/week.',
    actionLabel: 'Add Spa Upsell Step',
    impact: 'Est. +$3,200 ancillary weekly revenue',
    suggestedNode: {
      id: 'node-ai-spa-upsell',
      type: 'action',
      title: 'Sunset Cabana Massage Upsell',
      subtitle: 'resort_spa_wellness_upsell',
      badgeLabel: 'ACTION',
      config: {
        templateId: 'tmpl-spa-upsell',
        messageText: 'Exclusive Sunset Cabana Spa privilege for your stay in {{RoomNumber}}.'
      }
    }
  },
  {
    id: 'insight-3',
    type: 'review',
    title: 'Post-Stay Google Review Optimization',
    description: 'Dispatching review requests at 11:00 AM on the day after checkout yields 32% higher 5-star ratings compared to checkout afternoon.',
    recommendation: 'Adjust timing of node "Review Request" to 11:00 AM Day +1.',
    actionLabel: 'Optimize Timing',
    impact: '+18% completed review volume'
  }
];

export const initialMessageLogs: WhatsAppMessageLog[] = [
  {
    id: 'log-1',
    guestName: 'Anand Sharma',
    guestPhone: '+91 98201 44520',
    roomNumber: 'Villa 304',
    workflowName: 'Standard Guest Journey',
    nodeTitle: 'Send Confirmation',
    direction: 'outbound',
    messageText: 'Hi Anand, your booking for Majestic Serenity Resort is confirmed for Aug 18, 2026. Booking ID: #RES-8924.',
    status: 'read',
    timestamp: '2 mins ago',
    templateUsed: 'resort_booking_confirmation_v2'
  },
  {
    id: 'log-2',
    guestName: 'Elena Rostova',
    guestPhone: '+44 7700 900142',
    roomNumber: 'Villa 102',
    workflowName: 'Standard Guest Journey',
    nodeTitle: 'Guest Reply (Inbound)',
    direction: 'inbound',
    messageText: 'Hello! Can we get extra towels and the room service breakfast menu?',
    status: 'replied',
    timestamp: '14 mins ago',
    aiHandled: true,
    aiConfidence: 0.98
  },
  {
    id: 'log-3',
    guestName: 'Elena Rostova',
    guestPhone: '+44 7700 900142',
    roomNumber: 'Villa 102',
    workflowName: 'Standard Guest Journey',
    nodeTitle: 'Myra AI Concierge Auto-Reply',
    direction: 'outbound',
    messageText: 'Certainly, Ms. Rostova! 🌺 2 extra plush bath sheets have been dispatched to Villa 102 (ETA ~6 mins). Here is our Organic Breakfast Menu: https://resortdesk.ai/menu/breakfast. Let me know if you would like me to place an order for you!',
    status: 'delivered',
    timestamp: '13 mins ago',
    aiHandled: true
  },
  {
    id: 'log-4',
    guestName: 'Marcus Vance',
    guestPhone: '+1 415 555 0192',
    roomNumber: 'Penthouse 501',
    workflowName: 'VIP High Roller & Villa Experience',
    nodeTitle: 'Send Chauffeur & Pre-Arrival Form',
    direction: 'outbound',
    messageText: 'Greetings Mr. Vance, your dedicated private butler has reserved your luxury airport arrival transfer.',
    status: 'read',
    timestamp: '38 mins ago',
    templateUsed: 'resort_airport_transfer_inquiry'
  },
  {
    id: 'log-5',
    guestName: 'David Chen',
    guestPhone: '+65 9123 4567',
    roomNumber: 'Deluxe Room 204',
    workflowName: 'Standard Guest Journey',
    nodeTitle: 'Review Request',
    direction: 'outbound',
    messageText: 'Dear David, thank you for vacationing with us at Majestic Serenity Resort! Could you spare 30 seconds to share your review on Google?',
    status: 'read',
    timestamp: '1 hour ago',
    templateUsed: 'resort_review_and_feedback_v3'
  }
];

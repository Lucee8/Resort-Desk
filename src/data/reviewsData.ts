import { 
  ReviewItem, 
  SentimentTopicMetric, 
  ReputationSummary, 
  GoogleReviewsIntegrationConfig, 
  ReviewAIInsight 
} from '../types';

export const initialReputationSummary: ReputationSummary = {
  overallScore: 4.8,
  scoreDelta: 0.2,
  totalVerifiedReviews: 1248,
  newThisWeekCount: 32,
  positivePercentage: 85,
  negativePercentage: 15,
  neutralPercentage: 6,
  responseRate: 94,
  avgResponseTimeHours: 2.4,
  ratingDistribution: {
    5: 973,
    4: 175,
    3: 50,
    2: 25,
    1: 25
  },
  monthlyTrends: [
    { month: 'Mar', avgRating: 4.6, count: 182, responseRate: 88 },
    { month: 'Apr', avgRating: 4.7, count: 210, responseRate: 90 },
    { month: 'May', avgRating: 4.7, count: 245, responseRate: 92 },
    { month: 'Jun', avgRating: 4.6, count: 198, responseRate: 89 },
    { month: 'Jul', avgRating: 4.8, count: 228, responseRate: 93 },
    { month: 'Aug', avgRating: 4.8, count: 185, responseRate: 94 }
  ]
};

export const initialSentimentTopics: SentimentTopicMetric[] = [
  {
    topic: 'Staff & Service',
    positivePercentage: 92,
    trendDelta: 4.2,
    totalMentions: 486,
    sentimentBreakdown: { positive: 447, neutral: 25, negative: 14 },
    topKeywords: ['warm hospitality', 'attentive', 'Chef Rajesh', 'butler service', 'quick check-in', 'Anita spa']
  },
  {
    topic: 'Cleanliness',
    positivePercentage: 78,
    trendDelta: -0.5,
    totalMentions: 312,
    sentimentBreakdown: { positive: 243, neutral: 42, negative: 27 },
    topKeywords: ['sparkling pool', 'fresh linens', 'immaculate villa', 'spotless bathroom', 'jasmine fragrance']
  },
  {
    topic: 'Food & Dining',
    positivePercentage: 74,
    trendDelta: -2.1,
    totalMentions: 395,
    sentimentBreakdown: { positive: 292, neutral: 58, negative: 45 },
    flaggedWarning: 'Flagged for review: weekend breakfast queue delays',
    topKeywords: ['Goan fish curry', 'Malvani thali', 'Spice Garden', 'cocktails', 'buffet wait times', 'fresh bakery']
  },
  {
    topic: 'Rooms & Comfort',
    positivePercentage: 88,
    trendDelta: 3.1,
    totalMentions: 420,
    sentimentBreakdown: { positive: 370, neutral: 32, negative: 18 },
    topKeywords: ['panoramic sea view', 'private plunge pool', 'comfortable bed', 'plush pillows', 'balcony sunset']
  },
  {
    topic: 'Wi-Fi & Connectivity',
    positivePercentage: 62,
    trendDelta: -4.8,
    totalMentions: 148,
    sentimentBreakdown: { positive: 92, neutral: 18, negative: 38 },
    flaggedWarning: 'Action needed in North Villas 104-108',
    topKeywords: ['weak signal', 'zoom call drop', 'mesh network needed', 'good in lobby', 'slow upload']
  },
  {
    topic: 'Spa & Wellness',
    positivePercentage: 96,
    trendDelta: 6.0,
    totalMentions: 210,
    sentimentBreakdown: { positive: 202, neutral: 6, negative: 2 },
    topKeywords: ['Ayurvedic massage', 'Abhyanga therapy', 'serene ocean deck', 'yoga sunrise', 'essential oils']
  }
];

export const initialGoogleIntegrationConfig: GoogleReviewsIntegrationConfig = {
  isConnected: true,
  connectedAccount: 'samikshakoyande5@gmail.com',
  businessName: 'The Malabar Grand Cliff Resort & Spa, Goa',
  locationId: 'locations/1089274829104829182',
  placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  autoSyncEnabled: true,
  syncFrequencyMinutes: 30,
  lastSyncedAt: 'Just now (10:45 AM)',
  autoReplyEnabled: true,
  autoReplyMinRating: 5,
  autoReplyTone: 'Warm & Hospitable',
  oauthScopes: [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  verifiedLocationAddress: 'Cliff Edge Highway, Ratnagiri Coast, Maharashtra / Goa Border, 415612',
  averageGoogleRating: 4.9,
  totalGoogleReviews: 642
};

export const initialReviewAIInsights: ReviewAIInsight[] = [
  {
    id: 'rai-1',
    type: 'issue',
    title: 'Wi-Fi Dead Zone in North Wing Cottages #104-108',
    description: '3 guests on Booking.com & Google reported dropped Zoom calls and slow Wi-Fi in the hillside sector over the last 48 hours.',
    severity: 'high',
    affectedArea: 'Hillside Cottages 104-108',
    suggestedAction: 'Dispatch IT Networking team to install dedicated outdoor Wi-Fi 6 Mesh Access Point.',
    actionType: 'maintenance',
    prefilledData: {
      roomNumber: 'Cottages #104-108',
      category: 'Electrical / Networking',
      note: 'Guest Marcus Thorne and 2 others reported Wi-Fi outage during working holiday. High priority mesh router upgrade needed.'
    }
  },
  {
    id: 'rai-2',
    type: 'commendation',
    title: 'Culinary Team Praise: Chef Rajesh & Server Sunita',
    description: '14 reviews this week highlighted the Goan Kingfish curry and personalized breakfast table service by Sunita.',
    severity: 'positive',
    affectedArea: 'Spice Garden Restaurant',
    suggestedAction: 'Award Employee of the Month bonus badge to Chef Rajesh and server Sunita.',
    actionType: 'staff',
    prefilledData: {
      staffName: 'Chef Rajesh & Sunita Bai',
      note: 'Exceptional guest satisfaction scores for dining and breakfast hospitality.'
    }
  },
  {
    id: 'rai-3',
    type: 'recovery_offer',
    title: 'Guest Recovery Alert: Marcus Thorne (Deluxe Suite)',
    description: '2-star review received regarding Wi-Fi disruption during a business retreat.',
    severity: 'high',
    affectedArea: 'Deluxe Suite',
    suggestedAction: 'Send personalized apology letter from General Manager with 25% future stay voucher.',
    actionType: 'recovery_offer',
    prefilledData: {
      guestName: 'Marcus Thorne',
      guestEmail: 'marcus.thorne@enterprise.io',
      note: 'Complimentary room upgrade + private Wi-Fi dongle on next booking.'
    }
  },
  {
    id: 'rai-4',
    type: 'operational',
    title: 'Breakfast Rush Bottleneck (09:15 AM - 10:15 AM)',
    description: '4 reviews noted queues at the live Dosa & Waffle counters on Saturday and Sunday mornings.',
    severity: 'medium',
    affectedArea: 'Spice Garden Main Dining Room',
    suggestedAction: 'Add a secondary live dosa station on terrace and introduce staggered breakfast booking slots.',
    actionType: 'operations'
  }
];

export const initialReviewsList: ReviewItem[] = [
  {
    id: 'rev-1',
    reviewerName: 'Sarah Jenkins',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Local Guide • 18 reviews',
    platform: 'Google',
    rating: 5,
    date: 'Aug 15, 2026',
    relativeTime: '2 days ago',
    roomOrBooking: 'Villa 4',
    stayDateRange: 'Aug 11 - Aug 14, 2026',
    reviewText: '"Absolutely stunning property! The staff went above and beyond for our anniversary. The private pool was immaculate, and breakfast was served exactly on time every morning. Will definitely be returning next season."',
    sentiment: 'Positive',
    sentimentScore: 0.98,
    topics: ['Staff & Service', 'Cleanliness', 'Food & Dining', 'Rooms'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: '2 days ago (Aug 15, 2026)',
      text: 'Dear Sarah, Happy Anniversary! It was our absolute pleasure to host you and your partner at Villa 4. We are thrilled you loved the private pool and our morning breakfast service. Our team is already looking forward to welcoming you back for another magical season on the Konkan cliffside!',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 15, 2026, 4:20 PM'
    },
    likesCount: 6,
    externalUrl: 'https://maps.google.com/?cid=1089274829104829182'
  },
  {
    id: 'rev-2',
    reviewerName: 'Marcus Thorne',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Verified Booking.com Guest',
    platform: 'Booking.com',
    rating: 2,
    date: 'Today, Aug 17, 2026',
    relativeTime: '4 hours ago',
    roomOrBooking: 'Deluxe Suite',
    stayDateRange: 'Aug 14 - Aug 17, 2026',
    reviewText: '"The room was beautiful and the view was great, but the Wi-Fi was completely unusable for my entire 3-day stay. I was here on a working holiday and had to go to a local cafe just to take Zoom calls. Disappointing for a 5-star price."',
    sentiment: 'Negative',
    sentimentScore: 0.21,
    topics: ['Wi-Fi', 'Rooms', 'Value & Pricing'],
    status: 'Action Required',
    actionRequiredReason: 'Critical Wi-Fi disruption during working holiday stay.',
    aiSuggestedReply: {
      tone: 'Empathetic Problem Solver',
      text: 'Dear Marcus, Thank you for taking the time to share your feedback. We sincerely apologize for the Wi-Fi connectivity issues you experienced in the Deluxe Suite during your working holiday. We know how crucial seamless internet is for business meetings, and having to leave the resort for Zoom calls is unacceptable by our standards. Our IT team is actively upgrading the access point in that wing today. I would love the chance to welcome you back under proper conditions—please email me directly at gm@malabarresort.com so I can personally arrange a complimentary room upgrade and private high-speed mesh router for your next visit.',
      suggestedAt: 'Just now',
      confidence: 0.96,
      actionablePerk: 'Complimentary Room Upgrade & Private 5G Router on Return',
      keyPointsCovered: ['Acknowledged Deluxe Suite stay', 'Apologized for Wi-Fi failure during work', 'Noted IT mesh deployment', 'Provided GM direct email for recovery']
    },
    guestEmail: 'marcus.thorne@enterprise.io',
    guestPhone: '+44 7911 123456',
    assignedStaffToAddress: 'Vikram S. (IT Lead) & Anand Sharma (GM)'
  },
  {
    id: 'rev-3',
    reviewerName: 'Priyanshu & Ritu Sharma',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Google Local Guide • Level 7',
    platform: 'Google',
    rating: 5,
    date: 'Aug 16, 2026',
    relativeTime: '1 day ago',
    roomOrBooking: 'Luxury Beachfront Villa 02',
    stayDateRange: 'Aug 12 - Aug 15, 2026',
    reviewText: '"The sunset views from our deck were breathtaking! Chef Rajesh prepared the most exquisite coastal Malvani thali and Goan fish curry for our family dinner. Anita at the Ayurveda spa gave one of the best Abhyanga massages we\'ve experienced. Special shoutout to front desk team for the seamless late check-out!"',
    sentiment: 'Positive',
    sentimentScore: 0.99,
    topics: ['Food & Dining', 'Spa & Wellness', 'Staff & Service', 'Location & Views'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Yesterday (Aug 16, 2026)',
      text: 'Dear Priyanshu and Ritu, Thank you so much for this heartfelt review! We are delighted that Chef Rajesh’s authentic coastal Malvani thali and Anita’s Ayurvedic treatments made your family getaway so memorable. I have shared your kind words with the entire team. We look forward to your next visit to our Konkan cliff paradise!',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 16, 2026, 6:15 PM'
    },
    likesCount: 12,
    externalUrl: 'https://maps.google.com/?cid=1089274829104829182'
  },
  {
    id: 'rev-4',
    reviewerName: 'Elena Rostova',
    reviewerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Airbnb Superguest • 32 stays',
    platform: 'Airbnb',
    rating: 5,
    date: 'Aug 14, 2026',
    relativeTime: '3 days ago',
    roomOrBooking: 'Sunset Pool Cottage #106',
    stayDateRange: 'Aug 09 - Aug 13, 2026',
    reviewText: '"Superhost experience through and through! The villa was spotless and having a private plunge pool overlooking the Arabian sea is pure paradise. The housekeeping staff (Sunita Bai) left fresh jasmine flowers every afternoon. Can\'t wait to be back in November!"',
    sentiment: 'Positive',
    sentimentScore: 0.97,
    topics: ['Cleanliness', 'Rooms', 'Staff & Service', 'Location & Views'],
    status: 'Pending',
    aiSuggestedReply: {
      tone: 'Luxury Concierge',
      text: 'Dear Elena, Thank you for choosing our Sunset Pool Cottage for your coastal retreat! It brings us immense joy to know that Sunita’s daily jasmine flower touch and the cliffside plunge pool gave you that true 5-star feeling. We have already noted your upcoming trip in November and look forward to preparing your favorite cottage with warm hospitality.',
      suggestedAt: '1 hour ago',
      confidence: 0.98,
      keyPointsCovered: ['Sunita housekeeping appreciation', 'November re-booking welcome', 'Private pool praise']
    },
    guestEmail: 'elena.rostova@traveler.com'
  },
  {
    id: 'rev-5',
    reviewerName: 'Rajiv & Meera Malhotra',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Tripadvisor Senior Contributor',
    platform: 'Tripadvisor',
    rating: 3,
    date: 'Aug 12, 2026',
    relativeTime: '5 days ago',
    roomOrBooking: 'Heritage Sea-View Suite #302',
    stayDateRange: 'Aug 08 - Aug 11, 2026',
    reviewText: '"Beautiful location and peaceful ambiance. However, the breakfast buffet at the Spice Garden restaurant was overcrowded between 9:00 AM and 10:00 AM with long waits for live dosa and waffle stations. Also, the hot water took 5 minutes to warm up in the morning."',
    sentiment: 'Neutral',
    sentimentScore: 0.54,
    topics: ['Food & Dining', 'Rooms', 'Staff & Service'],
    status: 'Pending',
    aiSuggestedReply: {
      tone: 'Warm & Hospitable',
      text: 'Dear Rajiv and Meera, Thank you for visiting us at The Malabar Grand Cliff Resort. We appreciate your honest observations regarding the breakfast timing rush and hot water plumbing in Suite 302. We have just added a second live dosa station to reduce peak morning wait times and our engineering team has flushed the solar heating line. We hope to welcome you back for a much smoother dining and stay experience soon.',
      suggestedAt: '2 hours ago',
      confidence: 0.91,
      keyPointsCovered: ['Spice Garden dining improvements', 'Solar hot water line maintenance', 'Courteous appreciation']
    }
  },
  {
    id: 'rev-6',
    reviewerName: 'David & Chloe Chen',
    reviewerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Google Local Guide • Level 5',
    platform: 'Google',
    rating: 5,
    date: 'Aug 11, 2026',
    relativeTime: '6 days ago',
    roomOrBooking: 'Ocean Panorama Villa #08',
    stayDateRange: 'Aug 06 - Aug 10, 2026',
    reviewText: '"Celebrated our 10th anniversary here and it couldn\'t have been more romantic. The candlelit beachside cabana dinner organized by the concierge team was unforgettable. Flawless service from check-in to airport transfer."',
    sentiment: 'Positive',
    sentimentScore: 0.99,
    topics: ['Staff & Service', 'Food & Dining', 'Location & Views'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Aug 11, 2026',
      text: 'Dear David and Chloe, Congratulations on a decade of happiness! It was our privilege to host your 10th anniversary candlelit dinner under the stars. Our concierge team was thrilled to read your feedback. Wishing you many more joyful adventures together!',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 11, 2026, 8:40 PM'
    },
    likesCount: 8,
    externalUrl: 'https://maps.google.com/?cid=1089274829104829182'
  },
  {
    id: 'rev-7',
    reviewerName: 'Vikramaditya Singhania',
    reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Booking.com Genius Level 3',
    platform: 'Booking.com',
    rating: 1,
    date: 'Aug 16, 2026',
    relativeTime: '1 day ago',
    roomOrBooking: 'Standard Garden Cottage #104',
    stayDateRange: 'Aug 14 - Aug 16, 2026',
    reviewText: '"The AC in Room 104 was leaking water onto our luggage rack during the night. Reported it at 11 PM but technician didn\'t arrive until 7 AM next morning. Ruined our sleep and soaked my leather bag. Completely unacceptable for a luxury resort."',
    sentiment: 'Negative',
    sentimentScore: 0.12,
    topics: ['Rooms', 'Staff & Service', 'Cleanliness'],
    status: 'Action Required',
    actionRequiredReason: 'Night AC water leak incident with delayed maintenance response.',
    aiSuggestedReply: {
      tone: 'Empathetic Problem Solver',
      text: 'Dear Vikramaditya, I am deeply embarrassed and sincerely apologetic for the night HVAC leak in Room 104 and the unpardonable delay in night technician dispatch. We hold ourselves to the highest luxury standards, and we clearly fell short during your stay. We have reprimanded the night duty desk protocol and replaced the entire AC condensation unit. I would like to personally compensate you for the damaged leather bag and invite you for a 2-night complimentary stay at our Presidential Suite. Please call me on my direct line +91 98200 88991.',
      suggestedAt: '4 hours ago',
      confidence: 0.97,
      actionablePerk: 'Bag Compensation & 2-Night Complimentary Presidential Stay Voucher',
      keyPointsCovered: ['Night dispatch failure acknowledgment', 'AC unit replacement confirmed', 'Direct executive phone line & personal compensation']
    },
    guestEmail: 'v.singhania@apexindustries.in',
    guestPhone: '+91 98210 55443'
  },
  {
    id: 'rev-8',
    reviewerName: 'Aisha & Farhan Al-Maktoum',
    reviewerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Google Verified Reviewer',
    platform: 'Google',
    rating: 5,
    date: 'Aug 10, 2026',
    relativeTime: '1 week ago',
    roomOrBooking: 'Presidential Beach Villa #01',
    stayDateRange: 'Aug 04 - Aug 09, 2026',
    reviewText: '"World-class hospitality! The butler service by Mr. Ramesh was exceptional. Our kids loved the daily eco-nature walks and the turtle nesting sanctuary. Truly a gem on the Konkan coast."',
    sentiment: 'Positive',
    sentimentScore: 0.99,
    topics: ['Staff & Service', 'Location & Views', 'Cleanliness'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Aug 10, 2026',
      text: 'Dear Aisha and Farhan, Thank you for visiting from Dubai! Mr. Ramesh was honored by your generous compliments, and our eco-naturalist guide loved introducing the kids to the Olive Ridley turtle conservation project. We look forward to your family’s return next summer!',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 10, 2026, 3:15 PM'
    },
    likesCount: 15,
    externalUrl: 'https://maps.google.com/?cid=1089274829104829182'
  },
  {
    id: 'rev-9',
    reviewerName: 'Kavita Krishnan',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Airbnb Verified Guest',
    platform: 'Airbnb',
    rating: 4,
    date: 'Aug 09, 2026',
    relativeTime: '1 week ago',
    roomOrBooking: 'Cliffside Studio #204',
    stayDateRange: 'Aug 05 - Aug 08, 2026',
    reviewText: '"Cozy stay with an unbeatable panoramic ocean view. The bed was super comfortable and bathroom amenities were luxurious Forest Essentials products. The steep climb up the cliff steps was a workout, but the golf cart shuttle was helpful."',
    sentiment: 'Positive',
    sentimentScore: 0.88,
    topics: ['Rooms', 'Location & Views', 'Staff & Service'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Aug 09, 2026',
      text: 'Dear Kavita, Thank you for staying at our Cliffside Studio! We are glad you enjoyed the Forest Essentials amenities and coastal views. Our 24/7 buggy shuttle team is always happy to assist with effortless transportation around the cliff property. See you again soon!',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 09, 2026, 5:00 PM'
    }
  },
  {
    id: 'rev-10',
    reviewerName: 'Aman Verma',
    reviewerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Tripadvisor Contributor',
    platform: 'Tripadvisor',
    rating: 4,
    date: 'Aug 03, 2026',
    relativeTime: '2 weeks ago',
    roomOrBooking: 'Deluxe King #108',
    stayDateRange: 'Jul 30 - Aug 02, 2026',
    reviewText: '"Great weekend getaway from Mumbai. Scenic drive and very welcoming staff with traditional aarti and garland welcome. Pool bar cocktails by bartender Kevin were fantastic. Would recommend soundproofing the connecting doors."',
    sentiment: 'Positive',
    sentimentScore: 0.85,
    topics: ['Staff & Service', 'Food & Dining', 'Rooms'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Aug 04, 2026',
      text: 'Dear Aman, Thank you for driving down from Mumbai! We are glad the welcoming aarti and Kevin’s poolside cocktails set the right weekend mood. We have taken note of your feedback regarding acoustic insulation on connecting doors and are retrofitting acoustic seals this month. Cheers!',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 04, 2026, 11:30 AM'
    }
  },
  {
    id: 'rev-11',
    reviewerName: 'Sophie Van Der Bilt',
    reviewerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Booking.com Genius Level 2',
    platform: 'Booking.com',
    rating: 5,
    date: 'Aug 02, 2026',
    relativeTime: '2 weeks ago',
    roomOrBooking: 'Villa 12 (Infinity Pool)',
    stayDateRange: 'Jul 28 - Aug 01, 2026',
    reviewText: '"One of the most serene resorts in South Asia. Listening to the crashing waves while having breakfast on our terrace is pure therapy. The concierge team arranged a private boat tour to the historic sea fort that was the highlight of our vacation."',
    sentiment: 'Positive',
    sentimentScore: 0.99,
    topics: ['Location & Views', 'Staff & Service', 'Food & Dining', 'Rooms'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Aug 02, 2026',
      text: 'Dear Sophie, It was our true pleasure hosting you in Villa 12! The sea fort boat excursion is indeed a hidden gem of our coastline. We cannot wait to welcome you back for another peaceful escape.',
      isPublishedToPlatform: true,
      publishedAt: 'Aug 02, 2026, 2:00 PM'
    }
  },
  {
    id: 'rev-12',
    reviewerName: 'Rohit Kulkarni',
    reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    reviewerBadge: 'Google Local Guide • Level 6',
    platform: 'Google',
    rating: 5,
    date: 'Jul 29, 2026',
    relativeTime: '2 weeks ago',
    roomOrBooking: 'Cottage #101',
    stayDateRange: 'Jul 26 - Jul 29, 2026',
    reviewText: '"Visited with my parents for their 50th wedding anniversary. The resort team went out of their way to provide wheelchair access and ground-floor mobility for my mother. Traditional Maharashtrian hospitality at its very finest."',
    sentiment: 'Positive',
    sentimentScore: 0.98,
    topics: ['Staff & Service', 'Rooms'],
    status: 'Replied',
    reply: {
      author: 'Anand Sharma',
      authorRole: 'General Manager',
      replyDate: 'Jul 29, 2026',
      text: 'Dear Rohit, Congratulations to your wonderful parents on their Golden Jubilee! Making our senior guests feel completely at home and cared for is our greatest reward. Warmest regards to the whole family.',
      isPublishedToPlatform: true,
      publishedAt: 'Jul 29, 2026, 5:45 PM'
    }
  }
];

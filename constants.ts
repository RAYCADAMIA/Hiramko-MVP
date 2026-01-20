import { User, Item, Rental, RentalStatus, ItemCategory, Notification, NotificationType, UserType, LogisticsType } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Badsiro',
    email: 'badsiro@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.8,
    reviews: 12,
    location: 'Davao City',
    joinedDate: '2023-01-15',
    verified: false
  },
  {
    id: 'u2',
    name: 'Jack',
    email: 'jack@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.9,
    reviews: 28,
    location: 'BGC, Taguig',
    joinedDate: '2023-02-20',
    verified: true
  },
  {
    id: 'u3',
    name: 'RentAll Shop',
    email: 'shop@rentall.com',
    avatar: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.5,
    reviews: 156,
    location: 'Quezon City',
    joinedDate: '2022-11-05',
    verified: true,
    isShop: true
  },
  {
    id: 'u4',
    name: 'Dave',
    email: 'dave@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.2,
    reviews: 5,
    location: 'Pasig City',
    joinedDate: '2023-05-10',
    verified: true
  },
  {
    id: 'u5',
    name: 'Sophia',
    email: 'sophia@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 5.0,
    reviews: 42,
    location: 'Mandaluyong',
    joinedDate: '2023-03-15',
    verified: true
  },
  {
    id: 'u6',
    name: 'Leigh',
    email: 'leigh@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.7,
    reviews: 8,
    location: 'Makati City',
    joinedDate: '2023-06-01',
    verified: true
  },
  {
    id: 'u7',
    name: 'Robyn',
    email: 'robyn@example.com',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.6,
    reviews: 15,
    location: 'BGC, Taguig',
    joinedDate: '2023-04-22',
    verified: true
  },
  {
    id: 'u8',
    name: 'Isabel',
    email: 'isabel@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.9,
    reviews: 33,
    location: 'Quezon City',
    joinedDate: '2023-01-30',
    verified: true
  },
  {
    id: 'u9',
    name: 'Mharlee',
    email: 'mharlee@example.com',
    avatar: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
    type: UserType.REGULAR,
    rating: 4.8,
    reviews: 10,
    location: 'Pasig City',
    joinedDate: '2023-07-12',
    verified: true
  }
];

// Curated images for better reliability
const CATEGORY_IMAGES: Record<string, string[]> = {
  [ItemCategory.CAMERAS]: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1519183071298-a2962feb80f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1564466021188-1e17010c541c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  [ItemCategory.VEHICLES]: [
    'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  [ItemCategory.DORMITELS]: [
    'https://images.unsplash.com/photo-1555854743-e3c2f6a581ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  [ItemCategory.PROPERTIES]: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  [ItemCategory.TOOLS]: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  [ItemCategory.GADGETS]: [
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1593642632823-8f78536788c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  [ItemCategory.CLOTHING]: [
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1594938298603-c8148c472996?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ],
  'default': [
    'https://images.unsplash.com/photo-1531297461136-82lw9z1w1e1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  ]
};

// Helper to generate more items
const generateItems = (): Item[] => {
  const baseItems: Item[] = [
    {
      id: 'i1',
      title: 'Sony A7III Camera Kit',
      description: 'Full frame mirrorless camera with 28-70mm lens. Perfect for weddings and events. Includes 2 batteries and 64GB SD card.',
      category: ItemCategory.CAMERAS,
      pricePerDay: 185,
      images: [CATEGORY_IMAGES[ItemCategory.CAMERAS][0]],
      owner: MOCK_USERS[0], // Badsiro
      location: 'Roxas St., Davao City',
      condition: 'Like New',
      isAvailable: true,
      depositAmount: 150,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i2',
      title: 'DJI Mavic Air 2',
      description: 'Compact drone with 4K camera. Easy to fly, great for travel videos. Comes with 3 batteries (Fly More Combo).',
      category: ItemCategory.CAMERAS,
      pricePerDay: 195,
      images: ['https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      owner: MOCK_USERS[1], // Jack
      location: 'Matina, Davao City',
      condition: 'Good',
      isAvailable: true,
      depositAmount: 150,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i3',
      title: 'Bosch Power Drill Set',
      description: 'Cordless drill with 2 batteries and full bit set. Ideal for home DIY projects and furniture assembly.',
      category: ItemCategory.TOOLS,
      pricePerDay: 135,
      images: [CATEGORY_IMAGES[ItemCategory.TOOLS][0]],
      owner: MOCK_USERS[2], // RentAll Shop
      location: 'Claveria, Davao City',
      condition: 'Good',
      isAvailable: true,
      depositAmount: 100,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i4',
      title: 'Apple MacBook Pro M2',
      description: 'Latest model with vibrant screen. Perfect for video editing and creative work. Comes with charger and sleeve.',
      category: ItemCategory.GADGETS,
      pricePerDay: 150,
      images: [CATEGORY_IMAGES[ItemCategory.GADGETS][0]],
      owner: MOCK_USERS[3], // Dave
      location: 'Roxas St., Davao City',
      condition: 'Like New',
      isAvailable: true,
      depositAmount: 200,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i5',
      title: 'Camping Tent (4-Person)',
      description: 'Waterproof, easy setup dome tent. Spacious enough for a small family or group of friends. Clean and sanitized.',
      category: ItemCategory.CAMPING,
      pricePerDay: 140,
      images: ['https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      owner: MOCK_USERS[4], // Sophia
      location: 'Matina, Davao City',
      condition: 'Good',
      isAvailable: true,
      depositAmount: 100,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i6',
      title: 'Toyota Vios 2023',
      description: 'Automatic transmission, fuel efficient. Perfect for city driving or out of town trips. Comprehensive insurance included.',
      category: ItemCategory.VEHICLES,
      pricePerDay: 200,
      images: [CATEGORY_IMAGES[ItemCategory.VEHICLES][0]],
      owner: MOCK_USERS[5], // Leigh
      location: 'Claveria, Davao City',
      condition: 'Like New',
      isAvailable: true,
      depositAmount: 200,
      logisticsType: LogisticsType.MEDIUM_HEAVY,
      allowSurvey: true
    },
    {
      id: 'i7',
      title: 'Tuxedo Suit (Black)',
      description: 'Elegant black tuxedo, size medium. Perfect for formal events, weddings, and galas. Dry cleaned.',
      category: ItemCategory.CLOTHING,
      pricePerDay: 180,
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c472996?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      owner: MOCK_USERS[6], // Robyn
      location: 'Roxas St., Davao City',
      condition: 'Like New',
      isAvailable: true,
      depositAmount: 120,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i8',
      title: 'Fender Stratocaster Guitar',
      description: 'Classic electric guitar with amp and cable. Great tone, freshly re-strung. Ready to rock.',
      category: ItemCategory.MUSIC,
      pricePerDay: 160,
      images: ['https://images.unsplash.com/photo-1550985543-f47f38aee65d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      owner: MOCK_USERS[7], // Isabel
      location: 'Matina, Davao City',
      condition: 'Good',
      isAvailable: true,
      depositAmount: 150,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    },
    {
      id: 'i9',
      title: 'Vivaldi Estates Studio',
      description: 'Cozy studio type condo unit. Fully furnished with high-speed internet. Located in the heart of the city.',
      category: ItemCategory.PROPERTIES,
      pricePerDay: 199,
      images: [CATEGORY_IMAGES[ItemCategory.PROPERTIES][0]],
      owner: MOCK_USERS[0], // Badsiro
      location: 'Claveria, Davao City',
      condition: 'Like New',
      isAvailable: true,
      depositAmount: 180,
      logisticsType: LogisticsType.OWNER_DELIVERY,
      allowSurvey: true
    },
    {
      id: 'i10',
      title: 'C5 Dormitel Unit',
      description: 'Affordable dormitel unit near C5. Safe and secure with 24/7 security. Ideal for students and young professionals.',
      category: ItemCategory.DORMITELS,
      pricePerDay: 120,
      images: [CATEGORY_IMAGES[ItemCategory.DORMITELS][0]],
      owner: MOCK_USERS[2], // RentAll Shop
      location: 'Roxas St., Davao City',
      condition: 'Good',
      isAvailable: true,
      depositAmount: 200,
      logisticsType: LogisticsType.OWNER_DELIVERY,
      allowSurvey: true
    },
    {
      id: 'i11',
      title: 'Azuela Seaside Condo',
      description: 'Luxurious seaside living with breathtaking views. Amenities include pool, gym, and private beach access.',
      category: ItemCategory.PROPERTIES,
      pricePerDay: 200,
      images: ['https://images.unsplash.com/photo-1515263487990-61b07816b324?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      owner: MOCK_USERS[1], // Jack
      location: 'Lanang, Davao City',
      condition: 'Like New',
      isAvailable: true,
      depositAmount: 200,
      logisticsType: LogisticsType.OWNER_DELIVERY,
      allowSurvey: true
    },
    {
      id: 'i12',
      title: '3 Bedroom Apartment',
      description: 'Spacious apartment perfect for families. Near schools and shopping centers. Fully furnished.',
      category: ItemCategory.PROPERTIES,
      pricePerDay: 200,
      images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'],
      owner: MOCK_USERS[3], // Dave
      location: 'Matina, Davao City',
      condition: 'Good',
      isAvailable: true,
      depositAmount: 180,
      logisticsType: LogisticsType.OWNER_DELIVERY,
      allowSurvey: true
    }
  ];

  // Generate more items to reach 40
  const extraItems: Item[] = [];
  const categories = Object.values(ItemCategory);
  const locations = ['Roxas St., Davao City', 'Matina, Davao City', 'Claveria, Davao City', 'Lanang, Davao City', 'Toril, Davao City'];

  for (let i = 13; i <= 40; i++) {
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const owner = MOCK_USERS[i % MOCK_USERS.length];

    // Get a random image for this category or fallback
    const catImages = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES['default'];
    const image = catImages[Math.floor(Math.random() * catImages.length)];

    extraItems.push({
      id: `i${i}`,
      title: `${cat} Item #${i}`,
      description: `This is a high quality ${cat.toLowerCase()} item available for rent. Well maintained and in excellent condition.`,
      category: cat,
      pricePerDay: Math.floor(Math.random() * 101) + 100, // Price between 100 and 200
      images: [image],
      owner: owner,
      location: locations[Math.floor(Math.random() * locations.length)],
      condition: 'Good',
      isAvailable: true,
      depositAmount: Math.floor(Math.random() * 100) + 50,
      logisticsType: LogisticsType.LIGHT,
      allowSurvey: false
    });
  }

  return [...baseItems, ...extraItems];
};

export const MOCK_ITEMS = generateItems();

// Custom order: Cameras, Vehicles, Dormitels, Properties, Clothing, ... Others
export const CATEGORIES = [
  ItemCategory.CAMERAS,
  ItemCategory.VEHICLES,
  ItemCategory.DORMITELS,
  ItemCategory.PROPERTIES,
  ItemCategory.CLOTHING,
  ItemCategory.GADGETS,
  ItemCategory.TOOLS,
  ItemCategory.SPORTS,
  ItemCategory.BOOKS,
  ItemCategory.MUSIC,
  ItemCategory.CAMPING,
  ItemCategory.PARTY,
  ItemCategory.APPLIANCES,
  ItemCategory.COSTUMES,
  ItemCategory.OTHERS
];

export const MOCK_RENTALS: Rental[] = [
  {
    id: 'r1',
    item: MOCK_ITEMS[0],
    renter: MOCK_USERS[1],
    startDate: '2023-06-10',
    endDate: '2023-06-12',
    totalPrice: 370, // 2 days * 185
    status: RentalStatus.COMPLETED,
    deliveryMethod: 'pickup'
  },
  {
    id: 'r2',
    item: MOCK_ITEMS[2],
    renter: MOCK_USERS[0],
    startDate: '2023-07-05',
    endDate: '2023-07-06',
    totalPrice: 135,
    status: RentalStatus.ACTIVE,
    deliveryMethod: 'delivery',
    riderName: 'Dave',
    riderPhone: '+63 912 345 6789'
  },
  {
    id: 'r3',
    item: MOCK_ITEMS[5], // Toyota Vios
    renter: MOCK_USERS[0], // Badsiro
    startDate: '2023-11-20',
    endDate: '2023-11-25',
    totalPrice: 1000,
    status: RentalStatus.ACTIVE,
    deliveryMethod: 'pickup'
  }
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: NotificationType.RENTAL_REQUEST,
    title: 'New Rental Request',
    message: 'Jack wants to rent your Sony A7III',
    read: false,
    createdAt: '2023-07-20T10:30:00Z',
    link: '/messages'
  },
  {
    id: 'n2',
    userId: 'u1',
    type: NotificationType.SYSTEM,
    title: 'Welcome to HiramKo',
    message: 'Thanks for joining! Verify your ID to start renting.',
    read: true,
    createdAt: '2023-01-15T09:00:00Z'
  }
];

export const MOCK_CONVERSATIONS: import('./types').Conversation[] = [
  {
    id: 'c1',
    participants: [MOCK_USERS[0], MOCK_USERS[3]], // Badsiro and Dave (u4)
    lastMessage: {
      id: 'm1',
      senderId: 'u4',
      text: 'Yes po, Hiram ko',
      timestamp: '10:30 AM',
      isRead: false
    },
    messages: [
      {
        id: 'm0',
        senderId: 'u1',
        text: 'Hiram ka?',
        timestamp: '10:00 AM',
        isRead: true
      },
      {
        id: 'm1',
        senderId: 'u4',
        text: 'Yes po, Hiram ko',
        timestamp: '10:30 AM',
        isRead: false
      }
    ]
  },
  {
    id: 'c2',
    participants: [MOCK_USERS[1], MOCK_USERS[0]], // Jack and Badsiro
    lastMessage: {
      id: 'm3',
      senderId: 'u2',
      text: 'Great, I will book it now.',
      timestamp: 'Yesterday',
      isRead: true
    },
    messages: [
      {
        id: 'm2',
        senderId: 'u2',
        text: 'Is the camera lens clean?',
        timestamp: 'Yesterday',
        isRead: true
      },
      {
        id: 'm3',
        senderId: 'u1',
        text: 'Yes, absolutely spotless.',
        timestamp: 'Yesterday',
        isRead: true
      },
      {
        id: 'm3',
        senderId: 'u2',
        text: 'Great, I will book it now.',
        timestamp: 'Yesterday',
        isRead: true
      }
    ]
  },
  {
    id: 'c3',
    participants: [MOCK_USERS[0], MOCK_USERS[3]], // Badsiro and Dave
    lastMessage: {
      id: 'm6',
      senderId: 'u4',
      text: 'Is the MacBook still available for next week?',
      timestamp: '2 mins ago',
      isRead: false
    },
    messages: [
      {
        id: 'm5',
        senderId: 'u4',
        text: 'Hi Badsiro!',
        timestamp: '5 mins ago',
        isRead: true
      },
      {
        id: 'm6',
        senderId: 'u4',
        text: 'Is the MacBook still available for next week?',
        timestamp: '2 mins ago',
        isRead: false
      }
    ]
  }
];
export enum UserType {
  REGULAR = 'REGULAR',
}

export enum ItemCategory {
  CAMERAS = 'Cameras',
  VEHICLES = 'Vehicles',
  DORMITELS = 'Dormitels',
  PROPERTIES = 'Properties',
  CLOTHING = 'Clothing',
  GADGETS = 'Gadgets',
  TOOLS = 'Tools',
  SPORTS = 'Sports',
  BOOKS = 'Books',
  MUSIC = 'Musical Instruments',
  CAMPING = 'Camping Gear',
  PARTY = 'Party Supplies',
  APPLIANCES = 'Appliances',
  COSTUMES = 'Costumes',
  OTHERS = 'Others'
}

export enum LogisticsType {
  LIGHT = 'Light (Motorcycle)',
  MEDIUM_HEAVY = 'Medium/Heavy (Car/Van/Truck)',
  OWNER_DELIVERY = 'Owner Delivery',
  PICKUP_ONLY = 'Pickup Only'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  type: UserType;
  rating: number;
  reviews: number;
  location: string;
  joinedDate: string;
  verified: boolean;
  isShop?: boolean;
  escrowBalance?: number;
  gcashNumber?: string;
  gcashName?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  category: ItemCategory;
  images: string[];
  owner: User;
  location: string;
  condition: 'Like New' | 'Good' | 'Fair' | 'Heavily Used';
  isAvailable: boolean;
  depositAmount: number;
  logisticsType: LogisticsType;
  allowSurvey: boolean;
  createdAt: string;
}

export enum RentalStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  RIDER_PICKUP = 'Rider Pickup',
  IN_POSSESSION = 'In Possession',
  RETURN_INITIATED = 'Return Initiated',
  RIDER_RETURN = 'Rider Return',
  COMPLETED = 'Completed',
  DISPUTED = 'Disputed',
  ACTIVE = 'Active'
}

export enum EscrowStatus {
  PENDING = 'PENDING',    // Waiting for payment
  HELD = 'HELD',          // Funds secured in escrow
  RELEASED = 'RELEASED',  // Funds released to owner (rental fee) / renter (deposit)
  DISPUTED = 'DISPUTED',  // Funds frozen due to dispute
  REFUNDED = 'REFUNDED'   // Funds returned to renter (cancellation)
}

export interface Rental {
  id: string;
  item: Item;
  renter: User;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  totalPrice: number;
  pickupProof?: string; // URL to image
  returnProof?: string; // URL to image
  paymentStatus: 'unpaid' | 'review' | 'paid';
  paymentProofUrl?: string;
  deliveryMethod: 'pickup' | 'meetup' | 'delivery';
  riderName?: string;
  riderPhone?: string;
  escrowStatus?: EscrowStatus;
  disputeReason?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage: ChatMessage;
  messages: ChatMessage[];
}

export enum NotificationType {
  RENTAL_REQUEST = 'rental_request',
  SYSTEM = 'system',
  MESSAGE = 'message',
  success = 'success',
  warning = 'warning',
  info = 'info'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  time?: string;
}

export interface Review {
  id: string;
  rentalId: string;
  reviewerId: string;
  targetId: string; // User ID being reviewed
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}
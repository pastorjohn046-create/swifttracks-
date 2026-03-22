export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  customerID?: string;
  createdAt: string;
}

export type ShipmentStatus = 'pending' | 'warehouse' | 'carrier-1' | 'carrier-2' | 'carrier-3' | 'customs' | 'shipped' | 'delivered' | 'cancelled';

export interface Shipment {
  id: string;
  trackingNumber: string;
  senderId: string;
  senderName?: string;
  senderEmail?: string;
  senderPhone?: string;
  senderAddress?: string;
  receiverName: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverAddress: string;
  status: ShipmentStatus;
  description: string;
  weight: number;
  dimensions?: string;
  serviceType?: string;
  estimatedDelivery?: string;
  packageImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingUpdate {
  id: string;
  shipmentId?: string;
  flightId?: string;
  location: string;
  status: string;
  description: string;
  packageImage?: string;
  timestamp: string;
}

export type FlightStatus = 'scheduled' | 'departed' | 'arrived' | 'delayed' | 'cancelled';

export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
}

export type TicketStatus = 'open' | 'pending' | 'resolved';

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  reply?: string;
  status: TicketStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  targetId: string;
  targetType: 'shipment' | 'flight';
  rating: number;
  comment: string;
  createdAt: string;
}

import { ObjectId } from "mongodb";

export type StudioCategory = 
  | "Photo Studio" 
  | "Film Stage" 
  | "Podcast Lounge" 
  | "Music Suite" 
  | "Art Workshop";

export interface IStudio {
  _id?: ObjectId | string;
  title: string;
  category: StudioCategory;
  hourlyRate: number;
  securityDeposit: number;
  maxCapacity: number;
  location: string;
  image: string;
  gallery: string[];
  amenities: string[];
  overview: string;
  rating: number;
  reviewCount: number;
  ownerEmail: string;
  ownerName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type BookingStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

export interface IBooking {
  _id?: ObjectId | string;
  studioId: ObjectId | string;
  studioTitle: string;
  studioImage: string;
  renterEmail: string;
  renterName: string;
  ownerEmail: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:MM (24-hour)
  endTime: string;     // HH:MM (24-hour)
  totalHours: number;
  hourlyRate: number;
  subtotal: number;
  securityDeposit: number;
  serviceFee: number;
  totalAmount: number;
  status: BookingStatus;
  notes?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface IUser {
  _id?: ObjectId | string;
  name: string;
  email: string;
  password?: string;
  photoURL: string;
  role: "creator" | "host" | "admin";
  createdAt: Date | string;
}

export interface IWishlist {
  _id?: ObjectId | string;
  userEmail: string;
  studioId: ObjectId | string;
  createdAt: Date | string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}


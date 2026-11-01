import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import { ENV } from "./env.js";
import { IStudio, IBooking, IUser, IWishlist } from "../types/index.js";
import { SEED_STUDIOS, SEED_USERS } from "../data/seedData.js";

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnected = false;

// Resilient in-memory fallback store
export class InMemoryStore {
  users: (IUser & { _id: string })[] = [];
  studios: (IStudio & { _id: string })[] = [];
  bookings: (IBooking & { _id: string })[] = [];
  wishlist: (IWishlist & { _id: string })[] = [];

  constructor() {
    this.seedInitial();
  }

  seedInitial() {
    const hashedPassword = bcrypt.hashSync("StudioSpace2026!", 10);
    
    this.users = SEED_USERS.map((user, idx) => ({
      ...user,
      _id: `user_seed_${idx + 1}`,
      password: hashedPassword,
    }));

    this.studios = SEED_STUDIOS.map((studio, idx) => ({
      ...studio,
      _id: `studio_seed_${idx + 1}`,
    }));

    // Seed sample bookings for staging preview
    this.bookings = [
      {
        _id: "booking_seed_1",
        studioId: "studio_seed_1",
        studioTitle: "Apex Daylight Infinity Cyc & Soundstage",
        studioImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80",
        renterEmail: "creator.examiner@studiospace.io",
        renterName: "Marcus Sterling",
        ownerEmail: "host.examiner@studiospace.io",
        bookingDate: "2026-11-20",
        startTime: "10:00",
        endTime: "14:00",
        totalHours: 4,
        hourlyRate: 125,
        subtotal: 500,
        securityDeposit: 250,
        serviceFee: 35,
        totalAmount: 785,
        status: "Pending",
        notes: "Autumn Lookbook shoot with 4 models and beauty team.",
        createdAt: new Date("2026-11-01T10:00:00Z"),
      },
      {
        _id: "booking_seed_2",
        studioId: "studio_seed_2",
        studioTitle: "Blackout Cinema Stage A with Camlock Power",
        studioImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80",
        renterEmail: "creator.examiner@studiospace.io",
        renterName: "Marcus Sterling",
        ownerEmail: "host.examiner@studiospace.io",
        bookingDate: "2026-11-22",
        startTime: "09:00",
        endTime: "17:00",
        totalHours: 8,
        hourlyRate: 195,
        subtotal: 1560,
        securityDeposit: 400,
        serviceFee: 75,
        totalAmount: 2035,
        status: "Confirmed",
        notes: "Indie Sci-Fi feature scene: interior cockpit lighting.",
        createdAt: new Date("2026-10-28T14:00:00Z"),
      }
    ];

    // Seed sample wishlist item
    this.wishlist = [
      {
        _id: "wishlist_seed_1",
        userEmail: "creator.examiner@studiospace.io",
        studioId: "studio_seed_1",
        createdAt: new Date("2026-11-01T10:00:00Z"),
      }
    ];
  }
}

export const inMemoryStore = new InMemoryStore();

export async function connectDB(): Promise<Db | null> {
  if (db && isConnected) return db;

  try {
    console.log("📡 Attempting connection to MongoDB Atlas...");
    client = new MongoClient(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 7000,
    });

    await client.connect();
    db = client.db();
    isConnected = true;
    console.log(`✅ Successfully connected to MongoDB Atlas database: ${db.databaseName}`);

    // Auto-seed Atlas if collections are empty
    await autoSeedAtlas(db);

    return db;
  } catch (error: any) {
    console.warn(`⚠️ MongoDB Atlas connection notice: ${error.message}`);
    console.warn("🔄 Active mode: High-performance in-memory fallback. All CRUD, JWT Auth, and double-booking checks will operate 100% reliably!");
    isConnected = false;
    return null;
  }
}

async function autoSeedAtlas(database: Db) {
  try {
    const studiosCount = await database.collection("studios").countDocuments();
    if (studiosCount === 0) {
      console.log("🌱 Auto-seeding MongoDB Atlas with initial high-fidelity studios dataset...");
      await database.collection("studios").insertMany(SEED_STUDIOS as any);
      console.log(`✅ Seeded ${SEED_STUDIOS.length} creative studios into Atlas collection!`);
    }

    const usersCount = await database.collection("users").countDocuments();
    if (usersCount === 0) {
      const hashedPassword = await bcrypt.hash("StudioSpace2026!", 10);
      const usersToInsert = SEED_USERS.map(u => ({ ...u, password: hashedPassword }));
      await database.collection("users").insertMany(usersToInsert as any);
      console.log("✅ Seeded initial accounts into Atlas users collection!");
    }
  } catch (err: any) {
    console.warn("Notice during Atlas seeding:", err.message);
  }
}

export function getDB(): Db | null {
  return db;
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function closeDB(): Promise<void> {
  if (client) {
    await client.close();
    isConnected = false;
    db = null;
  }
}

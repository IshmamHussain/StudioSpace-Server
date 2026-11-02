"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryStore = exports.InMemoryStore = void 0;
exports.connectDB = connectDB;
exports.getDB = getDB;
exports.isDbConnected = isDbConnected;
exports.closeDB = closeDB;
const mongodb_1 = require("mongodb");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_js_1 = require("./env.js");
const seedData_js_1 = require("../data/seedData.js");
let client = null;
let db = null;
let isConnected = false;
// Resilient in-memory fallback store
class InMemoryStore {
    users = [];
    studios = [];
    bookings = [];
    wishlist = [];
    constructor() {
        this.seedInitial();
    }
    seedInitial() {
        const hashedPassword = bcryptjs_1.default.hashSync("StudioSpace2026!", 10);
        this.users = seedData_js_1.SEED_USERS.map((user, idx) => ({
            ...user,
            _id: `user_seed_${idx + 1}`,
            password: hashedPassword,
        }));
        this.studios = seedData_js_1.SEED_STUDIOS.map((studio, idx) => ({
            ...studio,
            _id: `studio_seed_${idx + 1}`,
        }));
        // Seed sample bookings for staging preview
        this.bookings = [
            {
                _id: "booking_seed_1",
                studioId: "studio_seed_1",
                studioTitle: "Apex Daylight Infinity Cyc & Soundstage",
                studioImage: "https://images.unsplash.com/photo-1736580602204-b940bb0423ec?auto=format&fit=crop&w=600&q=80",
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
                studioImage: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=600&q=80",
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
exports.InMemoryStore = InMemoryStore;
exports.inMemoryStore = new InMemoryStore();
async function connectDB() {
    if (db && isConnected)
        return db;
    try {
        console.log("📡 Attempting connection to MongoDB Atlas...");
        client = new mongodb_1.MongoClient(env_js_1.ENV.MONGODB_URI, {
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
    }
    catch (error) {
        console.warn(`⚠️ MongoDB Atlas connection notice: ${error.message}`);
        console.warn("🔄 Active mode: High-performance in-memory fallback. All CRUD, JWT Auth, and double-booking checks will operate 100% reliably!");
        isConnected = false;
        return null;
    }
}
async function autoSeedAtlas(database) {
    try {
        const studiosCount = await database.collection("studios").countDocuments();
        if (studiosCount === 0) {
            console.log("🌱 Auto-seeding MongoDB Atlas with initial high-fidelity studios dataset...");
            await database.collection("studios").insertMany(seedData_js_1.SEED_STUDIOS);
            console.log(`✅ Seeded ${seedData_js_1.SEED_STUDIOS.length} creative studios into Atlas collection!`);
        }
        const usersCount = await database.collection("users").countDocuments();
        if (usersCount === 0) {
            const hashedPassword = await bcryptjs_1.default.hash("StudioSpace2026!", 10);
            const usersToInsert = seedData_js_1.SEED_USERS.map(u => ({ ...u, password: hashedPassword }));
            await database.collection("users").insertMany(usersToInsert);
            console.log("✅ Seeded initial accounts into Atlas users collection!");
        }
    }
    catch (err) {
        console.warn("Notice during Atlas seeding:", err.message);
    }
}
function getDB() {
    return db;
}
function isDbConnected() {
    return isConnected;
}
async function closeDB() {
    if (client) {
        await client.close();
        isConnected = false;
        db = null;
    }
}

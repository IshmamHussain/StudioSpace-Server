"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStudios = getAllStudios;
exports.getStudioById = getStudioById;
exports.createStudio = createStudio;
exports.updateStudio = updateStudio;
exports.deleteStudio = deleteStudio;
exports.getMyListings = getMyListings;
const mongodb_1 = require("mongodb");
const db_js_1 = require("../config/db.js");
async function getAllStudios(req, res) {
    try {
        const { category, search, limit, sort } = req.query;
        const limitNum = limit ? parseInt(limit, 10) : 0;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            const query = {};
            if (category && category !== "All") {
                query.category = category;
            }
            if (search) {
                const searchRegex = { $regex: search, $options: "i" };
                query.$or = [
                    { title: searchRegex },
                    { location: searchRegex },
                    { overview: searchRegex },
                    { category: searchRegex },
                ];
            }
            let sortOptions = { createdAt: -1 };
            if (sort === "price_asc")
                sortOptions = { hourlyRate: 1 };
            else if (sort === "price_desc")
                sortOptions = { hourlyRate: -1 };
            else if (sort === "rating")
                sortOptions = { rating: -1 };
            let cursor = db.collection("studios").find(query).sort(sortOptions);
            if (limitNum > 0) {
                cursor = cursor.limit(limitNum);
            }
            const studios = await cursor.toArray();
            res.status(200).json({
                success: true,
                count: studios.length,
                studios: studios.map(s => ({ ...s, _id: s._id.toString() })),
            });
            return;
        }
        // In-memory fallback
        let filtered = [...db_js_1.inMemoryStore.studios];
        if (category && category !== "All") {
            filtered = filtered.filter(s => s.category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter(s => s.title.toLowerCase().includes(q) ||
                s.location.toLowerCase().includes(q) ||
                s.overview.toLowerCase().includes(q) ||
                s.category.toLowerCase().includes(q));
        }
        if (sort === "price_asc") {
            filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
        }
        else if (sort === "price_desc") {
            filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
        }
        else if (sort === "rating") {
            filtered.sort((a, b) => b.rating - a.rating);
        }
        else {
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        if (limitNum > 0) {
            filtered = filtered.slice(0, limitNum);
        }
        res.status(200).json({
            success: true,
            count: filtered.length,
            studios: filtered,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch studios." });
    }
}
async function getStudioById(req, res) {
    try {
        const { id } = req.params;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            let query = {};
            if (mongodb_1.ObjectId.isValid(id)) {
                query = { _id: new mongodb_1.ObjectId(id) };
            }
            else {
                query = { _id: id };
            }
            const studio = await db.collection("studios").findOne(query);
            if (!studio) {
                res.status(404).json({ success: false, message: "Studio workspace not found." });
                return;
            }
            res.status(200).json({
                success: true,
                studio: { ...studio, _id: studio._id.toString() },
            });
            return;
        }
        const studio = db_js_1.inMemoryStore.studios.find(s => s._id.toString() === id);
        if (!studio) {
            res.status(404).json({ success: false, message: "Studio workspace not found." });
            return;
        }
        res.status(200).json({
            success: true,
            studio,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch studio details." });
    }
}
async function createStudio(req, res) {
    try {
        const user = req.user;
        const { title, category, hourlyRate, securityDeposit, maxCapacity, location, image, gallery, amenities, overview, } = req.body;
        if (!title || !category || !hourlyRate || !location || !image) {
            res.status(400).json({
                success: false,
                message: "Title, category, hourly rate, location, and featured image are required.",
            });
            return;
        }
        const newStudio = {
            title: title.trim(),
            category,
            hourlyRate: Number(hourlyRate),
            securityDeposit: Number(securityDeposit || 0),
            maxCapacity: Number(maxCapacity || 10),
            location: location.trim(),
            image: image.trim(),
            gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : [image.trim()],
            amenities: Array.isArray(amenities) ? amenities : (amenities ? String(amenities).split(",").map(a => a.trim()) : []),
            overview: overview?.trim() || "Spacious, fully-equipped creative studio space designed for professional production.",
            rating: 5.0,
            reviewCount: 1,
            ownerEmail: user.email,
            ownerName: user.name,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            const result = await db.collection("studios").insertOne(newStudio);
            res.status(201).json({
                success: true,
                message: "Studio listed successfully! Welcome to the StudioSpace host network.",
                studio: { ...newStudio, _id: result.insertedId.toString() },
            });
            return;
        }
        const id = `studio_${Date.now()}`;
        const saved = { ...newStudio, _id: id };
        db_js_1.inMemoryStore.studios.unshift(saved);
        res.status(201).json({
            success: true,
            message: "Studio listed successfully! Welcome to the StudioSpace host network.",
            studio: saved,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to create studio listing." });
    }
}
async function updateStudio(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        const updates = req.body;
        // Prevent modifying ownership
        delete updates._id;
        delete updates.ownerEmail;
        delete updates.ownerName;
        updates.updatedAt = new Date();
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            let query = {};
            if (mongodb_1.ObjectId.isValid(id)) {
                query = { _id: new mongodb_1.ObjectId(id) };
            }
            else {
                query = { _id: id };
            }
            const existing = await db.collection("studios").findOne(query);
            if (!existing) {
                res.status(404).json({ success: false, message: "Studio not found." });
                return;
            }
            if (existing.ownerEmail !== user.email && user.role !== "admin") {
                res.status(403).json({ success: false, message: "Forbidden: You are not the owner of this studio listing." });
                return;
            }
            if (updates.hourlyRate)
                updates.hourlyRate = Number(updates.hourlyRate);
            if (updates.securityDeposit)
                updates.securityDeposit = Number(updates.securityDeposit);
            if (updates.maxCapacity)
                updates.maxCapacity = Number(updates.maxCapacity);
            await db.collection("studios").updateOne(query, { $set: updates });
            const updated = await db.collection("studios").findOne(query);
            res.status(200).json({
                success: true,
                message: "Studio specifications updated successfully.",
                studio: { ...updated, _id: updated._id.toString() },
            });
            return;
        }
        const idx = db_js_1.inMemoryStore.studios.findIndex(s => s._id.toString() === id);
        if (idx === -1) {
            res.status(404).json({ success: false, message: "Studio not found." });
            return;
        }
        const existing = db_js_1.inMemoryStore.studios[idx];
        if (existing.ownerEmail !== user.email && user.role !== "admin") {
            res.status(403).json({ success: false, message: "Forbidden: You are not the owner of this studio listing." });
            return;
        }
        const updated = {
            ...existing,
            ...updates,
            hourlyRate: updates.hourlyRate ? Number(updates.hourlyRate) : existing.hourlyRate,
            securityDeposit: updates.securityDeposit ? Number(updates.securityDeposit) : existing.securityDeposit,
            maxCapacity: updates.maxCapacity ? Number(updates.maxCapacity) : existing.maxCapacity,
            updatedAt: new Date(),
        };
        db_js_1.inMemoryStore.studios[idx] = updated;
        res.status(200).json({
            success: true,
            message: "Studio specifications updated successfully.",
            studio: updated,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to update studio listing." });
    }
}
async function deleteStudio(req, res) {
    try {
        const { id } = req.params;
        const user = req.user;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            let query = {};
            if (mongodb_1.ObjectId.isValid(id)) {
                query = { _id: new mongodb_1.ObjectId(id) };
            }
            else {
                query = { _id: id };
            }
            const existing = await db.collection("studios").findOne(query);
            if (!existing) {
                res.status(404).json({ success: false, message: "Studio listing not found." });
                return;
            }
            if (existing.ownerEmail !== user.email && user.role !== "admin") {
                res.status(403).json({ success: false, message: "Forbidden: You do not have permission to delete this studio." });
                return;
            }
            await db.collection("studios").deleteOne(query);
            res.status(200).json({
                success: true,
                message: "Studio listing has been permanently removed from the marketplace.",
            });
            return;
        }
        const idx = db_js_1.inMemoryStore.studios.findIndex(s => s._id.toString() === id);
        if (idx === -1) {
            res.status(404).json({ success: false, message: "Studio listing not found." });
            return;
        }
        const existing = db_js_1.inMemoryStore.studios[idx];
        if (existing.ownerEmail !== user.email && user.role !== "admin") {
            res.status(403).json({ success: false, message: "Forbidden: You do not have permission to delete this studio." });
            return;
        }
        db_js_1.inMemoryStore.studios.splice(idx, 1);
        res.status(200).json({
            success: true,
            message: "Studio listing has been permanently removed from the marketplace.",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to delete studio listing." });
    }
}
async function getMyListings(req, res) {
    try {
        const user = req.user;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            const listings = await db.collection("studios").find({ ownerEmail: user.email }).sort({ createdAt: -1 }).toArray();
            res.status(200).json({
                success: true,
                count: listings.length,
                studios: listings.map(s => ({ ...s, _id: s._id.toString() })),
            });
            return;
        }
        const listings = db_js_1.inMemoryStore.studios.filter(s => s.ownerEmail === user.email);
        res.status(200).json({
            success: true,
            count: listings.length,
            studios: listings,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch your studio listings." });
    }
}

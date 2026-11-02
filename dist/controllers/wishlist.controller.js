"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = getWishlist;
exports.toggleWishlist = toggleWishlist;
const mongodb_1 = require("mongodb");
const db_js_1 = require("../config/db.js");
async function getWishlist(req, res) {
    try {
        const user = req.user;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            const items = await db.collection("wishlist").find({ userEmail: user.email }).toArray();
            const studioIds = items.map(i => i.studioId);
            const objectIds = studioIds.filter(id => mongodb_1.ObjectId.isValid(id)).map(id => new mongodb_1.ObjectId(id));
            const stringIds = studioIds.filter(id => !mongodb_1.ObjectId.isValid(id));
            const studios = await db
                .collection("studios")
                .find({
                $or: [{ _id: { $in: objectIds } }, { _id: { $in: stringIds } }],
            })
                .toArray();
            res.status(200).json({
                success: true,
                count: studios.length,
                studioIds: items.map(i => i.studioId.toString()),
                studios: studios.map(s => ({ ...s, _id: s._id.toString() })),
            });
            return;
        }
        const items = db_js_1.inMemoryStore.wishlist.filter(w => w.userEmail === user.email);
        const studioIds = items.map(i => i.studioId.toString());
        const studios = db_js_1.inMemoryStore.studios.filter(s => studioIds.includes(s._id.toString()));
        res.status(200).json({
            success: true,
            count: studios.length,
            studioIds,
            studios,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch wishlist." });
    }
}
async function toggleWishlist(req, res) {
    try {
        const user = req.user;
        const { studioId } = req.body;
        if (!studioId) {
            res.status(400).json({ success: false, message: "Studio ID is required." });
            return;
        }
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            let queryStudioId = studioId;
            if (mongodb_1.ObjectId.isValid(studioId)) {
                queryStudioId = new mongodb_1.ObjectId(studioId);
            }
            const existing = await db.collection("wishlist").findOne({
                userEmail: user.email,
                $or: [{ studioId: queryStudioId }, { studioId }],
            });
            if (existing) {
                await db.collection("wishlist").deleteOne({ _id: existing._id });
                res.status(200).json({
                    success: true,
                    action: "removed",
                    message: "Studio removed from your saved spaces wishlist.",
                });
                return;
            }
            await db.collection("wishlist").insertOne({
                userEmail: user.email,
                studioId: queryStudioId,
                createdAt: new Date(),
            });
            res.status(200).json({
                success: true,
                action: "added",
                message: "Studio saved to your wishlist!",
            });
            return;
        }
        const existingIdx = db_js_1.inMemoryStore.wishlist.findIndex(w => w.userEmail === user.email && w.studioId.toString() === studioId);
        if (existingIdx !== -1) {
            db_js_1.inMemoryStore.wishlist.splice(existingIdx, 1);
            res.status(200).json({
                success: true,
                action: "removed",
                message: "Studio removed from your saved spaces wishlist.",
            });
            return;
        }
        db_js_1.inMemoryStore.wishlist.push({
            _id: `wishlist_${Date.now()}`,
            userEmail: user.email,
            studioId,
            createdAt: new Date(),
        });
        res.status(200).json({
            success: true,
            action: "added",
            message: "Studio saved to your wishlist!",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to update wishlist." });
    }
}

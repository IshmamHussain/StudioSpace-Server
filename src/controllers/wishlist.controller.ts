import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getDB, isDbConnected, inMemoryStore } from "../config/db.js";

export async function getWishlist(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;

    if (isDbConnected() && getDB()) {
      const db = getDB()!;
      const items = await db.collection("wishlist").find({ userEmail: user.email }).toArray();
      const studioIds = items.map(i => i.studioId);

      const objectIds = studioIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
      const stringIds = studioIds.filter(id => !ObjectId.isValid(id));

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

    const items = inMemoryStore.wishlist.filter(w => w.userEmail === user.email);
    const studioIds = items.map(i => i.studioId.toString());
    const studios = inMemoryStore.studios.filter(s => studioIds.includes(s._id.toString()));

    res.status(200).json({
      success: true,
      count: studios.length,
      studioIds,
      studios,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch wishlist." });
  }
}

export async function toggleWishlist(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    const { studioId } = req.body;

    if (!studioId) {
      res.status(400).json({ success: false, message: "Studio ID is required." });
      return;
    }

    if (isDbConnected() && getDB()) {
      const db = getDB()!;
      let queryStudioId: any = studioId;
      if (ObjectId.isValid(studioId)) {
        queryStudioId = new ObjectId(studioId);
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
      } as any);

      res.status(200).json({
        success: true,
        action: "added",
        message: "Studio saved to your wishlist!",
      });
      return;
    }

    const existingIdx = inMemoryStore.wishlist.findIndex(
      w => w.userEmail === user.email && w.studioId.toString() === studioId
    );

    if (existingIdx !== -1) {
      inMemoryStore.wishlist.splice(existingIdx, 1);
      res.status(200).json({
        success: true,
        action: "removed",
        message: "Studio removed from your saved spaces wishlist.",
      });
      return;
    }

    inMemoryStore.wishlist.push({
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to update wishlist." });
  }
}


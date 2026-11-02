const { createApp } = require("../dist/app.js");
const { connectDB } = require("../dist/config/db.js");
const { reinitAuthWithDb } = require("../dist/config/auth.js");

const app = createApp();
let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    try {
      const db = await connectDB();
      if (db) {
        reinitAuthWithDb(db);
      }
      dbReady = true;
    } catch (err) {
      console.warn("Atlas DB connection notice:", err?.message);
    }
  }
  return app(req, res);
};

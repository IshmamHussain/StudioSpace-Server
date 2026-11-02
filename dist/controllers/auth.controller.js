"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePassword = validatePassword;
exports.register = register;
exports.login = login;
exports.googleAuth = googleAuth;
exports.getMe = getMe;
exports.logout = logout;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_js_1 = require("../config/db.js");
const auth_js_1 = require("../middleware/auth.js");
// Password validation: min 6 chars, 1 uppercase, 1 lowercase
function validatePassword(password) {
    if (!password || password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters long." };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one uppercase letter." };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: "Password must contain at least one lowercase letter." };
    }
    return { valid: true };
}
async function register(req, res) {
    try {
        const { name, email, photoURL, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: "Name, email, and password are required fields." });
            return;
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            res.status(400).json({ success: false, message: passwordCheck.message });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const avatar = photoURL?.trim() || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            const existing = await db.collection("users").findOne({ email: normalizedEmail });
            if (existing) {
                res.status(409).json({ success: false, message: "An account with this email address already exists." });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const newUser = {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                photoURL: avatar,
                role: "creator",
                createdAt: new Date(),
            };
            const result = await db.collection("users").insertOne(newUser);
            res.status(201).json({
                success: true,
                message: "Account created successfully! Please log in to continue.",
                userId: result.insertedId.toString(),
            });
            return;
        }
        else {
            // In-memory fallback
            const existing = db_js_1.inMemoryStore.users.find(u => u.email === normalizedEmail);
            if (existing) {
                res.status(409).json({ success: false, message: "An account with this email address already exists." });
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const id = `user_${Date.now()}`;
            db_js_1.inMemoryStore.users.push({
                _id: id,
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                photoURL: avatar,
                role: "creator",
                createdAt: new Date(),
            });
            res.status(201).json({
                success: true,
                message: "Account created successfully! Please log in to continue.",
                userId: id,
            });
        }
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to register user." });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required." });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        let user = null;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            user = await db.collection("users").findOne({ email: normalizedEmail });
        }
        else {
            user = db_js_1.inMemoryStore.users.find(u => u.email === normalizedEmail);
        }
        if (!user || !user.password) {
            res.status(401).json({ success: false, message: "Invalid email or password." });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ success: false, message: "Invalid email or password." });
            return;
        }
        const userId = user._id.toString();
        const payload = {
            userId,
            email: user.email,
            name: user.name,
            role: user.role || "creator",
        };
        const token = (0, auth_js_1.signToken)(payload);
        (0, auth_js_1.setAuthCookie)(res, token);
        res.status(200).json({
            success: true,
            message: "Login successful! Welcome back.",
            token,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                role: user.role || "creator",
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to authenticate." });
    }
}
async function googleAuth(req, res) {
    try {
        const { name, email, photoURL } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: "Email is required for Google authentication." });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const displayName = name?.trim() || normalizedEmail.split("@")[0];
        const avatar = photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;
        let user = null;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            user = await db.collection("users").findOne({ email: normalizedEmail });
            if (!user) {
                const newUser = {
                    name: displayName,
                    email: normalizedEmail,
                    photoURL: avatar,
                    role: "creator",
                    createdAt: new Date(),
                };
                const result = await db.collection("users").insertOne(newUser);
                user = { ...newUser, _id: result.insertedId };
            }
        }
        else {
            user = db_js_1.inMemoryStore.users.find(u => u.email === normalizedEmail);
            if (!user) {
                user = {
                    _id: `user_google_${Date.now()}`,
                    name: displayName,
                    email: normalizedEmail,
                    photoURL: avatar,
                    role: "creator",
                    createdAt: new Date(),
                };
                db_js_1.inMemoryStore.users.push(user);
            }
        }
        const userId = user._id.toString();
        const payload = {
            userId,
            email: user.email,
            name: user.name,
            role: user.role || "creator",
        };
        const token = (0, auth_js_1.signToken)(payload);
        (0, auth_js_1.setAuthCookie)(res, token);
        res.status(200).json({
            success: true,
            message: "Successfully signed in with Google!",
            token,
            user: {
                id: userId,
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                role: user.role || "creator",
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Google authentication failed." });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authenticated" });
            return;
        }
        let user = null;
        if ((0, db_js_1.isDbConnected)() && (0, db_js_1.getDB)()) {
            const db = (0, db_js_1.getDB)();
            user = await db.collection("users").findOne({ email: req.user.email });
        }
        else {
            user = db_js_1.inMemoryStore.users.find(u => u.email === req.user.email);
        }
        if (!user) {
            // Fallback to token payload
            res.status(200).json({
                success: true,
                user: {
                    id: req.user.userId,
                    name: req.user.name,
                    email: req.user.email,
                    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(req.user.name)}`,
                    role: req.user.role || "creator",
                },
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                photoURL: user.photoURL,
                role: user.role || "creator",
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || "Failed to fetch session." });
    }
}
async function logout(_req, res) {
    (0, auth_js_1.clearAuthCookie)(res);
    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
}

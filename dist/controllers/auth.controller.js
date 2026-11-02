import bcrypt from "bcryptjs";
import { getDB, isDbConnected, inMemoryStore } from "../config/db.js";
import { signToken, setAuthCookie, clearAuthCookie } from "../middleware/auth.js";
// Password validation: min 6 chars, 1 uppercase, 1 lowercase
export function validatePassword(password) {
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
export async function register(req, res) {
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
        if (isDbConnected() && getDB()) {
            const db = getDB();
            const existing = await db.collection("users").findOne({ email: normalizedEmail });
            if (existing) {
                res.status(409).json({ success: false, message: "An account with this email address already exists." });
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
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
            const existing = inMemoryStore.users.find(u => u.email === normalizedEmail);
            if (existing) {
                res.status(409).json({ success: false, message: "An account with this email address already exists." });
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const id = `user_${Date.now()}`;
            inMemoryStore.users.push({
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
export async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required." });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        let user = null;
        if (isDbConnected() && getDB()) {
            const db = getDB();
            user = await db.collection("users").findOne({ email: normalizedEmail });
        }
        else {
            user = inMemoryStore.users.find(u => u.email === normalizedEmail);
        }
        if (!user || !user.password) {
            res.status(401).json({ success: false, message: "Invalid email or password." });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
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
        const token = signToken(payload);
        setAuthCookie(res, token);
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
export async function googleAuth(req, res) {
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
        if (isDbConnected() && getDB()) {
            const db = getDB();
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
            user = inMemoryStore.users.find(u => u.email === normalizedEmail);
            if (!user) {
                user = {
                    _id: `user_google_${Date.now()}`,
                    name: displayName,
                    email: normalizedEmail,
                    photoURL: avatar,
                    role: "creator",
                    createdAt: new Date(),
                };
                inMemoryStore.users.push(user);
            }
        }
        const userId = user._id.toString();
        const payload = {
            userId,
            email: user.email,
            name: user.name,
            role: user.role || "creator",
        };
        const token = signToken(payload);
        setAuthCookie(res, token);
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
export async function getMe(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: "Not authenticated" });
            return;
        }
        let user = null;
        if (isDbConnected() && getDB()) {
            const db = getDB();
            user = await db.collection("users").findOne({ email: req.user.email });
        }
        else {
            user = inMemoryStore.users.find(u => u.email === req.user.email);
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
export async function logout(_req, res) {
    clearAuthCookie(res);
    res.status(200).json({
        success: true,
        message: "Logged out successfully.",
    });
}

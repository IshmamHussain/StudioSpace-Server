"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://admin:studiospace2026@cluster0.mongodb.net/studiospace?retryWrites=true&w=majority",
    JWT_SECRET: process.env.JWT_SECRET || "studiospace_super_secure_jwt_secret_key_2026_tungsten_soundstage",
    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};

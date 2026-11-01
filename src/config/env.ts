import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb+srv://admin:studiospace2026@cluster0.mongodb.net/studiospace?retryWrites=true&w=majority",
  JWT_SECRET: process.env.JWT_SECRET || "studiospace_super_secure_jwt_secret_key_2026_tungsten_soundstage",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};


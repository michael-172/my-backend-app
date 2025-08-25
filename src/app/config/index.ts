import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: `.env.development.local` });

export default {
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  BASE_URL: process.env.BASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};

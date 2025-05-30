import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Load environment variables
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env" }); // or .env.local
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Initialize Neon and Drizzle
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
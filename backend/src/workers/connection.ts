import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import Redis from "ioredis";

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
  },
});
export const redis = new Redis(process.env.REDIS_URL!);

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import Redis from "ioredis";

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
  },
});
export const redis = new Redis({
  host: process.env.REDIS_HOST!,
  port: parseInt(process.env.REDIS_PORT!, 10),
});

import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import Redis from "ioredis";

export const db = drizzle({
  connection: {
    url: process.env.DATABASE_URL!,
  },
});
export const redis = new Redis(process.env.REDIS_URL!);

const { hostname, port, username, password } = new URL(process.env.REDIS_URL!);
export const redisConnection = {
  host: hostname,
  port: parseInt(port),
  ...(username && { username: decodeURIComponent(username) }),
  ...(password && { password: decodeURIComponent(password) }),
};

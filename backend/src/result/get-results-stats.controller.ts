import { FastifyPluginAsync } from "fastify";
import { resultStatsSchema } from "./schema";
import { monitors, results } from "../db/schema";
import { eq, inArray, sql } from "drizzle-orm";

export const getResultsStatsController: FastifyPluginAsync = async (
  fastify,
) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get(
    "/stats",
    { schema: { response: { 200: resultStatsSchema } } },
    async (request) => {
      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      const [byCategory, bySource, byDay] = await Promise.all([
        fastify.db
          .select({
            category: results.intentCategory,
            count: sql<number>`count(*)::int`,
          })
          .from(results)
          .where(inArray(results.monitorId, userMonitorIds))
          .groupBy(results.intentCategory),

        fastify.db
          .select({
            source: results.source,
            count: sql<number>`count(*)::int`,
          })
          .from(results)
          .where(inArray(results.monitorId, userMonitorIds))
          .groupBy(results.source),

        fastify.db
          .select({
            date: sql<string>`date_trunc('day', ${results.createdAt})::date::text`,
            count: sql<number>`count(*)::int`,
          })
          .from(results)
          .where(inArray(results.monitorId, userMonitorIds))
          .groupBy(sql`date_trunc('day', ${results.createdAt})`)
          .orderBy(sql`date_trunc('day', ${results.createdAt})`),
      ]);

      return { byCategory, bySource, byDay };
    },
  );
};

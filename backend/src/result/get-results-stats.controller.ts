import { FastifyPluginAsync } from "fastify";
import { resultStatsSchema, statsQuerySchema, GetResultsStatsQuery } from "./schema";
import { monitors, results } from "../db/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

export const getResultsStatsController: FastifyPluginAsync = async (
  fastify,
) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get<{ Querystring: GetResultsStatsQuery }>(
    "/stats",
    { schema: { querystring: statsQuerySchema, response: { 200: resultStatsSchema } } },
    async (request) => {
      const { monitorId } = request.query;

      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      const whereClause = and(
        inArray(results.monitorId, userMonitorIds),
        monitorId ? eq(results.monitorId, monitorId) : undefined,
      );

      const [byCategory, bySource, byDay] = await Promise.all([
        fastify.db
          .select({
            category: results.intentCategory,
            count: sql<number>`count(*)::int`,
          })
          .from(results)
          .where(whereClause)
          .groupBy(results.intentCategory),

        fastify.db
          .select({
            source: results.source,
            count: sql<number>`count(*)::int`,
          })
          .from(results)
          .where(whereClause)
          .groupBy(results.source),

        fastify.db
          .select({
            date: sql<string>`date_trunc('day', ${results.createdAt})::date::text`,
            count: sql<number>`count(*)::int`,
          })
          .from(results)
          .where(whereClause)
          .groupBy(sql`date_trunc('day', ${results.createdAt})`)
          .orderBy(sql`date_trunc('day', ${results.createdAt})`),
      ]);

      return { byCategory, bySource, byDay };
    },
  );
};

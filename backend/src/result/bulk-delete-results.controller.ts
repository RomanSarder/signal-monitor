import { FastifyPluginAsync } from "fastify";
import {
  BulkDeleteResultsQuery,
  bulkDeleteQuerySchema,
  bulkDeleteResponseSchema,
} from "./schema";
import { monitors, results } from "../db/schema";
import { and, eq, gte, inArray, lte } from "drizzle-orm";

export const bulkDeleteResultsController: FastifyPluginAsync = async (
  fastify,
) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.delete<{ Querystring: BulkDeleteResultsQuery }>(
    "",
    {
      schema: {
        querystring: bulkDeleteQuerySchema,
        response: { 200: bulkDeleteResponseSchema },
      },
    },
    async (request, reply) => {
      const { category, monitorId, minScore, isRead, isSaved, from, to } =
        request.query;

      // Safety guard: refuse to delete without at least one filter so an empty
      // request can never wipe out all of a user's signals.
      if (
        [category, monitorId, minScore, isRead, isSaved, from, to].every(
          (v) => v === undefined,
        )
      ) {
        return reply.badRequest("At least one filter is required");
      }

      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      const deleted = await fastify.db
        .delete(results)
        .where(
          and(
            inArray(results.monitorId, userMonitorIds),
            monitorId ? eq(results.monitorId, monitorId) : undefined,
            category ? eq(results.intentCategory, category) : undefined,
            minScore ? gte(results.intentScore, minScore) : undefined,
            isRead ? eq(results.isRead, isRead) : undefined,
            isSaved ? eq(results.isSaved, isSaved) : undefined,
            from ? gte(results.createdAt, new Date(from)) : undefined,
            to ? lte(results.createdAt, new Date(to)) : undefined,
          ),
        )
        .returning({ id: results.id });

      return { deleted: deleted.length };
    },
  );
};

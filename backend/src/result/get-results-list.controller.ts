import { FastifyPluginAsync } from "fastify";
import { GetResultsListQuery, querySchema, resultSchema } from "./schema";
import { monitors, results } from "../db/schema";
import { and, gte, inArray, lte, sql } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { InferSelectModel } from "drizzle-orm";
import { desc } from "drizzle-orm";

export const getResultsListController: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get<{
    Querystring: GetResultsListQuery;
    Reply: {
      total: number;
      items: InferSelectModel<typeof results>[];
    };
  }>(
    "",
    {
      schema: {
        querystring: querySchema,
        response: {
          200: {
            type: "object",
            properties: {
              total: { type: "integer", minimum: 0 },
              items: { type: "array", items: resultSchema },
            },
          },
        },
      },
    },
    async (request) => {
      const {
        limit = 25,
        offset = 0,
        monitorId,
        category,
        minScore,
        isRead,
        isSaved,
        from,
        to,
        sort,
      } = request.query;

      let sortCondition = undefined;

      if (sort) {
        sortCondition =
          sort === "newest"
            ? desc(results.createdAt)
            : desc(results.intentScore);
      }

      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      const records = await fastify.db
        .select({
          ...getTableColumns(results),
          total: sql<number>`count(*) over()`,
        })
        .from(results)
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
        .orderBy(...(sortCondition ? [sortCondition] : []))
        .offset(offset)
        .limit(limit);

      return {
        total: records[0]?.total || 0,
        items: records,
      };
    },
  );
};

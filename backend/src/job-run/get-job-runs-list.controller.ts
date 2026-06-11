import { FastifyPluginAsync } from "fastify";
import { GetJobRunsQuery, jobRunsQuerySchema, jobRunSchema } from "./schema";
import { jobRuns, monitors } from "../db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";

export const getJobRunsListController: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.get<{ Querystring: GetJobRunsQuery }>(
    "",
    {
      schema: {
        querystring: jobRunsQuerySchema,
        response: {
          200: { type: "array", items: jobRunSchema },
        },
      },
    },
    async (request) => {
      const { monitorId, limit = 10 } = request.query;

      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      return fastify.db
        .select()
        .from(jobRuns)
        .where(
          and(
            inArray(jobRuns.monitorId, userMonitorIds),
            eq(jobRuns.monitorId, monitorId),
          ),
        )
        .orderBy(desc(jobRuns.startedAt))
        .limit(limit);
    },
  );
};

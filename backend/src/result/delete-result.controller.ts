import { FastifyPluginAsync } from "fastify";
import { ResultParams, resultParamsSchema, resultSchema } from "./schema";
import { monitors, results } from "../db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const deleteResultController: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.delete<{ Params: ResultParams }>(
    "/:id",
    {
      schema: {
        params: resultParamsSchema,
        response: { 200: resultSchema },
      },
    },
    async (request, reply) => {
      const userMonitorIds = fastify.db
        .select({ id: monitors.id })
        .from(monitors)
        .where(eq(monitors.userId, request.user.id));

      const [deleted] = await fastify.db
        .delete(results)
        .where(
          and(
            eq(results.id, request.params.id),
            inArray(results.monitorId, userMonitorIds),
          ),
        )
        .returning();

      if (!deleted) return reply.notFound("Result not found");
      return deleted;
    },
  );
};

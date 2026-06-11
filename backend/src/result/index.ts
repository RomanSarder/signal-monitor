import { FastifyPluginAsync } from "fastify";
import { getResultsListController } from "./get-results-list.controller";
import { getResultsStatsController } from "./get-results-stats.controller";
import { patchResultController } from "./patch-result.controller";
import { deleteResultController } from "./delete-result.controller";

export const result: FastifyPluginAsync = async (fastify) => {
  fastify.register(
    async (fastify) => {
      fastify.register(getResultsStatsController);
      fastify.register(getResultsListController);
      fastify.register(patchResultController);
      fastify.register(deleteResultController);
    },
    { prefix: "/results" },
  );
};

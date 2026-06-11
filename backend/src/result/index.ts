import { FastifyPluginAsync } from "fastify";
import { getResultsListController } from "./get-results-list.controller";

export const result: FastifyPluginAsync = async (fastify) => {
  fastify.register(
    async (fastify) => {
      fastify.register(getResultsListController);
    },
    { prefix: "/results" },
  );
};

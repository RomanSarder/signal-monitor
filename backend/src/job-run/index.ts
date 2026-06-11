import { FastifyPluginAsync } from "fastify";
import { getJobRunsListController } from "./get-job-runs-list.controller";

export const jobRun: FastifyPluginAsync = async (fastify) => {
  fastify.register(
    async (fastify) => {
      fastify.register(getJobRunsListController);
    },
    { prefix: "/job-runs" },
  );
};

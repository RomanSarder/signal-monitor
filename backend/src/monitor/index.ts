import { FastifyPluginAsync } from "fastify";
import { monitors } from "../db/schema/monitors";
import { desc } from "drizzle-orm";
import {
  CreateMonitor,
  createMonitorSchema,
  SingleMonitorParams,
  singleMonitorParamsSchema,
  SingleMonitorUpdatePayload,
  singleMonitorUpdatePayloadSchema,
} from "./schema";
import { eq } from "drizzle-orm";

export const monitor: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.register(
    async (fastify) => {
      fastify.get("", {}, async () => {
        return fastify.db
          .select()
          .from(monitors)
          .orderBy(desc(monitors.createdAt));
      });

      fastify.post<{ Body: CreateMonitor }>(
        "",
        {
          schema: {
            body: createMonitorSchema,
          },
        },
        async (request) => {
          const [newMonitor] = await fastify.db
            .insert(monitors)
            .values({
              ...request.body,
              userId: request.user.id,
            })
            .returning();

          return newMonitor;
        },
      );

      fastify.get<{ Params: SingleMonitorParams }>(
        "/:id",
        {
          schema: {
            params: singleMonitorParamsSchema,
          },
        },
        async (request, reply) => {
          const [monitor] = await fastify.db
            .select()
            .from(monitors)
            .where(eq(monitors.id, request.params.id));

          if (!monitor) {
            return reply.notFound("Monitor not found");
          }

          return monitor;
        },
      );

      fastify.patch<{
        Params: SingleMonitorParams;
        Body: SingleMonitorUpdatePayload;
      }>(
        "/:id",
        {
          schema: {
            params: singleMonitorParamsSchema,
            body: singleMonitorUpdatePayloadSchema,
          },
        },
        async (request, reply) => {
          const [updated] = await fastify.db
            .update(monitors)
            .set(request.body)
            .where(eq(monitors.id, request.params.id))
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          return updated;
        },
      );

      fastify.delete<{ Params: SingleMonitorParams }>(
        "/:id",
        {
          schema: {
            params: singleMonitorParamsSchema,
          },
        },
        async (request, reply) => {
          const [updated] = await fastify.db
            .delete(monitors)
            .where(eq(monitors.id, request.params.id))
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          return updated;
        },
      );

      fastify.post<{ Params: SingleMonitorParams }>(
        "/:id/status/pause",
        {
          schema: {
            params: singleMonitorParamsSchema,
          },
        },
        async (request, reply) => {
          const [updated] = await fastify.db
            .update(monitors)
            .set({ status: "paused" })
            .where(eq(monitors.id, request.params.id))
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          return updated;
        },
      );

      fastify.post<{ Params: SingleMonitorParams }>(
        "/:id/status/resume",
        {
          schema: {
            params: singleMonitorParamsSchema,
          },
        },
        async (request, reply) => {
          const [updated] = await fastify.db
            .update(monitors)
            .set({ status: "active" })
            .where(eq(monitors.id, request.params.id))
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          return updated;
        },
      );
    },
    { prefix: "/monitors" },
  );
};

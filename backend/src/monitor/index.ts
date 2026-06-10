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
import { and } from "drizzle-orm";

export const monitor: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  fastify.register(
    async (fastify) => {
      fastify.get("", {}, async (request) => {
        return fastify.db
          .select()
          .from(monitors)
          .where(eq(monitors.userId, request.user.id))
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

          fastify.pollQueue.upsertJobScheduler(
            newMonitor.id,
            {
              every: newMonitor.intervalMinutes * 60 * 1000,
            },
            { name: "poll-request", data: { monitorId: newMonitor.id } },
          );

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
            .where(
              and(
                eq(monitors.id, request.params.id),
                eq(monitors.userId, request.user.id),
              ),
            );

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
            .where(
              and(
                eq(monitors.id, request.params.id),
                eq(monitors.userId, request.user.id),
              ),
            )
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
            .where(
              and(
                eq(monitors.id, request.params.id),
                eq(monitors.userId, request.user.id),
              ),
            )
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          fastify.pollQueue.removeJobScheduler(updated.id);

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
            .where(
              and(
                eq(monitors.id, request.params.id),
                eq(monitors.userId, request.user.id),
              ),
            )
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          fastify.pollQueue.removeJobScheduler(updated.id);

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
            .where(
              and(
                eq(monitors.id, request.params.id),
                eq(monitors.userId, request.user.id),
              ),
            )
            .returning();

          if (!updated) {
            return reply.notFound("Monitor not found");
          }

          fastify.pollQueue.upsertJobScheduler(
            updated.id,
            {
              every: updated.intervalMinutes * 60 * 1000,
            },
            { name: "poll-request", data: { monitorId: updated.id } },
          );

          return updated;
        },
      );

      fastify.post<{ Params: SingleMonitorParams }>(
        "/:id/run",
        {
          schema: {
            params: singleMonitorParamsSchema,
          },
        },
        async (request, reply) => {
          const [monitor] = await fastify.db
            .select()
            .from(monitors)
            .where(
              and(
                eq(monitors.id, request.params.id),
                eq(monitors.userId, request.user.id),
              ),
            );

          if (!monitor) {
            return reply.notFound("Monitor not found");
          }

          await fastify.pollQueue.add("poll-request", {
            monitorId: monitor.id,
          });
        },
      );
    },
    { prefix: "/monitors" },
  );
};

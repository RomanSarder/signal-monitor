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
import { getTableColumns } from "drizzle-orm";
import { exists } from "drizzle-orm";
import { jobRuns } from "../db/schema";
import { sql } from "drizzle-orm";
import { gt } from "drizzle-orm";

export const monitor: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", fastify.authenticate);

  // select() in Drizzle always requires you to name your columns,
  // even when you don't care about them"
  const isRunning = exists(
    fastify.db.select({ one: sql`1` }).from(jobRuns).where(
      and(
        eq(jobRuns.monitorId, monitors.id),
        eq(jobRuns.status, "started"),
        // Job running longer than its own interval is almost certainly stuck.
        // 5 acts as a generous floor value here to handle extremely short intervals
        gt(jobRuns.startedAt, sql`now() - GREATEST(${monitors.intervalMinutes}, 5) * interval '1 minute'`)
      )
    )
  )

  fastify.register(
    async (fastify) => {
      fastify.get("", {}, async (request) => {
        return fastify.db
          .select({
            ...getTableColumns(monitors),
            isRunning,
          })
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

          return {
            ...newMonitor,
            isRunning: false,
          };
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
            .select({
              ...getTableColumns(monitors),
              isRunning,
            })
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

          return {
            ...updated,
            // Technically wrong here if a job happens to be running when you rename the monitor
            // but that's an edge case and the frontend would correct itself on next poll.
            isRunning: false,
          };
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

          return {
            ...updated,
            isRunning: false,
          };
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

          return {
            ...updated,
            isRunning: false,
          };
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

          return {
            ...updated,
            isRunning: false,
          };
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

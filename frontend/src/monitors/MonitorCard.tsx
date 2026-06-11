import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PauseCircle, PencilLine, PlayCircle, RefreshCw } from "lucide-react";
import type { Monitor } from "@signal-monitor/shared";
import { usePauseMonitor, useResumeMonitor, useRunMonitor } from "./queries";

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never run";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusBadge({ status }: { status: "active" | "paused" }) {
  const style =
    status === "active"
      ? "bg-green-50 text-green-500"
      : "bg-zinc-100 text-zinc-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status === "active" ? "Active" : "Paused"}
    </span>
  );
}

const actionBtn =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 disabled:opacity-40 disabled:cursor-default transition-colors";

export default function MonitorCard({ monitor }: { monitor: Monitor }) {
  const pause = usePauseMonitor();
  const resume = useResumeMonitor();
  const run = useRunMonitor();

  const [showAll, setShowAll] = useState(false);
  const extraCount = monitor.keywords.length - 2;
  const isRunBusy = monitor.isRunning || run.isPending;

  return (
    <li className="bg-white rounded-lg border border-zinc-200 px-5 py-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {monitor.isRunning && (
            <span
              className="shrink-0 h-2 w-2 rounded-full bg-amber-400 animate-pulse"
              aria-label="Running now"
            />
          )}
          <h2 className="text-sm font-semibold text-zinc-900 truncate">{monitor.name}</h2>
        </div>
        <StatusBadge status={monitor.status} />
      </div>

      {monitor.keywords.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label="Keywords">
          {(showAll ? monitor.keywords : monitor.keywords.slice(0, 2)).map((kw) => (
            <li key={kw} className="bg-zinc-100 text-zinc-600 rounded px-1.5 py-0.5 text-xs">
              {kw}
            </li>
          ))}
          {!showAll && extraCount > 0 && (
            <li className="bg-zinc-100 rounded px-1.5 py-0.5 text-xs flex items-center">
              <button
                onClick={() => setShowAll(true)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                +{extraCount} more
              </button>
            </li>
          )}
          {showAll && extraCount > 0 && (
            <li className="flex items-center">
              <button
                onClick={() => setShowAll(false)}
                className="text-zinc-400 hover:text-zinc-600 text-xs underline-offset-2 hover:underline"
              >
                Show less
              </button>
            </li>
          )}
        </ul>
      )}

      <p className="text-xs text-zinc-500">
        Last run: {formatTimeAgo(monitor.lastRunAt)}
        {" · "}
        {monitor.lastResultCount} {monitor.lastResultCount === 1 ? "result" : "results"}
      </p>

      <div className="flex items-center justify-end gap-1">
        {monitor.status === "active" ? (
          <button
            onClick={() => pause.mutate(monitor.id)}
            disabled={pause.isPending}
            className={actionBtn}
            aria-label="Pause monitor"
          >
            <PauseCircle size={14} aria-hidden="true" />
            Pause
          </button>
        ) : (
          <button
            onClick={() => resume.mutate(monitor.id)}
            disabled={resume.isPending}
            className={actionBtn}
            aria-label="Resume monitor"
          >
            <PlayCircle size={14} aria-hidden="true" />
            Resume
          </button>
        )}

        <button
          onClick={() => run.mutate(monitor.id)}
          disabled={isRunBusy}
          className={actionBtn}
          aria-label="Run monitor now"
        >
          <RefreshCw
            size={14}
            aria-hidden="true"
            className={isRunBusy ? "animate-spin" : ""}
          />
          Run now
        </button>

        <Link to="/monitors/$id" params={{ id: monitor.id }} className={actionBtn}>
          <PencilLine size={14} aria-hidden="true" />
          Edit
        </Link>
      </div>
    </li>
  );
}

export function MonitorCardSkeleton() {
  return (
    <li className="bg-white rounded-lg border border-zinc-200 px-5 py-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-40 rounded bg-zinc-100" />
        <div className="h-5 w-14 rounded-full bg-zinc-100" />
      </div>
      <div className="flex gap-1">
        <div className="h-4 w-16 rounded bg-zinc-100" />
        <div className="h-4 w-20 rounded bg-zinc-100" />
      </div>
      <div className="h-3 w-36 rounded bg-zinc-100" />
      <div className="flex justify-end gap-1">
        <div className="h-7 w-16 rounded bg-zinc-100" />
        <div className="h-7 w-16 rounded bg-zinc-100" />
        <div className="h-7 w-12 rounded bg-zinc-100" />
      </div>
    </li>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, AreaChart, Select, SelectItem } from "@tremor/react";
import { PauseCircle, PlayCircle, RefreshCw, Trash2, X } from "lucide-react";
import type { ResultStats } from "@signal-monitor/shared";
import TopNav from "../TopNav";
import {
  useMonitor,
  useUpdateMonitor,
  useDeleteMonitor,
  usePauseMonitor,
  useResumeMonitor,
  useRunMonitor,
  useMonitorStats,
  useJobRuns,
} from "./queries";

const INTERVAL_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 360, label: "6 hours" },
  { value: 1440, label: "24 hours" },
  { value: 10080, label: "7 days" },
];

const labelClass = "block text-sm font-medium text-zinc-900 mb-1.5";
const chipClass =
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-sm";
const actionBtn =
  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border border-transparent hover:border-zinc-200 disabled:opacity-40 disabled:cursor-default transition-colors";

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

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return "—";
  const ms = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const JOB_TYPE_LABEL: Record<string, string> = {
  poll: "Poll",
  score: "Score",
  digest: "Digest",
};

const STATUS_STYLE: Record<string, string> = {
  started: "bg-amber-50 text-amber-600",
  completed: "bg-green-50 text-green-600",
  completed_with_errors: "bg-orange-50 text-orange-600",
  failed: "bg-red-50 text-red-600",
};

function last14Days(byDay: ResultStats["byDay"]) {
  return byDay.slice(-14).map((d) => ({ date: d.date, count: d.count }));
}

function sum14DayTotal(byDay: ResultStats["byDay"]): number {
  return byDay.slice(-14).reduce((acc, d) => acc + d.count, 0);
}

export default function MonitorDetail() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();

  const { data: monitor, isLoading, error, refetch } = useMonitor(id);
  const update = useUpdateMonitor(id);
  const deleteMonitor = useDeleteMonitor();
  const pause = usePauseMonitor();
  const resume = useResumeMonitor();
  const run = useRunMonitor();
  const { data: stats } = useMonitorStats(id);
  const { data: jobRuns } = useJobRuns(id);

  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwInput, setKwInput] = useState("");
  const [kwError, setKwError] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      setKeywords(monitor.keywords);
      setIntervalMinutes(monitor.intervalMinutes);
    }
  }, [monitor]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const dialogRef = useRef<HTMLDialogElement>(null);

  function addKeyword(raw: string) {
    const kw = raw.replace(/,/g, "").trim();
    if (!kw || keywords.includes(kw)) return;
    setKeywords((prev) => [...prev, kw]);
    setKwError(false);
  }

  function handleKwKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword(kwInput);
      setKwInput("");
    } else if (e.key === ",") {
      e.preventDefault();
      addKeyword(kwInput);
      setKwInput("");
    }
  }

  function handleKwChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.endsWith(",")) {
      addKeyword(val);
      setKwInput("");
    } else {
      setKwInput(val);
    }
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (keywords.length === 0) {
      setKwError(true);
      return;
    }
    update.mutate(
      { name, keywords, intervalMinutes },
      {
        onSuccess: () => setShowSuccess(true),
      },
    );
  }

  function handleDeleteConfirm() {
    deleteMonitor.mutate(id, {
      onSuccess: () => navigate({ to: "/monitors" }),
    });
  }

  const isRunBusy = monitor?.isRunning || run.isPending;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <TopNav />
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-7 w-56 rounded bg-zinc-200" />
            <div className="h-9 w-48 rounded bg-zinc-200" />
            <div className="h-48 rounded-lg bg-zinc-200" />
            <div className="h-40 rounded-lg bg-zinc-200" />
          </div>
        </main>
      </div>
    );
  }

  if (error || !monitor) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50">
        <TopNav />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-sm text-zinc-500">Failed to load monitor.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const sparklineData = stats ? last14Days(stats.byDay) : [];
  const total14d = stats ? sum14DayTotal(stats.byDay) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <TopNav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {monitor.isRunning && (
              <span
                className="shrink-0 h-2 w-2 rounded-full bg-amber-400 animate-pulse"
                aria-label="Running now"
              />
            )}
            <h1 className="text-xl font-semibold text-zinc-900 break-all">{monitor.name}</h1>
            <StatusBadge status={monitor.status} />
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {monitor.status === "active" ? (
              <button
                onClick={() => pause.mutate(id)}
                disabled={pause.isPending}
                className={actionBtn}
                aria-label="Pause monitor"
              >
                <PauseCircle size={14} aria-hidden="true" />
                Pause
              </button>
            ) : (
              <button
                onClick={() => resume.mutate(id)}
                disabled={resume.isPending}
                className={actionBtn}
                aria-label="Resume monitor"
              >
                <PlayCircle size={14} aria-hidden="true" />
                Resume
              </button>
            )}

            <button
              onClick={() => run.mutate(id)}
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

            <button
              onClick={() => dialogRef.current?.showModal()}
              className={`${actionBtn} hover:text-red-600 hover:border-red-200 hover:bg-red-50`}
              aria-label="Delete monitor"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Edit monitor</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="monitor-name" className={labelClass}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="monitor-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-tremor-default border border-tremor-border bg-tremor-background px-3 py-2 text-sm text-tremor-content-strong placeholder:text-tremor-content focus:outline-none focus:ring-2 focus:ring-tremor-brand-subtle"
              />
            </div>

            <div>
              <label htmlFor="kw-input" className={labelClass}>
                Keywords <span className="text-red-500">*</span>
              </label>
              <input
                id="kw-input"
                type="text"
                value={kwInput}
                onChange={handleKwChange}
                onKeyDown={handleKwKeyDown}
                placeholder="Type a keyword and press Enter or comma"
                className="w-full rounded-tremor-default border border-tremor-border bg-tremor-background px-3 py-2 text-sm text-tremor-content-strong placeholder:text-tremor-content focus:outline-none focus:ring-2 focus:ring-tremor-brand-subtle"
                aria-describedby={kwError ? "kw-error" : undefined}
              />
              {keywords.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {keywords.map((kw) => (
                    <span key={kw} className={chipClass}>
                      {kw}
                      <button
                        type="button"
                        onClick={() => removeKeyword(kw)}
                        aria-label={`Remove keyword ${kw}`}
                        className="ml-0.5 hover:text-indigo-900"
                      >
                        <X size={12} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {kwError && (
                <p id="kw-error" role="alert" className="mt-1.5 text-sm text-red-600">
                  Add at least one keyword.
                </p>
              )}
            </div>

            <div>
              <label htmlFor="interval-select" className={labelClass}>
                Polling interval
              </label>
              <Select
                id="interval-select"
                value={String(intervalMinutes)}
                onValueChange={(v) => setIntervalMinutes(Number(v))}
              >
                {INTERVAL_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <span className={labelClass}>Source</span>
              <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-not-allowed select-none">
                <input
                  type="checkbox"
                  checked
                  disabled
                  readOnly
                  className="accent-indigo-600"
                />
                Hacker News
              </label>
            </div>

            {update.error && (
              <div role="alert" className="rounded text-sm bg-red-50 px-3 py-2 text-red-700">
                {update.error.message}
              </div>
            )}

            {showSuccess && (
              <div role="status" className="rounded text-sm bg-green-50 px-3 py-2 text-green-700">
                Monitor updated.
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={update.isPending}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Stats</h2>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Last run</p>
              <p className="text-sm font-medium text-zinc-900">{formatTimeAgo(monitor.lastRunAt)}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Last results</p>
              <p className="text-sm font-medium text-zinc-900">{monitor.lastResultCount}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">Results (14d)</p>
              <p className="text-sm font-medium text-zinc-900">{total14d}</p>
            </div>
          </div>
          {sparklineData.length > 0 ? (
            <AreaChart
              data={sparklineData}
              index="date"
              categories={["count"]}
              showLegend={false}
              showXAxis
              showYAxis={false}
              showGridLines={false}
              className="h-28"
              colors={["indigo"]}
            />
          ) : (
            <p className="text-xs text-zinc-400 text-center py-4">No data yet.</p>
          )}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Recent runs</h2>
          {!jobRuns || jobRuns.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4">No runs yet.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {jobRuns.map((jr) => (
                <li key={jr.id} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600">
                      {JOB_TYPE_LABEL[jr.jobType] ?? jr.jobType}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[jr.status] ?? "bg-zinc-100 text-zinc-600"}`}
                    >
                      {jr.status.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-zinc-500 truncate">{formatDateTime(jr.startedAt)}</span>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400 tabular-nums">
                    {formatDuration(jr.startedAt, jr.finishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>

      <dialog
        ref={dialogRef}
        className="rounded-lg border border-zinc-200 shadow-lg p-6 w-full max-w-sm backdrop:bg-black/30"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <h2 className="text-sm font-semibold text-zinc-900 mb-2">Delete monitor?</h2>
        <p className="text-sm text-zinc-500 mb-5">
          This will permanently delete the monitor and all its results. This cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-2 rounded border border-zinc-200 text-sm text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteConfirm}
            disabled={deleteMonitor.isPending}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
          >
            {deleteMonitor.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </div>
  );
}

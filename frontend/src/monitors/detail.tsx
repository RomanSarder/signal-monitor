import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Card, Select, SelectItem } from "@tremor/react";
import TopNav from "../TopNav";
import {
  useMonitor,
  useUpdateMonitor,
  useMonitorStats,
  useJobRuns,
} from "./queries";
import StatusBadge from "./StatusBadge";
import MonitorActions from "./MonitorActions";
import StatsCard from "./StatsCard";
import JobRunsCard from "./JobRunsCard";
import DeleteDialog from "./DeleteDialog";
import { useKeywords } from "./useKeywords";
import KeywordField from "./KeywordField";
import { INTERVAL_OPTIONS, labelClass } from "./constants";

export default function MonitorDetail() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();

  const { data: monitor, isLoading, error, refetch } = useMonitor(id);
  const update = useUpdateMonitor(id);
  const { data: stats } = useMonitorStats(id);
  const { data: jobRuns } = useJobRuns(id);

  const [name, setName] = useState("");
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [showSuccess, setShowSuccess] = useState(false);
  const kw = useKeywords();

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (monitor) {
      setName(monitor.name);
      kw.reset(monitor.keywords);
      setIntervalMinutes(monitor.intervalMinutes);
    }
  }, [monitor]);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [showSuccess]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (kw.keywords.length === 0) {
      kw.setKwError(true);
      return;
    }
    update.mutate(
      { name, keywords: kw.keywords, intervalMinutes },
      { onSuccess: () => setShowSuccess(true) },
    );
  }

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

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <TopNav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        <div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {monitor.isRunning && (
              <span className="shrink-0 h-2 w-2 rounded-full bg-amber-400 animate-pulse" aria-label="Running now" />
            )}
            <h1 className="text-xl font-semibold text-zinc-900 break-all">{monitor.name}</h1>
            <StatusBadge status={monitor.status} />
          </div>
          <MonitorActions
            monitorId={id}
            status={monitor.status}
            isRunning={monitor.isRunning}
            onDeleteClick={() => dialogRef.current?.showModal()}
          />
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

            <KeywordField id="kw-input" required {...kw} />

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
                <input type="checkbox" checked disabled readOnly className="accent-indigo-600" />
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

        <StatsCard monitor={monitor} stats={stats} />
        <JobRunsCard jobRuns={jobRuns} />

      </main>

      <DeleteDialog
        dialogRef={dialogRef}
        monitorId={id}
        onSuccess={() => navigate({ to: "/monitors" })}
      />
    </div>
  );
}

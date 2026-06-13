import { Card } from "@tremor/react";
import type { JobRun } from "@signal-monitor/shared";
import { formatDuration, formatDateTime } from "../utils/format";

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

export default function JobRunsCard({ jobRuns }: { jobRuns: JobRun[] | undefined }) {
  return (
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
  );
}

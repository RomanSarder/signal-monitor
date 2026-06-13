import { PauseCircle, PlayCircle, RefreshCw, Trash2 } from "lucide-react";
import { usePauseMonitor, useResumeMonitor, useRunMonitor } from "./queries";
import { actionBtn } from "./constants";

interface Props {
  monitorId: string;
  status: "active" | "paused";
  isRunning: boolean;
  onDeleteClick: () => void;
}

export default function MonitorActions({ monitorId, status, isRunning, onDeleteClick }: Props) {
  const pause = usePauseMonitor();
  const resume = useResumeMonitor();
  const run = useRunMonitor();
  const isRunBusy = isRunning || run.isPending;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {status === "active" ? (
        <button
          onClick={() => pause.mutate(monitorId)}
          disabled={pause.isPending}
          className={actionBtn}
          aria-label="Pause monitor"
        >
          <PauseCircle size={14} aria-hidden="true" />
          Pause
        </button>
      ) : (
        <button
          onClick={() => resume.mutate(monitorId)}
          disabled={resume.isPending}
          className={actionBtn}
          aria-label="Resume monitor"
        >
          <PlayCircle size={14} aria-hidden="true" />
          Resume
        </button>
      )}

      <button
        onClick={() => run.mutate(monitorId)}
        disabled={isRunBusy}
        className={actionBtn}
        aria-label="Run monitor now"
      >
        <RefreshCw size={14} aria-hidden="true" className={isRunBusy ? "animate-spin" : ""} />
        Run now
      </button>

      <button
        onClick={onDeleteClick}
        className={`${actionBtn} hover:text-red-600 hover:border-red-200 hover:bg-red-50`}
        aria-label="Delete monitor"
      >
        <Trash2 size={14} aria-hidden="true" />
        Delete
      </button>
    </div>
  );
}

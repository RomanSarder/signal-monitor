export interface JobRun {
  id: string;
  monitorId: string;
  jobType: "poll" | "score" | "digest";
  status: "started" | "completed" | "completed_with_errors" | "failed";
  startedAt: string;
  finishedAt: string | null;
}

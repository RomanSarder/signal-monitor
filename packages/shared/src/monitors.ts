export interface Monitor {
  id: string;
  userId: string;
  name: string;
  keywords: string[];
  isRunning: boolean;
  sources: string[];
  intervalMinutes: number;
  status: "active" | "paused";
  lastRunAt: string | null;
  lastResultCount: number;
  createdAt: string;
}

export interface CreateMonitor {
  name: string;
  intervalMinutes: number;
  sources: string[];
  keywords: string[];
}

export type UpdateMonitor = Partial<CreateMonitor>;

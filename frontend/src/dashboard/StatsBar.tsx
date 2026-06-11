import { Briefcase, Zap, MessageSquare, VolumeX } from "lucide-react";
import type { ResultStats } from "@signal-monitor/shared";

const STATS = [
  { key: "hiring",     label: "Hiring",     Icon: Briefcase,     color: "text-green-500"  },
  { key: "pain_point", label: "Pain point", Icon: Zap,           color: "text-violet-500" },
  { key: "discussion", label: "Discussion", Icon: MessageSquare, color: "text-amber-500"  },
  { key: "noise",      label: "Noise",      Icon: VolumeX,       color: "text-zinc-400"   },
] as const;

interface Props {
  data: ResultStats | undefined;
  isLoading: boolean;
}

export default function StatsBar({ data, isLoading }: Props) {
  const counts = Object.fromEntries(
    (data?.byCategory ?? []).map(({ category, count }) => [category, count])
  );

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-x-6 gap-y-2">
        {STATS.map(({ key, label, Icon, color }) => (
          <div key={key} className="flex items-center gap-1.5">
            <Icon size={16} strokeWidth={1.5} className={color} />
            <span className="text-sm text-zinc-500">{label}</span>
            {isLoading
              ? <span className="h-4 w-7 bg-zinc-100 rounded animate-pulse inline-block" />
              : <span className="text-sm font-semibold text-zinc-900">{counts[key] ?? 0}</span>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

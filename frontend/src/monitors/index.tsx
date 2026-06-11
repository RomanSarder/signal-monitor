import TopNav from "../TopNav";
import { useMonitors } from "./queries";
import MonitorCard, { MonitorCardSkeleton } from "./MonitorCard";
import EmptyState from "./EmptyState";

const listClass = "flex flex-col gap-4 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6";

export default function Monitors() {
  const { data: monitors, isLoading, isError, refetch } = useMonitors();

  function renderContent() {
    if (isLoading) {
      return (
        <ul className={listClass}>
          <MonitorCardSkeleton />
          <MonitorCardSkeleton />
          <MonitorCardSkeleton />
        </ul>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
          <p className="text-sm text-zinc-500">Failed to load monitors.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
          >
            Retry
          </button>
        </div>
      );
    }

    if (!monitors?.length) {
      return <EmptyState />;
    }

    return (
      <ul className={listClass}>
        {monitors.map((monitor) => (
          <MonitorCard key={monitor.id} monitor={monitor} />
        ))}
      </ul>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <TopNav />
      <main className="flex-1 flex flex-col">{renderContent()}</main>
    </div>
  );
}

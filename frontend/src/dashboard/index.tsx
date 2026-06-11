import { useMonitors, useInfiniteResults, useStats } from "./queries";
import TopNav from "../TopNav";
import { useFilters, FILTER_DEFAULTS } from "./useFilters";
import FilterBar from "./FilterBar";
import StatsBar from "./StatsBar";
import ResultCard from "./ResultCard";
import ResultSkeleton from "./ResultSkeleton";
import EmptyState from "./EmptyState";

export default function Dashboard() {
  const { data: monitors = [] } = useMonitors();
  const { filters, setCategories, setMinScore, setMonitorId, setFrom, setTo, setSort, setSavedOnly, clearFilters } =
    useFilters();
  const { data, isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteResults(filters);
  const { data: stats, isLoading: isStatsLoading } = useStats(filters);
  const allItems = data?.pages.flatMap(p => p.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  function renderFeed() {
    if (monitors.length === 0) {
      return <EmptyState variant="no-monitors" />;
    }

    if (isLoading) {
      return (
        <ul className="flex flex-col gap-4 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <ResultSkeleton />
          <ResultSkeleton />
          <ResultSkeleton />
        </ul>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
          <p className="text-sm text-zinc-500">Failed to load results.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
          >
            Retry
          </button>
        </div>
      );
    }

    if (total === 0) {
      const hasActiveFilters =
        filters.categories.length > 0 ||
        filters.minScore !== FILTER_DEFAULTS.minScore ||
        filters.monitorId !== "" ||
        filters.from !== "" ||
        filters.to !== "" ||
        filters.savedOnly;
      return hasActiveFilters
        ? <EmptyState variant="all-caught-up" onClear={clearFilters} />
        : <EmptyState variant="no-results" />;
    }

    return (
      <>
        <ul className="flex flex-col gap-4 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {allItems.map(result => (
            <ResultCard key={result.id} result={result} />
          ))}
        </ul>
        {isFetchingNextPage && (
          <ul className="flex flex-col gap-4 w-full max-w-3xl mx-auto px-4 sm:px-6 pb-4">
            <ResultSkeleton />
            <ResultSkeleton />
          </ul>
        )}
        {hasNextPage && !isFetchingNextPage && (
          <div className="flex justify-center pb-8">
            <button
              onClick={() => fetchNextPage()}
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
            >
              Load more
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <TopNav />

      <FilterBar
        filters={filters}
        monitors={monitors}
        onCategoriesChange={setCategories}
        onMinScoreChange={setMinScore}
        onMonitorIdChange={setMonitorId}
        onFromChange={setFrom}
        onToChange={setTo}
        onSortChange={setSort}
        onSavedOnlyChange={setSavedOnly}
        onClear={clearFilters}
      />

      <StatsBar data={stats} isLoading={isStatsLoading} />

      <main className="flex-1 flex flex-col">
        {renderFeed()}
      </main>
    </div>
  );
}

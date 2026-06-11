export default function ResultSkeleton() {
  return (
    <li className="bg-white rounded-lg border border-zinc-200 border-l-4 border-l-transparent px-4 py-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-6 rounded-full bg-zinc-100" />
          <div className="h-5 w-20 rounded-full bg-zinc-100" />
        </div>
        <div className="h-4 w-12 rounded bg-zinc-100" />
      </div>
      <div className="h-4 w-3/4 rounded bg-zinc-100" />
      <div className="h-4 w-1/2 rounded bg-zinc-100" />
      <div className="flex gap-1">
        <div className="h-4 w-14 rounded bg-zinc-100" />
        <div className="h-4 w-16 rounded bg-zinc-100" />
        <div className="h-4 w-12 rounded bg-zinc-100" />
      </div>
    </li>
  );
}

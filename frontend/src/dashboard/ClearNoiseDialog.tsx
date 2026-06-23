import { useClearNoise } from "./queries";

interface Props {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  monitorId: string;
  count: number;
  onSuccess: () => void;
}

export default function ClearNoiseDialog({ dialogRef, monitorId, count, onSuccess }: Props) {
  const clearNoise = useClearNoise();

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg border border-zinc-200 shadow-lg p-6 w-full max-w-sm backdrop:bg-black/30"
      onClick={(e) => {
        if (e.target === e.currentTarget) dialogRef.current?.close();
      }}
    >
      <h2 className="text-sm font-semibold text-zinc-900 mb-2">Delete all noise?</h2>
      <p className="text-sm text-zinc-500 mb-5">
        This will permanently delete {count} noise result{count === 1 ? "" : "s"}. This cannot be undone.
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
          onClick={() => clearNoise.mutate(monitorId, { onSuccess })}
          disabled={clearNoise.isPending}
          className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-50"
        >
          {clearNoise.isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </dialog>
  );
}

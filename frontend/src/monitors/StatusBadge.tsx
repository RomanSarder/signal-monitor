export default function StatusBadge({ status }: { status: "active" | "paused" }) {
  const style =
    status === "active"
      ? "bg-green-50 text-green-500"
      : "bg-zinc-100 text-zinc-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {status === "active" ? "Active" : "Paused"}
    </span>
  );
}

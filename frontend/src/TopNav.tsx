import { Link } from "@tanstack/react-router";
import { useMe, useSignOut } from "./auth/queries";

export default function TopNav() {
  const { data: me } = useMe();
  const signOut = useSignOut();

  return (
    <nav className="h-14 flex items-center justify-between gap-4 px-4 sm:px-6 bg-white border-b border-zinc-200">
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <span className="font-semibold text-zinc-900">Signal Monitor</span>
        <Link
          to="/dashboard"
          activeProps={{ className: "text-sm font-medium text-indigo-600 underline underline-offset-4" }}
          inactiveProps={{ className: "text-sm text-zinc-500 hover:text-zinc-900" }}
        >
          Dashboard
        </Link>
        <Link
          to="/monitors"
          activeProps={{ className: "text-sm font-medium text-indigo-600 underline underline-offset-4" }}
          inactiveProps={{ className: "text-sm text-zinc-500 hover:text-zinc-900" }}
        >
          Monitors
        </Link>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        {me?.email && (
          <span className="hidden sm:block text-sm text-zinc-500 truncate min-w-0">{me.email}</span>
        )}
        <button
          onClick={() =>
            signOut.mutate(undefined, {
              onSuccess: () => window.location.assign("/sign-in"),
            })
          }
          disabled={signOut.isPending}
          className="shrink-0 text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-50"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}

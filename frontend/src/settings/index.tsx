import { useState } from "react";
import { Card, Select, SelectItem } from "@tremor/react";
import TopNav from "../TopNav";
import { useMe } from "../auth/queries";
import { useChangePassword } from "./queries";
import { ApiError } from "../api";

const labelClass = "block text-sm font-medium text-zinc-900 mb-1.5";
const inputClass =
  "w-full rounded-tremor-default border border-tremor-border bg-tremor-background px-3 py-2 text-sm text-tremor-content-strong placeholder:text-tremor-content focus:outline-none focus:ring-2 focus:ring-tremor-brand-subtle";

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: `${String(i).padStart(2, "0")}:00 UTC`,
}));

export default function Settings() {
  const { data: me } = useMe();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [digestHour, setDigestHour] = useState("9");

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setConfirmError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPasswordSuccess(true);
        },
      },
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <TopNav />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <h1 className="text-lg font-semibold text-zinc-900">Settings</h1>

        {/* Account */}
        <Card>
          <h2 className="text-sm font-semibold text-zinc-900 mb-5">Account</h2>

          <div className="mb-6">
            <span className={labelClass}>Email</span>
            <p className="text-sm text-zinc-500">{me?.email ?? "—"}</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-900">Change password</h3>

            <div>
              <label htmlFor="current-password" className={labelClass}>
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="new-password" className={labelClass}>
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className={labelClass}>
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            {confirmError && (
              <p role="alert" className="rounded text-sm bg-red-50 px-3 py-2 text-red-700">
                {confirmError}
              </p>
            )}

            {changePassword.error && (
              <div role="alert" className="rounded text-sm bg-red-50 px-3 py-2 text-red-700">
                {changePassword.error instanceof ApiError
                  ? changePassword.error.message
                  : "Something went wrong. Please try again."}
              </div>
            )}

            {passwordSuccess && (
              <div role="status" className="rounded text-sm bg-green-50 px-3 py-2 text-green-700">
                Password updated.
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {changePassword.isPending ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        </Card>

        {/* Digest */}
        <Card>
          <h2 className="text-sm font-semibold text-zinc-900 mb-5">Digest</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="digest-hour" className={labelClass}>
                Digest time (UTC)
              </label>
              <Select
                id="digest-hour"
                value={digestHour}
                onValueChange={setDigestHour}
              >
                {HOURS.map((h) => (
                  <SelectItem key={h.value} value={h.value}>
                    {h.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div className="flex justify-end pt-1">
              <span title="Coming soon" className="inline-block cursor-not-allowed">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2 rounded bg-indigo-600 text-white text-sm font-medium opacity-50 pointer-events-none"
                >
                  Save preferences
                </button>
              </span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}

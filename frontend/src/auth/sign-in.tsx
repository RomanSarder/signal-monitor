import { useNavigate, Link } from "@tanstack/react-router";
import { TextInput } from "@tremor/react";
import { useSignIn } from "./queries";
import AuthPageLayout, { authSubmitBtn } from "./AuthPageLayout";

export default function SignIn() {
  const navigate = useNavigate();
  const signIn = useSignIn();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    signIn.mutate(
      { email: form.get("email") as string, password: form.get("password") as string },
      { onSuccess: () => navigate({ to: "/dashboard" }) },
    );
  }

  return (
    <AuthPageLayout
      title="Welcome back"
      subtitle="Sign in to your account."
      error={signIn.error?.message}
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            className="font-medium text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand dark:hover:text-dark-tremor-brand-emphasis"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
          >
            Email
          </label>
          <TextInput
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className="mt-2"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong"
          >
            Password
          </label>
          <TextInput
            type="password"
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            className="mt-2"
          />
        </div>
        <button type="submit" disabled={signIn.isPending} className={authSubmitBtn}>
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthPageLayout>
  );
}

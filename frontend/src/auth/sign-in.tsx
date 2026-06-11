import { useNavigate, Link } from "@tanstack/react-router";
import { Card, TextInput } from "@tremor/react";
import { useSignIn } from "./queries";

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
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-tremor-background-muted px-4 py-10 lg:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h3 className="text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Welcome back
        </h3>
        <p className="text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Sign in to your account.
        </p>
      </div>
      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {signIn.error && (
          <div role="alert" className="mb-4 rounded-tremor-default bg-red-50 px-3 py-2 text-tremor-default text-red-700">
            {signIn.error.message}
          </div>
        )}
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
          <button
            type="submit"
            disabled={signIn.isPending}
            className="mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis disabled:opacity-50 dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
          >
            {signIn.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Forgot your password?{" "}
          <a
            href="#"
            className="font-medium text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand dark:hover:text-dark-tremor-brand-emphasis"
          >
            Reset password
          </a>
        </p>
      </Card>
      <p className="mt-6 text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        Don't have an account?{" "}
        <Link
          to="/sign-up"
          className="font-medium text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand dark:hover:text-dark-tremor-brand-emphasis"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

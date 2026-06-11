import { useNavigate, Link } from "@tanstack/react-router";
import { Card, TextInput } from "@tremor/react";
import { useSignUp } from "./queries";

export default function SignUp() {
  const navigate = useNavigate();
  const signUp = useSignUp();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    signUp.mutate(
      { email: form.get("email") as string, password: form.get("password") as string },
      { onSuccess: () => navigate({ to: "/dashboard" }) },
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-tremor-background-muted px-4 py-10 lg:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h3 className="text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Create your account
        </h3>
        <p className="text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Start monitoring signals today.
        </p>
      </div>
      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {signUp.error && (
          <div className="mb-4 rounded-tremor-default bg-red-50 px-3 py-2 text-tremor-default text-red-700">
            {signUp.error.message}
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
              autoComplete="new-password"
              placeholder="Create a password"
              required
              className="mt-2"
            />
          </div>
          <button
            type="submit"
            disabled={signUp.isPending}
            className="mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis disabled:opacity-50 dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
          >
            {signUp.isPending ? "Creating account…" : "Create account"}
          </button>
        </form>
      </Card>
      <p className="mt-6 text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        Already have an account?{" "}
        <Link
          to="/sign-in"
          className="font-medium text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand dark:hover:text-dark-tremor-brand-emphasis"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

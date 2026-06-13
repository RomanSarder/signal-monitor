import { useNavigate, Link } from "@tanstack/react-router";
import { TextInput } from "@tremor/react";
import { useSignUp } from "./queries";
import AuthPageLayout, { authSubmitBtn } from "./AuthPageLayout";

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
    <AuthPageLayout
      title="Create your account"
      subtitle="Start monitoring signals today."
      error={signUp.error?.message}
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/sign-in"
            className="font-medium text-tremor-brand hover:text-tremor-brand-emphasis dark:text-dark-tremor-brand dark:hover:text-dark-tremor-brand-emphasis"
          >
            Sign in
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
            autoComplete="new-password"
            placeholder="Create a password"
            required
            className="mt-2"
          />
        </div>
        <button type="submit" disabled={signUp.isPending} className={authSubmitBtn}>
          {signUp.isPending ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthPageLayout>
  );
}

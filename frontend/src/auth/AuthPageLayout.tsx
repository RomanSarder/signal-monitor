import { Card } from "@tremor/react";

export const authSubmitBtn =
  "mt-4 w-full whitespace-nowrap rounded-tremor-default bg-tremor-brand py-2 text-center text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis disabled:opacity-50 dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis";

interface Props {
  title: string;
  subtitle: string;
  error?: string | null;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthPageLayout({ title, subtitle, error, footer, children }: Props) {
  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center bg-tremor-background-muted px-4 py-10 lg:px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h3 className="text-center text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          {title}
        </h3>
        <p className="text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          {subtitle}
        </p>
      </div>
      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {error && (
          <div role="alert" className="mb-4 rounded-tremor-default bg-red-50 px-3 py-2 text-tremor-default text-red-700">
            {error}
          </div>
        )}
        {children}
      </Card>
      <p className="mt-6 text-center text-tremor-default text-tremor-content dark:text-dark-tremor-content">
        {footer}
      </p>
    </div>
  );
}

import { Link, useLocation, useRouteError } from "react-router-dom";

import { useDocumentTitle } from "~/hooks";
import { AppRoutes } from "~/routes";

import { Page } from "../Layout";
import { Button } from "../ui";

export function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);
  //TODO: log error

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-foreground">Oops</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-secondary-foreground sm:text-5xl">
          Something went boom
        </h1>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link to={AppRoutes.Root} reloadDocument>
              Go to homepage
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export function PageErrorBoundary() {
  useDocumentTitle("DevNote | Oops");

  const location = useLocation();

  const error = useRouteError();
  console.error(error);
  //TODO: log error

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Oops</Page.Title>

        <section className="flex flex-col items-start gap-4">
          <header>
            <h2 className="text-lg font-semibold md:text-xl">
              Something went boom
            </h2>
            <p className="text-muted-foreground">
              We will investigate the case and fix it soon
            </p>
          </header>
          <Button asChild>
            <Link to={location} reloadDocument>
              Reload page
            </Link>
          </Button>
        </section>
      </Page.Content>
    </Page.Card>
  );
}

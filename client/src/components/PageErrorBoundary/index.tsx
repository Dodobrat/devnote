import { type ErrorComponentProps, Link } from "@tanstack/react-router";

import { Page } from "../Page";
import { Button } from "../ui/button";

export function PageErrorBoundary(props: ErrorComponentProps) {
  console.log(props.error);
  //TODO: log error

  return (
    <>
      <Page.Header title="Oops" />
      <Page>
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
            <Link to="." reloadDocument>
              Reload page
            </Link>
          </Button>
        </section>
      </Page>
    </>
  );
}

import { Link } from "react-router-dom";

import { Page } from "~/components/Layout";
import { Button } from "~/components/ui";
import { useDocumentTitle } from "~/hooks";
import { AppRoutes } from "~/routes";

export function NotFound() {
  useDocumentTitle("DevNote | Not Found");

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Not Found</Page.Title>

        <section className="flex flex-col items-start gap-2">
          <header>
            <h2 className="text-lg font-semibold md:text-xl">
              The page you are looking for does not exist
            </h2>
            <p className="text-muted-foreground">
              Please check the URL or go back to the homepage
            </p>
          </header>
          <Button asChild>
            <Link to={AppRoutes.Root}>Go to homepage</Link>
          </Button>
        </section>
      </Page.Content>
    </Page.Card>
  );
}

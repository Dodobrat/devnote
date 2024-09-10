import { Link } from "react-router-dom";

import { PageCard } from "~/components/Layout";
import { Button } from "~/components/ui";
import { AppRoutes } from "~/routes";

export function NotFound() {
  return (
    <PageCard>
      <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
        <h1 className="mb-8 text-2xl md:text-4xl lg:text-6xl">Not Found</h1>

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
      </div>
    </PageCard>
  );
}

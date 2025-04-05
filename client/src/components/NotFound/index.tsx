import { Link } from "@tanstack/react-router";

import { Page } from "../Page";
import { Button } from "../ui/button";

export function NotFound() {
  return (
    <>
      <Page.Header title="Not Found" />
      <Page>
        <section className="flex flex-col items-start gap-4">
          <header>
            <h2 className="text-lg font-semibold md:text-xl">
              The page you are looking for does not exist
            </h2>
            <p className="text-muted-foreground">
              Please check the URL or go back to the homepage
            </p>
          </header>
          <Button asChild>
            <Link to="/note/new">Create new note</Link>
          </Button>
        </section>
      </Page>
    </>
  );
}

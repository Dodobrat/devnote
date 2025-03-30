import { cn } from "~/lib/utils";

function PageBase({ children }: React.PropsWithChildren) {
  return <div className={cn("")}>{children}</div>;
}

function PageTitle({ children }: React.PropsWithChildren) {
  return <h1 className="mb-8 text-4xl lg:text-6xl">{children}</h1>;
}

function PageSection({
  title,
  description,
  children,
}: React.PropsWithChildren<{ title: string; description?: string }>) {
  return (
    <section className="flex flex-col items-start gap-2">
      <header>
        <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  );
}

export const Page = Object.assign(PageBase, {
  // Card: PageCard,
  // Content: PageContent,
  Title: PageTitle,
  Section: PageSection,
});

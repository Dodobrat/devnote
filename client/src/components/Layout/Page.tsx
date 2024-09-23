import { motion, Variants } from "framer-motion";

import { cn } from "~/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, scale: 1, x: 100 },
  enter: { opacity: 1, scale: 1, x: 0 },
  exit: { opacity: 0, scale: 0.9, x: 100 },
};

function PageCardBase({ children }: React.PropsWithChildren) {
  return (
    <motion.main
      className="isolate grow overflow-hidden md:p-4"
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.main>
  );
}

function PageCard({ children }: React.PropsWithChildren) {
  return (
    <PageCardBase>
      <div className="h-full w-full overflow-hidden bg-card md:rounded-lg md:border">
        {children}
      </div>
    </PageCardBase>
  );
}

function PageContent({ children }: React.PropsWithChildren) {
  return (
    <div
      className={cn(
        "h-full overflow-auto p-4 md:p-6 lg:p-8",
        "pb-safe-offset-16",
      )}
    >
      {children}
    </div>
  );
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

export const Page = Object.assign(PageCardBase, {
  Card: PageCard,
  Content: PageContent,
  Title: PageTitle,
  Section: PageSection,
});

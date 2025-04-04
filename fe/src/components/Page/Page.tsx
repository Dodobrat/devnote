import { useRouterState } from "@tanstack/react-router";

import { useEditorAutosave, useEditorContainedWidth } from "~/hooks/store";
import { cn } from "~/lib/utils";

import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";

function PageBase({ children }: React.PropsWithChildren) {
  const [isContainedWidth] = useEditorContainedWidth();

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-full p-4 transition-[max-width]",
        isContainedWidth && "max-w-prose",
      )}
    >
      {children}
    </div>
  );
}

function PageHeader({ title }: { title?: string }) {
  return (
    <header className="bg-background sticky top-0 z-40 mx-4 flex h-16 shrink-0 items-center gap-2">
      <SidebarTrigger variant="outline" />
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-6"
      />
      <div className="grid grow items-center">
        {Boolean(title) && (
          <p className="truncate text-3xl leading-tight font-extrabold">
            {title}
          </p>
        )}
      </div>
    </header>
  );
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

function PageEditorHeader({
  children,
  title,
}: React.PropsWithChildren<{ title?: string }>) {
  const routerState = useRouterState();
  const isNewNote = routerState.location.pathname.startsWith("/note/new");
  const isWelcomeNote =
    routerState.location.pathname.startsWith("/note/welcome");
  const isUserNote = !isNewNote && !isWelcomeNote;

  const [autoSaveEnabled] = useEditorAutosave();

  return (
    <header className="bg-background sticky top-0 z-40 mx-4 flex h-16 shrink-0 items-center gap-2 overflow-hidden">
      <SidebarTrigger variant="outline" />
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-6"
      />
      <div className="grid grow grid-cols-[1fr_auto] items-center">
        <div className="grid">
          <p className="truncate text-lg leading-tight font-extrabold">
            {title || "Untitled Note"}
          </p>
          {isNewNote && (
            <small className="text-muted-foreground truncate leading-tight">
              Autosave is disabled while creating a note
            </small>
          )}
          {isWelcomeNote && (
            <small className="text-muted-foreground truncate leading-tight">
              Autosave is disabled while editing welcome note
            </small>
          )}
          {isUserNote && (
            <small className="text-muted-foreground truncate leading-tight">
              Autosave is {autoSaveEnabled ? "enabled" : "disabled"}
            </small>
          )}
        </div>
        {children}
      </div>
    </header>
  );
}

export const Page = Object.assign(PageBase, {
  Header: PageHeader,
  // Title: PageTitle,
  Section: PageSection,
  EditorHeader: PageEditorHeader,
});

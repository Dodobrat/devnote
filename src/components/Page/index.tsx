import { useRouterState } from "@tanstack/react-router";

import { useDocumentTitle } from "~/hooks";
import {
  useEditorAutosaveAtom,
  useEditorContainedWidthAtom,
} from "~/hooks/store";
import { cn } from "~/lib/utils";

import { Separator, Sidebar, Tooltip } from "../ui";

function PageBase({ children }: React.PropsWithChildren) {
  const [isContainedWidth] = useEditorContainedWidthAtom();

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
  useDocumentTitle(title || "Hello?");

  return (
    <header className="bg-background top-safe-offset-0 sticky-header-mask sticky z-40 mx-4 flex h-16 shrink-0 items-center gap-2">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Sidebar.Trigger variant="outline" />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Toggle sidebar</p>
        </Tooltip.Content>
      </Tooltip>
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

function PageEditorHeader({
  children,
  title,
}: React.PropsWithChildren<{ title?: string }>) {
  const routerState = useRouterState();
  const isNewNote = routerState.location.pathname.startsWith("/note/new");
  const isWelcomeNote =
    routerState.location.pathname.startsWith("/note/welcome");
  const isUserNote = !isNewNote && !isWelcomeNote;

  const [autoSaveEnabled] = useEditorAutosaveAtom();

  const resolvedTitle = title || "Untitled Note";
  useDocumentTitle(resolvedTitle);

  return (
    <header className="bg-background top-safe-offset-0 sticky-header-mask sticky z-40 mx-4 flex h-16 shrink-0 items-center gap-2">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Sidebar.Trigger variant="outline" />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Toggle sidebar</p>
        </Tooltip.Content>
      </Tooltip>
      <Separator
        orientation="vertical"
        className="data-[orientation=vertical]:h-6"
      />
      <div className="grid grow grid-cols-[1fr_auto] items-center">
        <div className="grid overflow-hidden">
          <p className="truncate text-lg leading-tight font-extrabold">
            {resolvedTitle}
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
  Header: PageHeader,
  Section: PageSection,
  EditorHeader: PageEditorHeader,
});

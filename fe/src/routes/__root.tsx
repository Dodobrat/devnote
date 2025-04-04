import { useEffect, useRef, useState } from "react";
import { InView } from "react-intersection-observer";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  type QueryClient,
  useQuery,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import {
  GitMergeIcon,
  HandIcon,
  MessageCircleQuestionIcon,
  PlusIcon,
  SearchIcon,
  TerminalIcon,
  WrenchIcon,
} from "lucide-react";

import { NoteActions, NotePinAction } from "~/blocks";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { ThemeProvider } from "~/context";
import {
  pinnedNotesQueryOptions,
  searchNotesQueryOptions,
  unPinnedNotesQueryOptions,
  useReorderPinnedNotes,
  useReorderUnpinnedNotes,
} from "~/hooks/query";
import { cn } from "~/lib/utils";
import { type NoteSchemaType } from "~/types/notes";

// ORDERED BY PRIORITY
// TODO: different link component depending on external link or internal
// TODO: fix crop of focused buttons in page header
// TODO: verify infinite scroll functionality ( add mocked delay )
// TODO: command palette + keyboard shortcuts
// TODO: show note character count
// TODO: somehow reset preview size
// TODO: offline / online toast
// TODO: sidebar skip to content hidden link
// TODO: tooltips everywhere
// TODO: translations
// TODO: PWA correct spacing
// TODO: general styling of the whole app to be more vibrant / coder like. Maybe add some custom fonts

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    loader: async ({ context: { queryClient } }) => {
      const pinnedNotes = await queryClient.ensureInfiniteQueryData(
        pinnedNotesQueryOptions(),
      );
      const unPinnedNotes = await queryClient.ensureInfiniteQueryData(
        unPinnedNotesQueryOptions(),
      );
      return { pinnedNotes, unPinnedNotes };
    },
  },
);

function RootComponent() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      <Toaster />

      {/* DEV TOOLS */}
      {/* <ReactQueryDevtools buttonPosition="bottom-left" /> */}
      {/* <TanStackRouterDevtools position="bottom-left" /> */}
    </ThemeProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar
      variant="floating"
      // collapsible="icon"
    >
      <SidebarHeader>
        <LogoAction />
        {/* TODO: install pwa button */}
      </SidebarHeader>
      <SidebarContent>
        <AppLinks />
        <SidebarSeparator className="mx-0" />
        <NotesContent />
      </SidebarContent>
      <SidebarRail />
      <NavigationSidebarToggler />
    </Sidebar>
  );
}

function NavigationSidebarToggler() {
  const routerState = useRouterState();
  const pathRef = useRef(routerState.location.pathname);
  const path = routerState.location.pathname;

  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const currentPath = pathRef.current;
    if (currentPath !== path) {
      setOpenMobile(false);
    }
  }, [path, setOpenMobile]);

  return null;
}

function LogoAction() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex gap-2">
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer"
          tooltip="Command palette"
          // onClick={() => setCommandPaletteOpenState(true)}
          onClick={() => console.log("CLICKED SIDEBAR LOGO")}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
            <TerminalIcon aria-hidden className="size-4 stroke-3" />
          </div>
          <div className="grid flex-1 text-left text-2xl leading-tight">
            <span className="truncate font-bold">DevNote</span>
          </div>
        </SidebarMenuButton>
        <Button asChild variant="ghost" className="size-12">
          {/* "https://github.com/Dodobrat/devnote" */}
          <a href="https://github.com/Dodobrat" target="_blank">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
            >
              <title>GitHub</title>
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            <span className="sr-only">GitHub Repository</span>
          </a>
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AppLinks() {
  const routerState = useRouterState();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={routerState.location.pathname.includes("/note/new")}
              tooltip="Create new note"
            >
              <Link to="/note/new">
                <PlusIcon />
                <span>Create new note</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={routerState.location.pathname.includes("/app/help")}
              tooltip="Help"
            >
              <Link to="/app/help">
                <MessageCircleQuestionIcon />
                Help
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={routerState.location.pathname.includes(
                "/app/changelog",
              )}
              tooltip="Changelog"
            >
              <Link to="/app/changelog">
                <GitMergeIcon />
                Changelog
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={routerState.location.pathname.includes("/app/settings")}
              tooltip="Changelog"
            >
              <Link to="/app/settings">
                <WrenchIcon />
                Settings
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NotesContent() {
  const pinnedNotesQuery = useSuspenseInfiniteQuery(pinnedNotesQueryOptions());
  const unPinnedNotesQuery = useSuspenseInfiniteQuery(
    unPinnedNotesQueryOptions(),
  );

  const [query, setQuery] = useState("");

  const searchedNotesQuery = useQuery(searchNotesQueryOptions({ query }));

  return (
    <>
      <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Notes</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="relative">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <SidebarInput
              id="search"
              placeholder="Search notes"
              className="pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {Boolean(query) && (
        <>
          {!searchedNotesQuery.isFetching &&
            !searchedNotesQuery.data?.length && (
              <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarGroupContent>
                  <SidebarGroupLabel>No notes found</SidebarGroupLabel>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

          {Boolean(searchedNotesQuery.data?.length) && (
            <NotesList
              type="search"
              notes={searchedNotesQuery.data!}
              disableReorder
            />
          )}
        </>
      )}

      {!query && (
        <>
          <NotesList type="pinned" notes={pinnedNotesQuery.data} />

          {pinnedNotesQuery.hasNextPage && !pinnedNotesQuery.isFetching && (
            <InView
              onChange={(isInView) =>
                isInView && pinnedNotesQuery.fetchNextPage()
              }
            >
              Loading more...
            </InView>
          )}

          <NotesList type="unpinned" notes={unPinnedNotesQuery.data} />

          {unPinnedNotesQuery.hasNextPage && !unPinnedNotesQuery.isFetching && (
            <InView
              onChange={(isInView) =>
                isInView && unPinnedNotesQuery.fetchNextPage()
              }
            >
              Loading more...
            </InView>
          )}
        </>
      )}
    </>
  );
}

function NotesList({
  type,
  notes,
  disableReorder,
}: {
  type: "pinned" | "unpinned" | "search";
  notes: NoteSchemaType[];
  disableReorder?: boolean;
}) {
  const [items, setItems] = useState(notes);
  const [activeNote, setActiveNote] = useState<NoteSchemaType | null>(null);

  const reorderPinnedMutation = useReorderPinnedNotes();
  const reorderUnpinnedMutation = useReorderUnpinnedNotes();

  useEffect(() => {
    setItems(notes);
  }, [notes]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    // TODO: fix keyboard accessibility
    // useSensor(KeyboardSensor, {
    //   coordinateGetter: sortableKeyboardCoordinates,
    // }),
  );

  if (!items.length) return null;

  const onDragStart = (event: DragStartEvent) => {
    const activeQuestion = items.find((n) => n.id === event.active.id);
    setActiveNote(activeQuestion || null);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveNote(null);

    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((v) => v.id === active.id);
        const newIndex = prev.findIndex((v) => v.id === over?.id);
        const updatedNotesOrder = arrayMove(prev, oldIndex, newIndex);
        if (type === "pinned") {
          reorderPinnedMutation.mutate(updatedNotesOrder.map((n) => n.id));
        }
        if (type === "unpinned") {
          reorderUnpinnedMutation.mutate(updatedNotesOrder.map((n) => n.id));
        }
        return updatedNotesOrder;
      });
    }
  };

  const getNoteLabel = () => {
    if (type === "pinned") return "Pinned Notes";
    if (type === "unpinned") return "Unpinned Notes";
    if (type === "search") return "Search result";
    return "Other";
  };

  const isDisabledReorder = disableReorder || items.length < 2;

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupContent>
        <SidebarGroupLabel>{getNoteLabel()}</SidebarGroupLabel>
        <SidebarMenu>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={items.map((n) => n.id)}
              strategy={verticalListSortingStrategy}
              disabled={isDisabledReorder}
            >
              {items.map((note) => (
                <DraggableNoteItem
                  key={note.id}
                  note={note}
                  isDisabledReorder={isDisabledReorder}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeNote ? <NoteItem note={activeNote} isOverlay /> : null}
            </DragOverlay>
          </DndContext>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function DraggableNoteItem({
  note,
  isDisabledReorder,
}: {
  note: NoteSchemaType;
  isDisabledReorder: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    touchAction: "none", // for mobile devices
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      // do not allow keyboard focus
      tabIndex={-1}
    >
      <NoteItem
        note={note}
        listeners={listeners}
        isDragged={isDragging}
        isDisabledReorder={isDisabledReorder}
      />
    </div>
  );
}

function NoteItem({
  note,
  listeners,
  isDragged,
  isOverlay,
  isDisabledReorder,
}: {
  note: NoteSchemaType;
  listeners?: ReturnType<typeof useSortable>["listeners"];
  isDragged?: boolean;
  isOverlay?: boolean;
  isDisabledReorder?: boolean;
}) {
  const { isMobile } = useSidebar();

  const routerState = useRouterState();
  const isNotePage = routerState.location.pathname.startsWith(
    `/note/${note.id}`,
  );

  return (
    <SidebarMenuItem
      key={note.id}
      className={cn(
        "border-border bg-card grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto_auto] gap-1 rounded-md border p-2",
        isNotePage && "ring-offset-sidebar ring-primary ring ring-offset-2",
        isOverlay && "cursor-grabbing *:pointer-events-none",
        isDragged && "bg-secondary ring-0 ring-offset-0 *:opacity-0",
      )}
    >
      <Button
        size="icon"
        variant={isDisabledReorder ? "secondary" : "ghost"}
        className="cursor-grab"
        {...listeners}
        disabled={isDisabledReorder}
      >
        <HandIcon />
        <span className="sr-only">Reorder</span>
      </Button>

      <NotePinAction note={note} />

      <NoteActions
        note={note}
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      />

      <Separator className="col-span-full" />

      <Button
        asChild
        variant="ghost"
        className="col-span-full inline-grid h-auto justify-start gap-0 overflow-hidden px-2 whitespace-normal"
      >
        <Link to="/note/$noteId" params={{ noteId: note.id }}>
          <p className="truncate text-lg font-semibold">{note.title}</p>
          <p className="text-muted-foreground line-clamp-2 break-words">
            {note.note}
          </p>
        </Link>
      </Button>
    </SidebarMenuItem>
  );
}

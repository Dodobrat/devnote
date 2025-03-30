import { useEffect, useState } from "react";
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
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  ArrowUpRightIcon,
  EllipsisVerticalIcon,
  FilePlus2Icon,
  GitMergeIcon,
  HandIcon,
  LaptopMinimalIcon,
  LinkIcon,
  MessageCircleQuestionIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  SunIcon,
  TerminalIcon,
  Trash2Icon,
  WrenchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { DrawerDialog } from "~/components";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  SidebarTrigger,
  useSidebar,
} from "~/components/ui/sidebar";
import {
  ThemeMode,
  type ThemeModeKey,
  ThemeProvider,
  useTheme,
} from "~/context";
import {
  pinnedNotesQueryOptions,
  searchNotesQueryOptions,
  unPinnedNotesQueryOptions,
  usePinNote,
  useReorderPinnedNotes,
  useReorderUnpinnedNotes,
  useUnpinNote,
  useUpdateNote,
} from "~/hooks/query";
import { cn } from "~/lib/utils";
import { type NoteSchemaType } from "~/types/notes";

// TODO: close sidebar on navigation

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    loader: async ({ context: { queryClient } }) => {
      const pinnedNotes = await queryClient.ensureInfiniteQueryData(
        pinnedNotesQueryOptions(),
      );
      const unPinnedNotes = queryClient.ensureInfiniteQueryData(
        unPinnedNotesQueryOptions(),
      );
      return { pinnedNotes, unPinnedNotes };
    },
    notFoundComponent: () => {
      return (
        <div>
          <p>This is the notFoundComponent configured on root route</p>
          <Link to="/">Start Over</Link>
        </div>
      );
    },
  },
);

function RootComponent() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SidebarTrigger />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      {/* DEV TOOLS */}
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </ThemeProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <LogoAction />
        {/* TODO: install pwa button */}
        <CreateNewNoteLink />
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <NotesContent />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <MorePagesDropdownMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function LogoAction() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex gap-2">
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer"
          tooltip="Command palette" // TODO: translate
          // onClick={() => setCommandPaletteOpenState(true)} // TODO: add interactivity
          onClick={() => console.log("CLICKED SIDEBAR LOGO")} // TODO: remove
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
            <TerminalIcon aria-hidden className="size-4 stroke-3" />
          </div>
          <div className="grid flex-1 text-left text-2xl leading-tight">
            <span className="truncate font-bold">DevNote</span>
          </div>
        </SidebarMenuButton>
        <ThemeSwitchMinimal />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function ThemeSwitchMinimal() {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="size-12 group-data-[collapsible=icon]:hidden"
      >
        <Button variant="outline">
          {theme === ThemeMode.Light && <SunIcon />}
          {theme === ThemeMode.Dark && <MoonIcon />}
          {theme === ThemeMode.System && <LaptopMinimalIcon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
      >
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as ThemeModeKey)}
        >
          <DropdownMenuRadioItem value={ThemeMode.Light}>
            <SunIcon />
            Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={ThemeMode.Dark}>
            <MoonIcon />
            Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={ThemeMode.System}>
            <LaptopMinimalIcon />
            System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreateNewNoteLink() {
  return (
    <SidebarMenuButton asChild tooltip="Create new note">
      <Link to="/note/new">
        <FilePlus2Icon />
        <span>Create new note</span>
      </Link>
    </SidebarMenuButton>
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
      <SidebarGroup className="pb-0 group-data-[collapsible=icon]:hidden">
        <SidebarGroupContent>
          <div className="relative">
            <label htmlFor="search" className="sr-only">
              Search
            </label>
            <SidebarInput
              id="search"
              placeholder="Search notes" // TODO: translate
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
    if (type === "unpinned") return "Notes";
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
  return (
    <SidebarMenuItem
      key={note.id}
      className={cn(
        "border-border bg-card grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto_auto] gap-1 rounded-md border p-2",
        isDragged && "bg-secondary *:opacity-0",
        isOverlay && "cursor-grabbing *:pointer-events-none",
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

      <NoteActions note={note} />

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

function NotePinAction({ note }: { note: NoteSchemaType }) {
  const pinMutation = usePinNote();
  const unpinMutation = useUnpinNote();

  if (note.isPinned) {
    return (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => unpinMutation.mutate(note.id)}
      >
        <PinOffIcon />
        <span className="sr-only">Unpin</span>
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => pinMutation.mutate(note.id)}
    >
      <PinIcon />
      <span className="sr-only">Pin</span>
    </Button>
  );
}

function NoteActions({ note }: { note: NoteSchemaType }) {
  const { isMobile } = useSidebar();
  const [targetAction, setTargetAction] = useState<"edit" | "delete" | null>(
    null,
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <EllipsisVerticalIcon />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem onClick={() => setTargetAction("edit")}>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* TODO: delete with confirmation */}
          <DropdownMenuItem>
            <Trash2Icon className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NoteEditTitle
        note={note}
        open={targetAction === "edit"}
        onClose={() => setTargetAction(null)}
      />
    </>
  );
}

function NoteEditTitle({
  note,
  open,
  onClose,
}: {
  note: NoteSchemaType;
  open: boolean;
  onClose: () => void;
}) {
  const updateMutation = useUpdateNote();
  const [title, setTitle] = useState(note.title);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    updateMutation.mutate(
      { ...note, title },
      {
        onSuccess: () => {
          toast.success("Note title updated");
          onClose();
        },
      },
    );
  };

  return (
    <DrawerDialog title="Edit Title" open={open} setOpen={() => onClose()}>
      <form onSubmit={onSubmit}>
        <label htmlFor="noteTitle">Title</label>
        <Input
          id="noteTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button>Update</Button>
      </form>
    </DrawerDialog>
  );
}

function MorePagesDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton tooltip="More pages">
          <span className="group-data-[collapsible=icon]:hidden">More</span>
          <MoreHorizontalIcon className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-popper-anchor-width)"
        side="top"
        align="start"
      >
        <DropdownMenuItem asChild>
          <Link to="/app/help">
            <MessageCircleQuestionIcon />
            Help
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/changelog">
            <GitMergeIcon />
            Changelog
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/settings">
            <WrenchIcon />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

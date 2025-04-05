import { useCallback, useEffect, useState } from "react";
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
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  CalendarClockIcon,
  CalendarSyncIcon,
  EllipsisVerticalIcon,
  HandIcon,
  LinkIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { type ZodError } from "zod";

import {
  ResponsiveConfirmation,
  ResponsiveDialog,
} from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import { CommandShortcutSnippet } from "~/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { openCommandPaletteBrowserShortcut } from "~/constants/shortcuts";
import {
  pinnedNotesQueryOptions,
  searchNotesQueryOptions,
  unPinnedNotesQueryOptions,
  useDeleteNote,
  usePinNote,
  useReorderPinnedNotes,
  useReorderUnpinnedNotes,
  useUnpinNote,
  useUpdateNote,
} from "~/hooks/query";
import { cn, getPrettyDate } from "~/lib/utils";
import { type NoteSchemaType, titleSchema } from "~/types/notes";

export function Notes() {
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
              className="pr-21 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
            <CommandShortcutSnippet className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 select-none">
              {openCommandPaletteBrowserShortcut}
            </CommandShortcutSnippet>
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

export function NotePinAction({ note }: { note: NoteSchemaType }) {
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

export function NoteActions({
  note,
  side,
  align,
}: {
  note: NoteSchemaType;
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"];
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
}) {
  const deleteNoteMutation = useDeleteNote();

  const [editTitleDialog, setEditTitleDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <EllipsisVerticalIcon />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={side} align={align} className="min-w-56">
          <div className="flex flex-col text-sm">
            <div className="space-y-0.5 p-2">
              <p className="text-muted-foreground flex items-center gap-2 leading-tight">
                <CalendarClockIcon className="size-4" />
                <span>Created at</span>
              </p>
              <p className="leading-tight">{getPrettyDate(note.createdAt)}</p>
            </div>
            {note.updatedAt && (
              <div className="space-y-0.5 p-2">
                <p className="text-muted-foreground flex items-center gap-2 leading-tight">
                  <CalendarSyncIcon className="size-4" />
                  <span>Updated at</span>
                </p>
                <p className="leading-tight">{getPrettyDate(note.updatedAt)}</p>
              </div>
            )}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditTitleDialog(true)}>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const fullNoteUrl = new URL(
                `/note/${note.id}`,
                window.location.origin,
              ).toString();

              window.navigator.clipboard
                .writeText(fullNoteUrl)
                .then(() => toast.success("Link copied to clipboard"))
                .catch(() => toast.error("Failed to copy link"));
            }}
          >
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open(
                new URL(`/note/${note.id}`, window.location.origin),
                "_blank",
              );
            }}
          >
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteConfirmDialog(true)}>
            <Trash2Icon className="text-destructive-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResponsiveDialog
        labels={{
          title: "Update note title",
          desc: "Edit the title of your note so you can find it faster later.",
          cancel: "Cancel",
        }}
        open={editTitleDialog}
        onOpenChange={setEditTitleDialog}
      >
        <NoteEditTitleForm
          note={note}
          onSuccess={() => setEditTitleDialog(false)}
        />
      </ResponsiveDialog>

      <ResponsiveConfirmation
        open={deleteConfirmDialog}
        onOpenChange={setDeleteConfirmDialog}
        onContinue={() => deleteNoteMutation.mutate(note.id)}
        labels={{
          title: "Are you absolutely sure?",
          desc: "This action cannot be undone. This will permanently delete your note.",
          cancel: "Cancel",
          continue: "Continue",
        }}
      />
    </>
  );
}

function NoteEditTitleForm({
  note,
  onSuccess,
}: {
  note: NoteSchemaType;
  onSuccess?: () => void;
}) {
  const updateNoteMutation = useUpdateNote();

  const [title, setTitle] = useState(note.title);
  const [error, setError] = useState<ZodError<string> | null>(null);

  const validate = useCallback((titleValue: string) => {
    const result = titleSchema.safeParse(titleValue);
    if (!result.success) return setError(result.error);
    return setError(null);
  }, []);

  return (
    <form
      className={cn("flex flex-col gap-4", "px-4 md:px-0")}
      onSubmit={(e) => {
        e.preventDefault();

        if (error) return;

        updateNoteMutation.mutate(
          { id: note.id, title: title },
          {
            onSuccess: () => {
              toast.success("Note title updated");
              onSuccess?.();
            },
            onError: () => toast.error("Failed to update note title"),
          },
        );
      }}
    >
      <Input
        value={title}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          validate(v);
        }}
        placeholder="Enter a note title"
      />
      {Boolean(error) && (
        <small className="text-destructive -mt-2 block text-xs font-bold">
          {error!.issues[0].message}
        </small>
      )}
      <Button className="md:self-end" type="submit">
        Update
      </Button>
    </form>
  );
}

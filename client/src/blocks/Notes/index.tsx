import { useCallback, useEffect, useRef, useState } from "react";
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
import { CSS } from "@dnd-kit/utilities";
import {
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRightIcon,
  CalendarClockIcon,
  CalendarSyncIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FileDigitIcon,
  HandIcon,
  LinkIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  StickyNoteIcon,
  Trash2Icon,
  UploadIcon,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { openCommandPaletteBrowserShortcut } from "~/constants/shortcuts";
import {
  notesQueryKeys,
  pinnedNotesQueryOptions,
  searchNotesQueryOptions,
  unPinnedNotesQueryOptions,
  useCreateNote,
  useDeleteNote,
  usePinNote,
  useReorderPinnedNotes,
  useReorderUnpinnedNotes,
  useUnpinNote,
  useUpdateNote,
} from "~/hooks/query";
import { cn } from "~/lib/utils";
import { type NoteSchemaType, titleSchema } from "~/types/notes";

export function Notes() {
  const pinnedNotesQuery = useSuspenseInfiniteQuery(pinnedNotesQueryOptions());
  const unPinnedNotesQuery = useSuspenseInfiniteQuery(
    unPinnedNotesQueryOptions(),
  );

  const [query, setQuery] = useState("");

  const searchedNotesQuery = useQuery(searchNotesQueryOptions({ query }));

  const hasNoNotesYet =
    pinnedNotesQuery.data.length + unPinnedNotesQuery.data.length === 0;

  return (
    <>
      <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Notes</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex items-center gap-2">
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

            <NotesUpload />
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

      {!query && hasNoNotesYet && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <SidebarGroupLabel>No notes</SidebarGroupLabel>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}

type UploadedNote = {
  filename: string;
  note: string;
};

function NotesUpload() {
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNote();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileUploadStack, setFileUploadStack] = useState<UploadedNote[]>([]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const note = `<!-- ${file.name} -->

${event.target?.result as string}`;

        setFileUploadStack((v) => [...v, { note, filename: file.name }]);
      };

      reader.readAsText(file);
    });
  };

  const createUploadedNotes = () => {
    const promises = fileUploadStack.map((x) =>
      createNoteMutation.mutateAsync({ note: x.note }),
    );

    Promise.allSettled(promises)
      .then((results) => {
        const failed = results.filter((p) => p.status === "rejected");
        if (failed.length) {
          toast.error(`${failed.length} notes failed to upload`);
        }

        const success = results.filter((p) => p.status === "fulfilled");
        if (success.length) {
          toast.success(`${success.length} notes uploaded`);
        }
      })
      .finally(() => {
        queryClient.refetchQueries({
          queryKey: notesQueryKeys.unpinnedList(),
        });

        setFileUploadStack([]);
      });
  };

  const isMultipleUploaded = fileUploadStack.length > 1;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon />
            <span className="sr-only">Upload .md files</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload .md files</p>
        </TooltipContent>
      </Tooltip>

      <input
        type="file"
        accept=".md"
        multiple
        onChange={onChange}
        className="sr-only"
        ref={fileInputRef}
      />

      <ResponsiveDialog
        open={Boolean(fileUploadStack.length)}
        onOpenChange={() => setFileUploadStack([])}
        labels={{
          cancel: "Cancel",
          title: `Upload note${isMultipleUploaded ? "s" : ""}`,
          desc: `Confirm uploaded note${isMultipleUploaded ? "s" : ""} creation`,
        }}
      >
        <div className={cn("flex flex-col gap-4", "px-4 md:px-0")}>
          <div className="grid divide-y overflow-hidden rounded-md border">
            {fileUploadStack.map((x, index) => (
              <div
                key={index + x.filename}
                className="flex items-start gap-2 overflow-hidden p-2"
              >
                <StickyNoteIcon className="mt-1 size-4 shrink-0" />
                <p title={x.filename}>{x.filename}</p>
              </div>
            ))}
          </div>
          <Button className="md:self-end" onClick={createUploadedNotes}>
            Create note{isMultipleUploaded && "s"}
          </Button>
        </div>
      </ResponsiveDialog>
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
            <SidebarMenu>
              {items.map((note) => (
                <DraggableNoteItem
                  key={note.id}
                  note={note}
                  isDisabledReorder={isDisabledReorder}
                />
              ))}
            </SidebarMenu>
          </SortableContext>
          <DragOverlay>
            {activeNote ? <NoteItem note={activeNote} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
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
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none", // for mobile devices
  };

  return (
    <NoteItem
      note={note}
      listeners={listeners}
      isDragged={isDragging}
      isDisabledReorder={isDisabledReorder}
      ref={setNodeRef}
      style={style}
      {...attributes}
      role="listitem"
      // do not allow keyboard focus
      tabIndex={-1}
    />
  );
}

function NoteItem({
  note,
  listeners,
  isDragged,
  isOverlay,
  isDisabledReorder,
  ...rest
}: React.ComponentProps<typeof SidebarMenuItem> & {
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
      className={cn(
        "border-border bg-card grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto_auto] gap-1 rounded-md border p-2",
        isNotePage && "ring-offset-sidebar ring-primary ring ring-offset-2",
        isOverlay && "cursor-grabbing *:pointer-events-none",
        isDragged && "bg-secondary ring-0 ring-offset-0 *:opacity-0",
      )}
      {...rest}
    >
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>
          <p>Reorder</p>
        </TooltipContent>
      </Tooltip>

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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => unpinMutation.mutate(note.id)}
          >
            <PinOffIcon />
            <span className="sr-only">Unpin</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Unpin</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => pinMutation.mutate(note.id)}
        >
          <PinIcon />
          <span className="sr-only">Pin</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Pin</p>
      </TooltipContent>
    </Tooltip>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVerticalIcon />
                <span className="sr-only">Note actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Note actions</p>
          </TooltipContent>
        </Tooltip>
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
            <div className="space-y-0.5 p-2">
              <p className="text-muted-foreground flex items-center gap-2 leading-tight">
                <FileDigitIcon className="size-4" />
                <span>Characters</span>
              </p>
              <p className="leading-tight">{note.note.length}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditTitleDialog(true)}>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyNoteLink(note)}>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openNoteInNewTab(note)}>
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadNote(note)}>
            <DownloadIcon className="text-muted-foreground" />
            <span>Download .md file</span>
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

function copyNoteLink(note: NoteSchemaType) {
  return () => {
    const fullNoteUrl = new URL(
      `/note/${note.id}`,
      window.location.origin,
    ).toString();

    window.navigator.clipboard
      .writeText(fullNoteUrl)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };
}

function openNoteInNewTab(note: NoteSchemaType) {
  return () => {
    window.open(new URL(`/note/${note.id}`, window.location.origin), "_blank");
  };
}

function downloadNote(note: NoteSchemaType) {
  return () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(note.note),
    );
    element.setAttribute("download", `${note.id}.md`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };
}

function getPrettyDate(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);

  const getPartValue = (type: string) => {
    return parts.find((part) => part.type === type)?.value || "";
  };

  const day = getPartValue("day");
  const month = getPartValue("month");
  const year = getPartValue("year");
  const hour = getPartValue("hour");
  const minute = getPartValue("minute");
  const second = getPartValue("second");

  // "12 Mar 2025, 23:59:59"
  return `${day} ${month} ${year}, ${hour}:${minute}:${second}`;
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

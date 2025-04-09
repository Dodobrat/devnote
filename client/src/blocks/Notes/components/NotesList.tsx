import { useEffect, useState } from "react";
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
import { Link, useRouterState } from "@tanstack/react-router";
import { HandIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useReorderPinnedNotes, useReorderUnpinnedNotes } from "~/hooks/query";
import {
  useBulkDeleteNotesAtom,
  useBulkDeleteNotesModeEnabledAtom,
  useExportNotesModeEnabledAtom,
  useToExportNotesAtom,
} from "~/hooks/store";
import { cn } from "~/lib/utils";
import { type NoteSchemaType } from "~/types/notes";

import { NoteActions, NotePinAction } from "../index";

export function NotesList({
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

  const sensors = useSensors(useSensor(PointerSensor));

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

  const [exportMode] = useExportNotesModeEnabledAtom();
  const [bulkDeleteMode] = useBulkDeleteNotesModeEnabledAtom();

  const isInNotesActionMode = bulkDeleteMode || exportMode;

  return (
    <SidebarMenuItem
      className={cn(
        "border-border bg-card grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto_auto] gap-1 gap-y-2 rounded-md border p-2",
        isNotePage && "ring-primary ring",
        isOverlay && "cursor-grabbing *:pointer-events-none",
        isDragged && "bg-secondary ring-0 ring-offset-0 *:opacity-0",
      )}
      {...rest}
    >
      {bulkDeleteMode && <MarkNoteForDeletion note={note} />}
      {exportMode && <MarkNoteForExport note={note} />}

      {!isInNotesActionMode && (
        <>
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
        </>
      )}

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

function MarkNoteForDeletion({ note }: { note: NoteSchemaType }) {
  const [notesToDelete, setNotesToDelete] = useBulkDeleteNotesAtom();

  return (
    <Button
      className="col-span-full"
      variant={notesToDelete.has(note.id) ? "outline" : "default"}
      onClick={() =>
        setNotesToDelete((prev) => {
          const updated = new Set<string>();

          if (prev.has(note.id)) {
            prev.delete(note.id);
          } else {
            prev.add(note.id);
          }

          prev.forEach((v) => updated.add(v));

          return updated;
        })
      }
    >
      {notesToDelete.has(note.id) ? "Remove from queue" : "Add to queue"}
    </Button>
  );
}

function MarkNoteForExport({ note }: { note: NoteSchemaType }) {
  const [notesToExport, setNotesToExport] = useToExportNotesAtom();

  return (
    <Button
      className="col-span-full"
      variant={notesToExport[note.id] ? "outline" : "default"}
      onClick={() =>
        setNotesToExport((prev) => {
          if (prev[note.id]) {
            delete prev[note.id];
          } else {
            prev[note.id] = note;
          }

          return { ...prev };
        })
      }
    >
      {notesToExport[note.id] ? "Remove from queue" : "Add to queue"}
    </Button>
  );
}

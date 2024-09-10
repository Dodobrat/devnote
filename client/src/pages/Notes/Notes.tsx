import { useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";

import { PageCard } from "~/components/Layout";
import { Separator } from "~/components/ui";
import { useNotes, useUpdateNoteOrder } from "~/hooks/query";
import { cn } from "~/lib/utils";
import { NoteSchemaType } from "~/types";

import {
  NoteDelete,
  NoteDragHandle,
  NoteEditTitle,
  NoteLink,
  NotePin,
} from "./components";

export function Notes() {
  return (
    <PageCard>
      <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
        <h1 className="mb-8 text-2xl md:text-4xl lg:text-6xl">Notes</h1>
        <NotesList />
      </div>
    </PageCard>
  );
}

function NotesList() {
  const notesQuery = useNotes();
  const updateNoteOrderMutation = useUpdateNoteOrder();

  const [pinnedNotes, setPinnedNotes] = useState<NoteSchemaType[]>([]);
  const [notes, setNotes] = useState<NoteSchemaType[]>([]);

  useEffect(() => {
    if (!notesQuery.data) return;

    const pinned: NoteSchemaType[] = [];
    const regular: NoteSchemaType[] = [];

    for (const note of notesQuery.data) {
      if (note?.isPinned) {
        pinned.push(note);
      }

      if (!note?.isPinned) {
        regular.push(note);
      }
    }

    setPinnedNotes(pinned);
    setNotes(regular);
  }, [notesQuery.data]);

  if (notesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (!notesQuery.data?.length) {
    return <div>No data</div>;
  }

  const updateNoteOrder = () => {
    const dataToSend = [
      ...pinnedNotes.map((x) => x.id),
      ...notes.map((x) => x.id),
    ];
    updateNoteOrderMutation.mutate(
      { order: dataToSend },
      { onError: () => toast.error("Failed to reorder notes") },
    );
  };

  const updateOrderOnKeyDown =
    (
      note: NoteSchemaType,
      setState: React.Dispatch<React.SetStateAction<NoteSchemaType[]>>,
    ) =>
    (dir: NoteReorderDirection) => {
      setState((prev) => {
        const index = prev.findIndex((x) => x.id === note.id);
        const newIndex = dir === "up" ? index - 1 : index + 1;

        if (newIndex < 0) {
          toast.info("Can't move note up");
          return prev;
        }

        if (newIndex >= prev.length) {
          toast.info("Can't move note down");
          return prev;
        }

        const newNotes = [...prev];

        newNotes.splice(index, 1);
        newNotes.splice(newIndex, 0, note);

        return newNotes;
      });

      updateNoteOrder();
    };

  const showSeparator = Boolean(pinnedNotes.length) && Boolean(notes.length);

  return (
    <>
      <Reorder.Group
        className="grid"
        axis="y"
        as="div"
        values={pinnedNotes}
        onReorder={setPinnedNotes}
        layoutScroll
      >
        {pinnedNotes.map((pinnedNote) => (
          <NoteItem
            note={pinnedNote}
            key={pinnedNote.id}
            onReorderEnd={updateNoteOrder}
            onKeyboardReorder={updateOrderOnKeyDown(pinnedNote, setPinnedNotes)}
          />
        ))}
      </Reorder.Group>

      {showSeparator && <Separator />}

      <Reorder.Group
        className="grid"
        axis="y"
        as="div"
        values={notes}
        onReorder={setNotes}
        layoutScroll
      >
        {notes.map((note) => (
          <NoteItem
            note={note}
            key={note.id}
            onReorderEnd={updateNoteOrder}
            onKeyboardReorder={updateOrderOnKeyDown(note, setNotes)}
          />
        ))}
      </Reorder.Group>

      {notesQuery.hasNextPage && !notesQuery.isFetching && (
        <InView onChange={(isInView) => isInView && notesQuery.fetchNextPage()}>
          Loading more...
        </InView>
      )}
    </>
  );
}

type NoteReorderDirection = "up" | "down";

function NoteItem({
  note,
  onReorderEnd,
  onKeyboardReorder,
}: {
  note: NoteSchemaType;
  onReorderEnd?: () => void;
  onKeyboardReorder: (dir: NoteReorderDirection) => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      as="article"
      className={cn(
        "-mx-4 flex items-start gap-2 rounded-lg bg-card px-4 py-4 transition-shadow",
        isDragging && "cursor-grabbing shadow-xl",
      )}
      value={note}
      dragListener={false}
      dragControls={controls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        onReorderEnd?.();
      }}
    >
      <div
        className={cn(
          "order-1 grid grow grid-cols-[1fr_auto] gap-2 md:grid-cols-[auto_1fr_auto]",
          isDragging && "pointer-events-none",
        )}
      >
        <NoteLink note={note} />

        <div className="flex shrink-0 gap-2 md:order-1">
          <NotePin note={note} />
          {/* <NoteProtect note={note} /> */}
        </div>

        <div className="ml-auto flex shrink-0 gap-2 md:order-3">
          <NoteEditTitle note={note} />
          <NoteDelete note={note} />
        </div>
      </div>

      <NoteDragHandle
        onPointerDown={(e) => controls.start(e)}
        className={isDragging ? "pointer-events-none" : ""}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            onKeyboardReorder("up");
          }

          if (e.key === "ArrowDown") {
            onKeyboardReorder("down");
          }
        }}
      />
    </Reorder.Item>
  );
}

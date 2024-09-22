import { useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import {
  UseInfiniteQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";

import { Page } from "~/components/Layout";
import { Separator } from "~/components/ui";
import {
  usePinnedNotes,
  useReorderPinnedNotes,
  useReorderUnpinnedNotes,
  useUnPinnedNotes,
} from "~/hooks/query";
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
    <Page.Card>
      <Page.Content>
        <Page.Title>Notes</Page.Title>
        <NotesList />
      </Page.Content>
    </Page.Card>
  );
}

function NotesList() {
  return (
    <>
      <NoteGroup
        useNotesInfiniteQuery={usePinnedNotes}
        useReorderMutation={useReorderPinnedNotes}
        noDataMessage="No pinned notes"
      />

      <Separator />

      <NoteGroup
        useNotesInfiniteQuery={useUnPinnedNotes}
        useReorderMutation={useReorderUnpinnedNotes}
        noDataMessage="No notes"
      />
    </>
  );
}

function NoteGroup({
  useNotesInfiniteQuery,
  useReorderMutation,
  noDataMessage,
}: {
  useNotesInfiniteQuery: () => UseInfiniteQueryResult<NoteSchemaType[], Error>;
  useReorderMutation: () => UseMutationResult<void, Error, string[], unknown>;
  noDataMessage: string;
}) {
  const query = useNotesInfiniteQuery();
  const updateOrderMutation = useReorderMutation();

  const [clonedData, setClonedData] = useState<NoteSchemaType[]>([]);

  useEffect(() => {
    if (!query.data?.length) return;
    setClonedData([...query.data]);
  }, [query.data]);

  const updateNoteOrder = () => {
    const dataToSend = [...clonedData.map((x) => x.id)];
    updateOrderMutation.mutate(dataToSend, {
      onError: () => toast.error("Failed to reorder notes"),
    });
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

  return (
    <>
      {!query.isLoading && !query.data?.length && (
        <div className="py-8">{noDataMessage}</div>
      )}

      <Reorder.Group
        className="grid"
        axis="y"
        as="div"
        values={clonedData}
        onReorder={setClonedData}
        layoutScroll
      >
        {clonedData.map((note) => {
          if (!note) return null;
          return (
            <NoteItem
              note={note}
              key={note.id}
              onReorderEnd={updateNoteOrder}
              onKeyboardReorder={updateOrderOnKeyDown(note, setClonedData)}
            />
          );
        })}
      </Reorder.Group>

      {query.hasNextPage && !query.isFetching && (
        <InView onChange={(isInView) => isInView && query.fetchNextPage()}>
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

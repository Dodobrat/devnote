import { useCallback, useEffect, useState } from "react";
import { InView } from "react-intersection-observer";
import { generatePath, NavLink } from "react-router-dom";
import {
  UseInfiniteQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";

import { Page } from "~/components/Layout";
import { Separator } from "~/components/ui";
import { useDocumentTitle } from "~/hooks";
import {
  usePinnedNotes,
  useReorderPinnedNotes,
  useReorderUnpinnedNotes,
  useUnPinnedNotes,
} from "~/hooks/query";
import { cn } from "~/lib/utils";
import { AppRoutes } from "~/routes";
import { NoteSchemaType } from "~/types";

import {
  NoteDelete,
  NoteDragHandle,
  NoteEditTitle,
  NotePin,
} from "./components";

export function Notes() {
  useDocumentTitle("DevNote | Notes");

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Notes</Page.Title>

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
      </Page.Content>
    </Page.Card>
  );
}

type NoteReorderDirection = "up" | "down";

type NoteGroupProps = {
  useNotesInfiniteQuery: () => UseInfiniteQueryResult<NoteSchemaType[], Error>;
  useReorderMutation: () => UseMutationResult<void, Error, string[], unknown>;
  noDataMessage: string;
};

function NoteGroup({
  useNotesInfiniteQuery,
  useReorderMutation,
  noDataMessage,
}: NoteGroupProps) {
  const query = useNotesInfiniteQuery();
  const updateOrderMutation = useReorderMutation();

  const [clonedData, setClonedData] = useState<NoteSchemaType[]>([]);

  useEffect(() => {
    if (!query.data) return;
    setClonedData([...query.data]);
  }, [query.data]);

  const updateNoteOrder = useCallback(
    (updatedOrderNotes: NoteSchemaType[]) => {
      updateOrderMutation.mutate([...updatedOrderNotes.map((x) => x.id)], {
        onError: () => toast.error("Failed to reorder notes"),
      });
    },
    [updateOrderMutation],
  );

  const updateOrderOnKeyDown = useCallback(
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

          // Send request to update note order
          updateNoteOrder(newNotes);

          return newNotes;
        });
      },
    [updateNoteOrder],
  );

  return (
    <>
      {!query.isLoading && !query.data?.length && (
        <div className="py-6">{noDataMessage}</div>
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
              onReorderEnd={() => updateNoteOrder(clonedData)}
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

type NoteItemProps = {
  note: NoteSchemaType;
  onReorderEnd?: () => void;
  onKeyboardReorder: (dir: NoteReorderDirection) => void;
};

function NoteItem({ note, onReorderEnd, onKeyboardReorder }: NoteItemProps) {
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
        <NavLink
          to={generatePath(AppRoutes.NoteById, { id: note.id })}
          className={cn([
            "col-span-full md:order-2 md:col-span-1",
            "select-none truncate text-lg font-semibold leading-tight",
            "grow rounded-lg px-4 py-2 md:h-full",
            "focus:outline-none focus-visible:ring",
            "hover:bg-muted",
          ])}
        >
          {note.title}
        </NavLink>

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

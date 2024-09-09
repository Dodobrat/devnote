import { InView } from "react-intersection-observer";
import { GripVerticalIcon } from "lucide-react";

import { PageCard } from "~/components/Layout";
import { useNotes } from "~/hooks/query";

import {
  NoteDelete,
  NoteEditTitle,
  NoteLink,
  NotePin,
  NoteProtect,
  NoteReorderDropdown,
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

  if (notesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (!notesQuery.data?.length) {
    return <div>No data</div>;
  }

  return (
    <div className="grid divide-y">
      {notesQuery.data?.map((note) => (
        <article className="flex items-start gap-2 py-4" key={note.id}>
          {/* Reorder handle */}
          <div className="flex h-full w-10 shrink-0 items-center justify-center rounded-lg bg-muted px-2">
            <GripVerticalIcon className="size-5" />
          </div>

          <div className="grid grow grid-cols-[1fr_auto] gap-2 md:grid-cols-[auto_1fr_auto]">
            <NoteLink note={note} />

            <div className="flex shrink-0 gap-2 md:order-1">
              <NotePin note={note} />
              <NoteProtect note={note} />
            </div>

            <div className="ml-auto flex shrink-0 gap-2 md:order-3">
              <NoteEditTitle note={note} />
              <NoteReorderDropdown note={note} />
              <NoteDelete note={note} />
            </div>
          </div>
        </article>
      ))}

      {notesQuery.hasNextPage && !notesQuery.isFetching && (
        <InView onChange={(isInView) => isInView && notesQuery.fetchNextPage()}>
          Loading more...
        </InView>
      )}
    </div>
  );
}

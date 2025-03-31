import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { NoteActions, NotePinAction } from "~/blocks";
import { Page } from "~/components";
import { Editor } from "~/components/Editor";
import { noteByIdQueryOptions, useSaveNote } from "~/hooks/query";
import { useEditorNote, useLastOpenedNote } from "~/hooks/store";

export const Route = createFileRoute("/note/$noteId")({
  loader: ({ context: { queryClient }, params: { noteId } }) => {
    return queryClient.ensureQueryData(noteByIdQueryOptions({ id: noteId }));
  },
  component: RouteComponent,
  notFoundComponent: () => {
    return <>NOT FOUND NOTE</>;
  },
});

function RouteComponent() {
  const { noteId } = Route.useParams();
  const noteQuery = useSuspenseQuery(noteByIdQueryOptions({ id: noteId }));

  const [, setLastOpenedNote] = useLastOpenedNote();
  const { setNote } = useEditorNote();

  const params = Route.useParams();
  const saveNote = useSaveNote({ id: params.noteId });

  // useEffect(() => {
  //   if (!location.state?.from) return;
  //   if (location.state.from === LAST_VISITED_ROUTE_STATE_KEY) {
  //     toast("Navigated to last opened note", {
  //       id: LAST_VISITED_ROUTE_STATE_KEY,
  //     });
  //   }
  // }, [location.state]);

  useEffect(() => {
    setLastOpenedNote(noteId);
  }, [noteId, setLastOpenedNote]);

  useEffect(() => {
    if (!noteQuery.data) return;
    setNote(noteQuery.data.note);
  }, [noteQuery.data, setNote]);

  if (!noteQuery.data) {
    return null;
  }

  return (
    <>
      <Page.EditorHeader title={noteQuery.data?.title}>
        <div className="flex items-center gap-2">
          <NotePinAction note={noteQuery.data} />
          <NoteActions note={noteQuery.data} align="end" />
        </div>
      </Page.EditorHeader>

      <Editor saveNote={saveNote} />
    </>
  );
}

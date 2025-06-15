import { useEffect } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import { toast } from "sonner";

import { Editor, SaveNoteButton } from "~/blocks/Editor";
import { NoteActions } from "~/blocks/Notes";
import { LAST_VISITED_ROUTE_STATE_KEY } from "~/constants";
import { noteByIdQueryOptions, useSaveNote } from "~/hooks/query";
import { useEditorNoteAtom, useLastOpenedNoteAtom } from "~/hooks/store";

export const Route = createFileRoute("/note/$noteId")({
  loader: async ({ context: { queryClient }, params: { noteId } }) => {
    const note = await queryClient.ensureQueryData(
      noteByIdQueryOptions({ id: noteId }),
    );
    if (!note) {
      throw redirect({ to: "/404", replace: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { noteId } = Route.useParams();
  const noteQuery = useSuspenseQuery(noteByIdQueryOptions({ id: noteId }));
  const data = noteQuery.data!;

  const [, setLastOpenedNote] = useLastOpenedNoteAtom();
  const [, setNote] = useEditorNoteAtom();

  const saveNote = useSaveNote(data);

  const navigate = Route.useNavigate();
  const routerState = useRouterState();
  const redirectedKey = routerState.location.state?.redirectedToLastSavedNote;

  useEffect(() => {
    if (!redirectedKey) return;
    if (redirectedKey === LAST_VISITED_ROUTE_STATE_KEY) {
      toast("Navigated to last opened note", {
        id: LAST_VISITED_ROUTE_STATE_KEY,
      });
      // Remove state to prevent toast from showing on refresh
      navigate({ state: {}, replace: true });
    }
  }, [redirectedKey, navigate]);

  useEffect(() => {
    setLastOpenedNote(noteId);
  }, [noteId, setLastOpenedNote]);

  useEffect(() => {
    if (!data) return;
    setNote(data.note || "");
  }, [data, setNote]);

  return (
    <Editor saveNote={saveNote} title={data.title}>
      <SaveNoteButton noteValue={data.note} saveNote={saveNote} />
      <NoteActions note={data} align="end" />
    </Editor>
  );
}

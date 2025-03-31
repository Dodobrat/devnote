import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Page } from "~/components";
import { Editor } from "~/components/Editor";
import { useSaveNote } from "~/hooks/query";
import { useEditorNote, useEditorWelcomeNote } from "~/hooks/store";

export const Route = createFileRoute("/note/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const [welcomeNote] = useEditorWelcomeNote();

  const { setNote } = useEditorNote();
  const saveNote = useSaveNote();

  useEffect(() => {
    if (!welcomeNote) return;
    setNote(welcomeNote);
  }, [setNote, welcomeNote]);

  return (
    <>
      <Page.EditorHeader>
        {/* <NotePinAction note={noteQuery.data} /> */}
      </Page.EditorHeader>

      <Editor saveNote={saveNote} />
    </>
  );
}

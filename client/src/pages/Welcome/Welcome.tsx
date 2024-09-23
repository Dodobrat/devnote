import { useEffect, useRef } from "react";

import { Editor } from "~/components/Editor";
import { useEditorNote, useEditorWelcomeNote } from "~/hooks/store/editor";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";

export function Welcome() {
  const [welcomeNote] = useEditorWelcomeNote();

  useDocumentTitle("DevNote | Welcome");

  const { setNote } = useEditorNote();

  const setNoteInitialRef = useRef(setNote);

  useEffect(() => {
    if (!welcomeNote) return;
    setNoteInitialRef.current(welcomeNote);
  }, [welcomeNote]);

  return <Editor />;
}

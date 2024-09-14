import { useEffect, useRef } from "react";

import { Editor } from "~/components/Editor";
import { useEditorNote, useEditorWelcomeNote } from "~/hooks/store/editor";

export function Welcome() {
  const [welcomeNote] = useEditorWelcomeNote();

  const { setNote } = useEditorNote();

  const setNoteInitialRef = useRef(setNote);

  useEffect(() => {
    if (!welcomeNote) return;
    setNoteInitialRef.current(welcomeNote);
  }, [welcomeNote]);

  return <Editor />;
}

import { useEffect } from "react";

import { Editor } from "~/components/Editor";
import { useEditorNote, useEditorWelcomeNote } from "~/hooks/store/editor";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";

export function Welcome() {
  const [welcomeNote] = useEditorWelcomeNote();

  useDocumentTitle("DevNote | Welcome");

  const { setNote } = useEditorNote();

  useEffect(() => {
    if (!welcomeNote) return;
    setNote(welcomeNote);
  }, [setNote, welcomeNote]);

  return <Editor />;
}

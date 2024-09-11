import { useEffect, useRef } from "react";

import { Editor } from "~/components/Editor";
import { useEditorNote } from "~/hooks/store/editor";

const WELCOME_TEXT = "#HELLO WORLD!";

export function Welcome() {
  const { setNote } = useEditorNote();
  const setNoteInitialRef = useRef(setNote);

  useEffect(() => {
    setNoteInitialRef.current(WELCOME_TEXT);
  }, []);

  return <Editor />;
}

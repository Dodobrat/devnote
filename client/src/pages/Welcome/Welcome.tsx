import { useEffect, useRef } from "react";

import { Editor } from "~/components/Editor";
import { storeKeys, useQueryStore } from "~/hooks/store";

const WELCOME_TEXT = "#HELLO WORLD!";

export function Welcome() {
  const [, setNote] = useQueryStore(storeKeys.rawNote, "");
  const setNoteInitialRef = useRef(setNote);

  useEffect(() => {
    setNoteInitialRef.current(WELCOME_TEXT);
  }, []);

  return <Editor />;
}

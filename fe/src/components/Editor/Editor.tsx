import { useEffect } from "react";
import { type EditorView } from "codemirror";

import { CodeMirrorInstanceProvider, useCodeMirrorInstance } from "~/context";

import { CodeMirrorEditor } from "./components/CodeMirrorEditor";

export function Editor({
  saveNote,
}: {
  saveNote: (editor: EditorView | undefined) => void;
}) {
  return (
    <CodeMirrorInstanceProvider>
      <CodeMirrorEditor saveNote={saveNote} />
      <EditorFocusManager />
      {/* <EditorOutput /> */}
    </CodeMirrorInstanceProvider>
  );
}

function EditorFocusManager() {
  const { codeMirrorInstance } = useCodeMirrorInstance();

  useEffect(() => {
    if (!codeMirrorInstance) return;
    codeMirrorInstance.focus();
  }, [codeMirrorInstance]);

  return null;
}

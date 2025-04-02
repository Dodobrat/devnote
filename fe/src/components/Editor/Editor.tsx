import { useEffect } from "react";
import { type EditorView } from "codemirror";

import { CodeMirrorInstanceProvider, useCodeMirrorInstance } from "~/context";

import { Page } from "../Page";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor";

type EditorProps = React.PropsWithChildren<{
  title?: string;
  saveNote: (editor: EditorView | undefined) => void;
}>;

export function Editor({ children, title, saveNote }: EditorProps) {
  return (
    <CodeMirrorInstanceProvider>
      <Page.EditorHeader title={title}>{children}</Page.EditorHeader>

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

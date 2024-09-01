import { useState } from "react";
import MonacoEditor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { EditorOutput } from "./EditorOutput";

loader.config({ monaco });

export function Editor() {
  const [v, setV] = useState("");

  return (
    <>
      <EditorOutput value={v} />

      <MonacoEditor
        className="p-10"
        height="90vh"
        defaultLanguage="markdown"
        //   defaultValue="// some comment"
        value={v}
        onChange={(v) => {
          setV(v || "");
        }}
        options={{
          scrollBeyondLastLine: false,
          lineNumbers: "off",
          lineDecorationsWidth: 0,
          minimap: {
            enabled: false,
          },
          theme: "vs-dark",
        }}
      />
    </>
  );
}

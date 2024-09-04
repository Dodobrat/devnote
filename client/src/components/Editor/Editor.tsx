import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import MonacoEditor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

import { ThemeMode, useTheme } from "~/context";
import { useNote, useUpdateNote } from "~/hooks/query";
import { cn } from "~/lib/utils";

import { EditorOutput } from "./EditorOutput";

loader.config({ monaco });

export function Editor() {
  const [v, setV] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const params = useParams<{ id: string }>();
  const { data } = useNote(parseInt(params.id!));

  useEffect(() => {
    if (!data?.data) return;
    setV(data.data.note);
  }, [data?.data]);

  const updateMutation = useUpdateNote();

  const { resolvedTheme } = useTheme();

  return (
    <div className="m-4 grow overflow-hidden rounded-lg border">
      <div className={cn("grid h-full grid-cols-2 gap-2 overflow-hidden")}>
        <MonacoEditor
          theme={resolvedTheme === ThemeMode.Dark ? "vs-dark" : "light"}
          defaultLanguage="markdown"
          // onMount={(editor) => {
          //   // editor.
          // }}
          value={v}
          onChange={(noteValue) => {
            clearTimeout(timeoutRef.current);
            setV(noteValue || "");
            timeoutRef.current = setTimeout(() => {
              if (!data?.data) return;
              updateMutation.mutate({
                ...data?.data,
                note: noteValue || "",
              });
            }, 500);
          }}
          options={{
            acceptSuggestionOnEnter: "off",
            contextmenu: false,
            disableLayerHinting: true,
            emptySelectionClipboard: true,
            formatOnType: false,
            hover: { enabled: false },
            inlayHints: { enabled: "off" },
            inlineCompletionsAccessibilityVerbose: false,
            inlineSuggest: { enabled: false },
            lineDecorationsWidth: 0,
            lineNumbers: "off",
            minimap: { enabled: false },
            parameterHints: { enabled: false },
            quickSuggestions: false,
            scrollBeyondLastLine: false,
            snippetSuggestions: "none",
            suggest: { showWords: false },
            suggestOnTriggerCharacters: false,
            tabCompletion: "off",
            wordBasedSuggestions: "off",
            wordWrap: "on",
          }}
        />

        <EditorOutput value={v} />
      </div>
    </div>
  );
}

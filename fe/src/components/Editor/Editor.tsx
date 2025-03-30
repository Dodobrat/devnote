import { type EditorView } from "codemirror";

import { CodeMirrorInstanceProvider } from "~/context";

import { CodeMirrorEditor } from "./components/CodeMirrorEditor";

export function Editor({
  saveNote,
  renderSaveActions,
}: {
  saveNote: (editor: EditorView | undefined) => void;
  renderSaveActions?: () => React.ReactNode;
}) {
  // const [mode, setMode] = useEditorPreviewMode();

  // useKeyDownEvent((e) => {
  //   if (getIsShowEditorKeyCombo(e)) {
  //     e.preventDefault();
  //     setMode("editor");
  //   }
  // });

  // useKeyDownEvent((e) => {
  //   if (getIsShowPreviewKeyCombo(e)) {
  //     e.preventDefault();
  //     setMode("preview");
  //   }
  // });

  return (
    <CodeMirrorInstanceProvider>
      <CodeMirrorEditor saveNote={saveNote} />
      {/* <EditorFocusManager /> */}
      {/* <Tabs
        value={mode}
        onValueChange={(v) => setMode(v as typeof mode)}
        className="flex h-full flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 border-b p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <TabsList className="h-auto">
                <TabsTrigger value="editor" className="h-full">
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-full">
                  Preview
                </TabsTrigger>
              </TabsList>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              <div className="space-y-2">
                <p>
                  <CommandShortcutSnippet>
                    {showEditorShortcut}
                  </CommandShortcutSnippet>
                  <span> Editor</span>
                </p>
                <p>
                  <CommandShortcutSnippet>
                    {showPreviewShortcut}
                  </CommandShortcutSnippet>
                  <span> Preview</span>
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
          {renderSaveActions?.() ?? <SaveNoteButton saveNote={saveNote} />}
        </div>
        <TabsContent
          value="editor"
          className={cn(
            "mt-0 grow overflow-auto",
            mode === "preview" && "hidden",
          )}
          forceMount
        >
          <CodeMirrorEditor saveNote={saveNote} />
          <EditorFocusManager mode={mode} />
        </TabsContent>
        <TabsContent
          value="preview"
          className={cn(
            "mt-0 grow overflow-auto",
            mode === "editor" && "hidden",
          )}
          forceMount
        >
          <EditorOutput />
        </TabsContent>
      </Tabs> */}
    </CodeMirrorInstanceProvider>
  );
}

// function EditorFocusManager() {
//   const { codeMirrorInstance } = useCodeMirrorInstance();

//   useEffect(() => {
//     if (!codeMirrorInstance) return;
//     codeMirrorInstance.focus();
//   }, [codeMirrorInstance]);

//   return null;
// }

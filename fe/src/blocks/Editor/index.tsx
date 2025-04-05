import { useEffect } from "react";
import { type EditorView } from "codemirror";
import { ViewIcon } from "lucide-react";

import { Page } from "~/components/Page";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
} from "~/components/ui/drawer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { CodeMirrorInstanceProvider, useCodeMirrorInstance } from "~/context";
import { useIsMobile } from "~/hooks";
import { storeKeys, useShowEditorPreviewAtom } from "~/hooks/store";

import { CodeMirrorEditor } from "./components/CodeMirrorEditor";
import { EditorOutput } from "./components/CodeMirrorEditorOutput";

type EditorProps = React.PropsWithChildren<{
  title?: string;
  saveNote: (editor: EditorView | undefined) => void;
}>;

const MIN_RESIZE_PANEL_SIZE = 20;

export function Editor({ children, title, saveNote }: EditorProps) {
  const isMobile = useIsMobile();
  const [showEditorPreview, setShowEditorPreview] = useShowEditorPreviewAtom();

  return (
    <CodeMirrorInstanceProvider>
      <Page.EditorHeader title={title}>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowEditorPreview((v) => !v)}
          >
            <ViewIcon />
          </Button>

          {children}
        </div>
      </Page.EditorHeader>

      {isMobile && (
        <>
          <CodeMirrorEditor saveNote={saveNote} />
          <EditorFocusManager />

          <Drawer open={showEditorPreview} onOpenChange={setShowEditorPreview}>
            <DrawerContent>
              <EditorOutput />
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </>
      )}

      {!isMobile && (
        <ResizablePanelGroup
          direction="horizontal"
          autoSaveId={storeKeys.editorLayout}
        >
          <ResizablePanel id="editor" order={0} minSize={MIN_RESIZE_PANEL_SIZE}>
            <CodeMirrorEditor saveNote={saveNote} />
            <EditorFocusManager />
          </ResizablePanel>
          {showEditorPreview && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                id="preview"
                order={1}
                minSize={MIN_RESIZE_PANEL_SIZE}
              >
                <EditorOutput />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      )}
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

export * from "./components/SaveNoteButton";

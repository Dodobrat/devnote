import { useEffect, useRef, useState } from "react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { type EditorView } from "codemirror";
import { Columns2Icon, EyeIcon, EyeOffIcon } from "lucide-react";

import { Page } from "~/components/Page";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";
import { getIsShowEditorPreviewKeyCombo } from "~/constants/shortcuts";
import { useIsMobile, useKeyDownEvent } from "~/hooks";
import { storeKeys, useShowEditorPreviewAtom } from "~/hooks/store";

import { CodeMirrorEditor } from "./components/CodeMirrorEditor";
import { EditorOutput } from "./components/CodeMirrorEditorOutput";
import { CodeMirrorInstanceProvider, useCodeMirrorInstance } from "./context";

type EditorProps = React.PropsWithChildren<{
  title?: string;
  saveNote: (editor: EditorView | undefined) => void;
}>;

const MIN_RESIZE_PANEL_SIZE = 20;

export function Editor({ children, title, saveNote }: EditorProps) {
  const isMobile = useIsMobile();
  const [showEditorPreview, setShowEditorPreview] = useShowEditorPreviewAtom();
  const editorResizePanelRef = useRef<ImperativePanelHandle>(null);
  const [isEvenPanels, setIsEvenPanels] = useState(false);

  const resetPanelSize = () => {
    const panel = editorResizePanelRef.current;
    if (!panel) return;
    panel.resize(50);
  };

  useKeyDownEvent((e) => {
    if (getIsShowEditorPreviewKeyCombo(e)) {
      e.preventDefault();
      setShowEditorPreview((v) => !v);
    }
  });

  return (
    <CodeMirrorInstanceProvider>
      <Page.EditorHeader title={title}>
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowEditorPreview((v) => !v)}
            >
              {showEditorPreview ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          )}

          {!isMobile && !showEditorPreview && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowEditorPreview(true)}
            >
              <EyeIcon />
            </Button>
          )}

          {!isMobile && showEditorPreview && (
            <div className="inline-flex items-center gap-1 rounded-lg border">
              <Button
                size="icon"
                variant="ghost"
                disabled={isEvenPanels}
                onClick={resetPanelSize}
              >
                <Columns2Icon />
              </Button>
              <div className="bg-border h-6 w-px" />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowEditorPreview(false)}
              >
                <EyeOffIcon />
              </Button>
            </div>
          )}

          {children}
        </div>
      </Page.EditorHeader>

      {isMobile && (
        <>
          <CodeMirrorEditor saveNote={saveNote} />
          <EditorFocusManager />

          <Drawer open={showEditorPreview} onOpenChange={setShowEditorPreview}>
            <DrawerHeader>
              <DrawerTitle></DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
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
          onLayout={([left, right]) => {
            const isEven = Math.abs(left - right) < 1;
            setIsEvenPanels(isEven);
          }}
        >
          <ResizablePanel
            id="editor"
            order={0}
            minSize={MIN_RESIZE_PANEL_SIZE}
            ref={editorResizePanelRef}
          >
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

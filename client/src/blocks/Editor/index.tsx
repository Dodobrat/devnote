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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  getIsResetEditorPreviewSizeKeyCombo,
  getIsShowEditorPreviewKeyCombo,
} from "~/constants/shortcuts";
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

  useKeyDownEvent((e) => {
    if (getIsResetEditorPreviewSizeKeyCombo(e)) {
      e.preventDefault();
      resetPanelSize();
    }
  });

  return (
    <CodeMirrorInstanceProvider>
      <Page.EditorHeader title={title}>
        <div className="flex items-center gap-2">
          {isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEditorPreview((v) => !v)}
                >
                  {showEditorPreview ? <EyeOffIcon /> : <EyeIcon />}
                  <span className="sr-only">Toggle editor preview</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle editor preview</p>
              </TooltipContent>
            </Tooltip>
          )}

          {!isMobile && !showEditorPreview && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEditorPreview(true)}
                >
                  <EyeIcon />
                  <span className="sr-only">Toggle editor preview</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle editor preview</p>
              </TooltipContent>
            </Tooltip>
          )}

          {!isMobile && showEditorPreview && (
            <div className="inline-flex items-center gap-1 rounded-lg border">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isEvenPanels}
                    onClick={resetPanelSize}
                  >
                    <Columns2Icon />
                    <span className="sr-only">Reset preview size</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset preview size</p>
                </TooltipContent>
              </Tooltip>
              <div className="bg-border h-6 w-px" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowEditorPreview(false)}
                  >
                    <EyeOffIcon />
                    <span className="sr-only">Toggle editor preview</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle editor preview</p>
                </TooltipContent>
              </Tooltip>
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

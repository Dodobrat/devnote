import { useEffect, useRef, useState } from "react";
import { type ImperativePanelHandle } from "react-resizable-panels";
import { type EditorView } from "codemirror";
import { Columns2Icon, EyeIcon, EyeOffIcon } from "lucide-react";

import { Page } from "~/components/Page";
import { Button, Drawer, Resizable, Tooltip } from "~/components/ui";
import {
  getIsResetEditorPreviewSizeKeyCombo,
  getIsShowEditorPreviewKeyCombo,
} from "~/constants/shortcuts";
import { useIsMobile, useKeyDownEvent } from "~/hooks";
import {
  storeKeys,
  useEditorSyncScrollAtom,
  useShowEditorPreviewAtom,
} from "~/hooks/store";

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
  const [isSynced] = useEditorSyncScrollAtom();

  const editorResizePanelRef = useRef<ImperativePanelHandle>(null);
  const editorOutputRef = useRef<HTMLDivElement>(null);
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
        <div className="flex items-center">
          {isMobile && (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEditorPreview((v) => !v)}
                >
                  {showEditorPreview ? <EyeOffIcon /> : <EyeIcon />}
                  <span className="sr-only">Toggle editor preview</span>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Toggle editor preview</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          {!isMobile && !showEditorPreview && (
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowEditorPreview(true)}
                >
                  <EyeIcon />
                  <span className="sr-only">Toggle editor preview</span>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>Toggle editor preview</p>
              </Tooltip.Content>
            </Tooltip>
          )}

          {!isMobile && showEditorPreview && (
            <div className="inline-flex items-center gap-1 rounded-lg border">
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={isEvenPanels}
                    onClick={resetPanelSize}
                  >
                    <Columns2Icon />
                    <span className="sr-only">Reset preview size</span>
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Reset preview size</p>
                </Tooltip.Content>
              </Tooltip>
              <div className="bg-border h-6 w-px" />
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setShowEditorPreview(false)}
                  >
                    <EyeOffIcon />
                    <span className="sr-only">Toggle editor preview</span>
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Toggle editor preview</p>
                </Tooltip.Content>
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
            <Drawer.Header>
              <Drawer.Title></Drawer.Title>
              <Drawer.Description></Drawer.Description>
            </Drawer.Header>
            <Drawer.Content>
              <EditorOutput />
              <Drawer.Footer>
                <Drawer.Close asChild>
                  <Button variant="outline">Cancel</Button>
                </Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer>
        </>
      )}

      {!isMobile && (
        <div className="max-h-[calc(100svh_-_var(--spacing)*16)] grow overflow-auto">
          <Resizable
            direction="horizontal"
            autoSaveId={storeKeys.editorLayout}
            onLayout={([left, right]) => {
              const isEven = Math.abs(left - right) < 1;
              setIsEvenPanels(isEven);
            }}
          >
            <Resizable.Panel
              id="editor"
              order={0}
              minSize={MIN_RESIZE_PANEL_SIZE}
              ref={editorResizePanelRef}
            >
              <CodeMirrorEditor
                saveNote={saveNote}
                onWheel={
                  isSynced
                    ? (info) => {
                        const el = editorOutputRef.current;
                        if (!el) return;

                        // Calculate target scroll position based on percentage
                        // scrolledPercentage is a value from 0-100
                        const maxScrollTop = el.scrollHeight - el.clientHeight;
                        const targetScrollTop =
                          (info.scrolledPercentage / 100) * maxScrollTop;

                        el.scrollTo({
                          top: targetScrollTop,
                          left: 0,
                          behavior: "instant",
                        });
                      }
                    : undefined
                }
              />
              <EditorFocusManager />
            </Resizable.Panel>
            {showEditorPreview && (
              <>
                <Resizable.Handle withHandle />
                <Resizable.Panel
                  id="preview"
                  order={1}
                  minSize={MIN_RESIZE_PANEL_SIZE}
                >
                  <EditorOutput ref={editorOutputRef} />
                </Resizable.Panel>
              </>
            )}
          </Resizable>
        </div>
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

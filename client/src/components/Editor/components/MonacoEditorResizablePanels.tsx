import { useParams } from "react-router-dom";
import {
  ArrowDownFromLineIcon,
  ArrowLeftFromLineIcon,
  ArrowRightFromLineIcon,
  ArrowUpFromLineIcon,
  RotateCcwIcon,
  SaveIcon,
  SquareSplitHorizontalIcon,
  SquareSplitVerticalIcon,
} from "lucide-react";

import {
  Button,
  CommandShortcutSnippet,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import {
  COLLAPSED_RESIZE_PANEL_SIZE,
  DEFAULT_RESIZE_PANEL_SIZE,
  MIN_RESIZE_PANEL_SIZE,
} from "~/constants";
import {
  collapseEditorPanelShortcut,
  collapsePreviewPanelShortcut,
  resetEditorPanelSizesShortcut,
  saveCurrentNoteShortcut,
  toggleSplitViewModeShortcut,
} from "~/constants/shortcuts";
import { useActions } from "~/hooks";
import {
  useEditorAutosave,
  useEditorLayoutState,
  useEditorPanelHandle,
  usePreviewPanelHandle,
} from "~/hooks/store/editor";
import { cn, getIsInRange } from "~/lib/utils";

export function EditorResizableGroup({ children }: React.PropsWithChildren) {
  const [state, setState] = useEditorLayoutState();

  return (
    <ResizablePanelGroup
      direction={state.direction}
      className="max-w-full bg-card shadow-lg md:rounded-lg md:border"
      onLayout={([editorSize, previewSize]) => {
        setState((v) => ({ ...v, editorSize, previewSize }));
      }}
    >
      {children}
    </ResizablePanelGroup>
  );
}

export function EditorResizePanel({ children }: React.PropsWithChildren) {
  const [state, setState] = useEditorLayoutState();
  const [, setEditorPanelHandle] = useEditorPanelHandle();

  return (
    <ResizablePanel
      collapsible
      collapsedSize={COLLAPSED_RESIZE_PANEL_SIZE}
      defaultSize={state.editorSize ?? DEFAULT_RESIZE_PANEL_SIZE}
      minSize={MIN_RESIZE_PANEL_SIZE}
      onCollapse={() => setState((v) => ({ ...v, editorCollapsed: true }))}
      onExpand={() => setState((v) => ({ ...v, editorCollapsed: false }))}
      onResize={(value) => {
        const isReset = getIsInRange({ targetValue: 50, diff: 1, value });

        if (!state.isReset && isReset) {
          setState((v) => ({ ...v, isReset }));
        }

        if (state.isReset && !isReset) {
          setState((v) => ({ ...v, isReset: false }));
        }
      }}
      ref={setEditorPanelHandle}
    >
      {children}
    </ResizablePanel>
  );
}

export function EditorOutputResizePanel({ children }: React.PropsWithChildren) {
  const [state, setState] = useEditorLayoutState();
  const [, setPreviewPanelHandle] = usePreviewPanelHandle();

  return (
    <ResizablePanel
      collapsible
      collapsedSize={COLLAPSED_RESIZE_PANEL_SIZE}
      defaultSize={state.previewSize ?? DEFAULT_RESIZE_PANEL_SIZE}
      minSize={MIN_RESIZE_PANEL_SIZE}
      onCollapse={() => setState((v) => ({ ...v, previewCollapsed: true }))}
      onExpand={() => setState((v) => ({ ...v, previewCollapsed: false }))}
      ref={setPreviewPanelHandle}
    >
      {children}
    </ResizablePanel>
  );
}

export function EditorResizeHandle() {
  const [state, setState] = useEditorLayoutState();

  const {
    collapseEditorPanel,
    collapsePreviewPanel,
    toggleSplitViewMode,
    resetPanelSizes,
  } = useActions();

  const isHorizontal = state.direction === "horizontal";
  const isVertical = state.direction === "vertical";

  return (
    <ResizableHandle
      disabled={state.isDisabled}
      onDragging={(isDragging) => {
        setState((v) => ({ ...v, isDragging }));
      }}
    >
      <div
        onPointerEnter={() =>
          setState((v) => (v.isDragging ? v : { ...v, isDisabled: true }))
        }
        onPointerDown={() =>
          setState((v) => (v.isDragging ? v : { ...v, isDisabled: true }))
        }
        onPointerLeave={() => setState((v) => ({ ...v, isDisabled: false }))}
        onPointerCancel={() => setState((v) => ({ ...v, isDisabled: false }))}
        className={cn(
          "z-50 flex items-center justify-center gap-1 rounded-2xl border-4 bg-background p-1",
          isVertical &&
            state.editorCollapsed &&
            "translate-y-1/2 rounded-t-none",
          isVertical && state.previewCollapsed && "-translate-y-1/2 rounded-b-none", // prettier-ignore
          isHorizontal && state.editorCollapsed && "translate-x-1/2 rounded-l-none", // prettier-ignore
          isHorizontal && state.previewCollapsed && "-translate-x-1/2 rounded-r-none", // prettier-ignore
          isHorizontal ? "flex-col" : "h-14 flex-row",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={state.editorCollapsed}
              onClick={collapseEditorPanel}
            >
              {isHorizontal ? (
                <ArrowLeftFromLineIcon />
              ) : (
                <ArrowUpFromLineIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>
              Collapse editor{" "}
              <CommandShortcutSnippet>
                {collapseEditorPanelShortcut}
              </CommandShortcutSnippet>
            </p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={state.previewCollapsed}
              onClick={collapsePreviewPanel}
            >
              {isHorizontal ? (
                <ArrowRightFromLineIcon />
              ) : (
                <ArrowDownFromLineIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>
              Collapse preview{" "}
              <CommandShortcutSnippet>
                {collapsePreviewPanelShortcut}
              </CommandShortcutSnippet>
            </p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="ghost" onClick={toggleSplitViewMode}>
              {isHorizontal ? (
                <SquareSplitVerticalIcon />
              ) : (
                <SquareSplitHorizontalIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>
              Toggle split view direction{" "}
              <CommandShortcutSnippet>
                {toggleSplitViewModeShortcut}
              </CommandShortcutSnippet>
            </p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={state.isReset}
              onClick={resetPanelSizes}
            >
              <RotateCcwIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>
              Reset panel sizes{" "}
              <CommandShortcutSnippet>
                {resetEditorPanelSizesShortcut}
              </CommandShortcutSnippet>
            </p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="relative"
              disabled
              onClick={() => {}}
            >
              <SaveIcon />
              <AutoSaveLegend isFloating />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>
              Save note{" "}
              <CommandShortcutSnippet>
                {saveCurrentNoteShortcut}
              </CommandShortcutSnippet>
            </p>
            <hr className="my-1" />
            <div>
              <p>Autosave:</p>
              <ul>
                <li>
                  <AutoSaveLegend status="on" />
                  On
                </li>
                <li>
                  <AutoSaveLegend status="off" />
                  Off
                </li>
                <li>
                  <AutoSaveLegend status="unavailable" />
                  Unavailable
                </li>
              </ul>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </ResizableHandle>
  );
}

const autoSaveColors = {
  on: "bg-green-600",
  off: "bg-red-600",
  unavailable: "bg-amber-600",
};

function AutoSaveLegend({
  status,
  isFloating,
}: {
  status?: keyof typeof autoSaveColors;
  isFloating?: boolean;
}) {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [editorAutoSaveEnabled] = useEditorAutosave();

  return (
    <span
      className={cn(
        "pointer-events-none mr-2 inline-block size-3 rounded-full",
        isFloating && "absolute -right-1 top-1",
        !status && editorAutoSaveEnabled && autoSaveColors.on,
        !status && !editorAutoSaveEnabled && autoSaveColors.off,
        !status && !id && autoSaveColors.unavailable,
        status && autoSaveColors[status],
      )}
    />
  );
}

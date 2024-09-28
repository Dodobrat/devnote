import {
  ArrowDownFromLineIcon,
  ArrowLeftFromLineIcon,
  ArrowRightFromLineIcon,
  ArrowUpFromLineIcon,
  RotateCcwIcon,
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
  toggleSplitViewModeShortcut,
} from "~/constants/shortcuts";
import { useActions } from "~/hooks";
import {
  useEditorLayoutState,
  useEditorPanelHandle,
  usePreviewPanelHandle,
} from "~/hooks/store/editor";
import { cn, getIsInRange } from "~/lib/utils";

import { SaveNoteButton } from "./SaveNoteButton";

export function EditorResizableGroup({ children }: React.PropsWithChildren) {
  const [state, setState] = useEditorLayoutState();

  return (
    <ResizablePanelGroup
      direction={state.direction}
      className="max-w-full rounded-lg border bg-card"
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
          "z-50 flex items-center justify-center gap-0.5 rounded-2xl border-4 bg-background p-0.5 transition-all",
          isVertical && state.editorCollapsed && "translate-y-5",
          isVertical && state.previewCollapsed && "-translate-y-5",
          isHorizontal && state.editorCollapsed && "translate-x-5",
          isHorizontal && state.previewCollapsed && "-translate-x-5",
          isHorizontal ? "flex-col" : "flex-row",
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

        <SaveNoteButton />
      </div>
    </ResizableHandle>
  );
}

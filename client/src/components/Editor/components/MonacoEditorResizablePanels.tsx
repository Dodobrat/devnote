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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import {
  useEditorLayoutState,
  useEditorPanelHandle,
  usePreviewPanelHandle,
} from "~/hooks/store/editor";
import { cn, getIsInRange } from "~/lib/utils";

export function EditorResizableGroup({
  children,
}: {
  children: React.ReactNode;
}) {
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

const DEFAULT_RESIZE_PANEL_SIZE = 50;
const COLLAPSED_RESIZE_PANEL_SIZE = 0;
const MIN_RESIZE_PANEL_SIZE = 20;

export function EditorResizePanel({ children }: { children: React.ReactNode }) {
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

export function EditorOutputResizePanel({
  children,
}: {
  children: React.ReactNode;
}) {
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
  const [editorPanelHandle] = useEditorPanelHandle();
  const [previewPanelHandle] = usePreviewPanelHandle();

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
          "z-50 flex items-center justify-center gap-1 rounded-lg border-4 bg-background p-1",
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
              onClick={() => editorPanelHandle?.collapse()}
            >
              {isHorizontal ? (
                <ArrowLeftFromLineIcon />
              ) : (
                <ArrowUpFromLineIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>Collapse editor</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setState((v) => ({
                  ...v,
                  isDisabled: false,
                  direction:
                    v.direction === "horizontal" ? "vertical" : "horizontal",
                }));
              }}
            >
              {isHorizontal ? (
                <SquareSplitHorizontalIcon />
              ) : (
                <SquareSplitVerticalIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>Toggle split view direction</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={state.isReset}
              onClick={() =>
                editorPanelHandle?.resize(DEFAULT_RESIZE_PANEL_SIZE)
              }
            >
              <RotateCcwIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>Reset panel sizes</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation={state.direction} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              disabled={state.previewCollapsed}
              onClick={() => previewPanelHandle?.collapse()}
            >
              {isHorizontal ? (
                <ArrowRightFromLineIcon />
              ) : (
                <ArrowDownFromLineIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={isHorizontal ? "right" : "top"}>
            <p>Collapse preview</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </ResizableHandle>
  );
}

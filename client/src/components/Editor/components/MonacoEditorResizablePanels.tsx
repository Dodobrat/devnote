import { ImperativePanelHandle } from "react-resizable-panels";
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
} from "~/components/ui";
import { storeKeys, usePersisQueryStore, useQueryStore } from "~/hooks/store";
import { cn, getIsInRange } from "~/lib/utils";

import { defaultResizeState } from "../types";

export function EditorResizableGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = usePersisQueryStore(
    storeKeys.editorLayout,
    defaultResizeState,
  );

  console.log({ state });

  return (
    <ResizablePanelGroup
      direction={state!.direction}
      className="max-w-full md:rounded-lg md:border"
      onLayout={([leftSize, rightSize]) => {
        setState((v) => ({ ...v, leftSize, rightSize }));
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
  const [state, setState] = usePersisQueryStore(
    storeKeys.editorLayout,
    defaultResizeState,
  );

  const [, setPanel] = useQueryStore<ImperativePanelHandle | null>(
    storeKeys.editorLayoutLeftPanel,
    null,
  );

  return (
    <ResizablePanel
      collapsible
      collapsedSize={COLLAPSED_RESIZE_PANEL_SIZE}
      defaultSize={state.leftSize ?? DEFAULT_RESIZE_PANEL_SIZE}
      minSize={MIN_RESIZE_PANEL_SIZE}
      onCollapse={() => {
        setState((v) => ({ ...v, leftCollapsed: true }));
      }}
      onExpand={() => {
        setState((v) => ({ ...v, leftCollapsed: false }));
      }}
      onResize={(value) => {
        const isReset = getIsInRange({ targetValue: 50, diff: 1, value });

        if (!state.isReset && isReset) {
          setState((v) => ({ ...v, isReset }));
        }

        if (state.isReset && !isReset) {
          setState((v) => ({ ...v, isReset: false }));
        }
      }}
      ref={setPanel}
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
  const [state, setState] = usePersisQueryStore(
    storeKeys.editorLayout,
    defaultResizeState,
  );

  const [, setPanel] = useQueryStore<ImperativePanelHandle | null>(
    storeKeys.editorLayoutRightPanel,
    null,
  );

  return (
    <ResizablePanel
      collapsible
      collapsedSize={COLLAPSED_RESIZE_PANEL_SIZE}
      defaultSize={state.rightSize ?? DEFAULT_RESIZE_PANEL_SIZE}
      minSize={MIN_RESIZE_PANEL_SIZE}
      onCollapse={() => {
        setState((v) => ({ ...v, rightCollapsed: true }));
      }}
      onExpand={() => {
        setState((v) => ({ ...v, rightCollapsed: false }));
      }}
      ref={setPanel}
    >
      {children}
    </ResizablePanel>
  );
}

export function EditorResizeHandle() {
  const [state, setState] = usePersisQueryStore(
    storeKeys.editorLayout,
    defaultResizeState,
  );

  const [leftPanel] = useQueryStore<ImperativePanelHandle | null>(
    storeKeys.editorLayoutLeftPanel,
    null,
  );
  const [rightPanel] = useQueryStore<ImperativePanelHandle | null>(
    storeKeys.editorLayoutRightPanel,
    null,
  );

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
          isVertical && state.leftCollapsed && "translate-y-1/2 rounded-t-none",
          isVertical && state.rightCollapsed && "-translate-y-1/2 rounded-b-none", // prettier-ignore
          isHorizontal && state.leftCollapsed && "translate-x-1/2 rounded-l-none", // prettier-ignore
          isHorizontal && state.rightCollapsed && "-translate-x-1/2 rounded-r-none", // prettier-ignore
          isHorizontal ? "flex-col" : "h-14 flex-row",
        )}
      >
        <Button
          size="icon"
          variant="ghost"
          disabled={state.leftCollapsed}
          onClick={() => leftPanel?.collapse()}
        >
          {isHorizontal ? <ArrowLeftFromLineIcon /> : <ArrowUpFromLineIcon />}
        </Button>

        <Separator orientation={state.direction} />

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
        <Separator orientation={state.direction} />
        <Button
          size="icon"
          variant="ghost"
          disabled={state.isReset}
          onClick={() => leftPanel?.resize(DEFAULT_RESIZE_PANEL_SIZE)}
        >
          <RotateCcwIcon />
        </Button>
        <Separator orientation={state.direction} />
        <Button
          size="icon"
          variant="ghost"
          disabled={state.rightCollapsed}
          onClick={() => rightPanel?.collapse()}
        >
          {isHorizontal ? (
            <ArrowRightFromLineIcon />
          ) : (
            <ArrowDownFromLineIcon />
          )}
        </Button>
      </div>
    </ResizableHandle>
  );
}

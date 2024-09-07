import { ImperativePanelHandle } from "react-resizable-panels";

import { ResizablePanelGroupProps } from "~/components/ui";

export type EditorResizablePanelsLayout = {
  direction: ResizablePanelGroupProps["direction"];
  leftCollapsed: boolean;
  leftSize: number;
  rightCollapsed: boolean;
  rightSize: number;
  isReset: boolean;
  isDisabled: boolean;
  isDragging: boolean;
};

export const defaultResizeState: EditorResizablePanelsLayout = {
  direction: "horizontal",
  leftCollapsed: false,
  leftSize: 50,
  rightCollapsed: false,
  rightSize: 50,
  isReset: true,
  isDisabled: false,
  isDragging: false,
};

export type EditorResizablePanelsRefs = {
  left: ImperativePanelHandle | null;
  right: ImperativePanelHandle | null;
};

export const defaultResizePanels: EditorResizablePanelsRefs = {
  left: null,
  right: null,
};

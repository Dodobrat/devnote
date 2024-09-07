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

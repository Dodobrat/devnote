import { EditorKeyboardShortcuts } from "../KeyboardShortcuts";
import { PageCardBase } from "../Layout";
import {
  EditorOutput,
  EditorOutputResizePanel,
  EditorResizableGroup,
  EditorResizeHandle,
  EditorResizePanel,
  MonacoEditor,
} from "./components";

export function Editor() {
  return (
    <PageCardBase>
      <EditorResizableGroup>
        <EditorResizePanel>
          <MonacoEditor />
        </EditorResizePanel>

        <EditorResizeHandle />

        <EditorOutputResizePanel>
          <EditorOutput />
        </EditorOutputResizePanel>
      </EditorResizableGroup>

      <EditorKeyboardShortcuts />
    </PageCardBase>
  );
}

import { MonacoInstanceProvider } from "~/context";

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
        <MonacoInstanceProvider>
          <EditorResizePanel>
            <MonacoEditor />
          </EditorResizePanel>

          <EditorResizeHandle />
        </MonacoInstanceProvider>

        <EditorOutputResizePanel>
          <EditorOutput />
        </EditorOutputResizePanel>
      </EditorResizableGroup>

      <EditorKeyboardShortcuts />
    </PageCardBase>
  );
}

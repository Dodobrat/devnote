import { MonacoInstanceProvider } from "~/context";

import { EditorKeyboardShortcuts } from "../KeyboardShortcuts";
import { Page } from "../Layout";
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
    <Page>
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
    </Page>
  );
}

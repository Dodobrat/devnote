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
    <div className="isolate grow overflow-hidden md:p-4 md:pl-0">
      <EditorResizableGroup>
        <EditorResizePanel>
          <MonacoEditor />
        </EditorResizePanel>

        <EditorResizeHandle />

        <EditorOutputResizePanel>
          <EditorOutput />
        </EditorOutputResizePanel>
      </EditorResizableGroup>
    </div>
  );
}

import { CodeMirrorInstanceProvider } from "~/context";

import { Page } from "../Layout";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor";
import { SaveNoteButton } from "./components/SaveNoteButton";

export function Editor() {
  return (
    <Page.Card>
      <CodeMirrorInstanceProvider>
        <CodeMirrorEditor />
        <div className="absolute right-5 top-5 z-50">
          <SaveNoteButton />
        </div>
      </CodeMirrorInstanceProvider>
    </Page.Card>
  );
}

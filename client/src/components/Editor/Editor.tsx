import { CodeMirrorInstanceProvider } from "~/context";

import { Page } from "../Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui";
import { CodeMirrorEditor } from "./components/CodeMirrorEditor";
import { EditorOutput } from "./components/CodeMirrorEditorOutput";
import { SaveNoteButton } from "./components/SaveNoteButton";

export function Editor() {
  return (
    <Page.Card>
      <CodeMirrorInstanceProvider>
        <Tabs
          defaultValue="editor"
          className="flex h-full flex-col overflow-hidden"
        >
          <div className="flex justify-between gap-4 border-b p-2">
            <TabsList className="h-auto">
              <TabsTrigger value="editor" className="h-full">
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="h-full">
                Preview
              </TabsTrigger>
            </TabsList>
            <SaveNoteButton />
          </div>
          <TabsContent value="editor" className="mt-0 grow overflow-auto">
            <CodeMirrorEditor />
          </TabsContent>
          <TabsContent value="preview" className="mt-0 grow overflow-auto">
            <EditorOutput />
          </TabsContent>
        </Tabs>
      </CodeMirrorInstanceProvider>
    </Page.Card>
  );
}

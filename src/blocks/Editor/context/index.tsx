import { createContext, useContext, useState } from "react";
import { type EditorView } from "codemirror";

type CodeMirrorInstanceContextState = {
  codeMirrorInstance: EditorView | undefined;
  setCodeMirrorInstance: React.Dispatch<
    React.SetStateAction<EditorView | undefined>
  >;
};

const CodeMirrorInstanceContext = createContext<
  CodeMirrorInstanceContextState | undefined
>(undefined);

export function CodeMirrorInstanceProvider({
  children,
}: React.PropsWithChildren) {
  const [codeMirrorInstance, setCodeMirrorInstance] = useState<EditorView>();

  const value: CodeMirrorInstanceContextState = {
    codeMirrorInstance,
    setCodeMirrorInstance,
  };

  return (
    <CodeMirrorInstanceContext.Provider value={value}>
      {children}
    </CodeMirrorInstanceContext.Provider>
  );
}

export function useCodeMirrorInstance() {
  const context = useContext(CodeMirrorInstanceContext);

  if (!context) {
    throw new Error(
      "useCodeMirrorInstance must be used within a CodeMirrorInstanceProvider",
    );
  }

  return context;
}

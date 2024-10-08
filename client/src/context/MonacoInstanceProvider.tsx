import { createContext, useContext, useState } from "react";

import { MonacoStandaloneEditor } from "~/types/notes";

type MonacoInstanceContextState = {
  monacoInstance: MonacoStandaloneEditor;
  setMonacoInstance: React.Dispatch<
    React.SetStateAction<MonacoStandaloneEditor>
  >;
};

const MonacoInstanceContext = createContext<
  MonacoInstanceContextState | undefined
>(undefined);

export function MonacoInstanceProvider({ children }: React.PropsWithChildren) {
  const [monacoInstance, setMonacoInstance] =
    useState<MonacoStandaloneEditor>(null);

  const value = { monacoInstance, setMonacoInstance };

  return (
    <MonacoInstanceContext.Provider value={value}>
      {children}
    </MonacoInstanceContext.Provider>
  );
}

export function useMonacoInstance() {
  const context = useContext(MonacoInstanceContext);

  if (!context) {
    throw new Error(
      "useMonacoInstance must be used within a MonacoInstanceProvider",
    );
  }

  return context;
}

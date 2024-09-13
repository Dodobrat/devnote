import { useCallback, useMemo } from "react";
import {
  NoInfer,
  QueryKey,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { webStorage } from "~/lib/utils";

export const storeKeys = {
  all: "devnote",
  commandPaletteOpenState: "devnote.commandPaletteOpenState",
  sidebarState: "devnote.sidebarState",
  editorNote: "devnote.editor.note",
  editorAutosave: "devnote.editor.autosave",
  editorLayout: "devnote.editor.layout",
  editorLayoutEditorPanel: "devnote.editor.layout.editorPanel",
  editorLayoutPreviewPanel: "devnote.editor.layout.previewPanel",
} as const;

function generateQueryKey(key: string): QueryKey {
  return key.split(".");
}

export function useQueryStore<T>(storeKey: string, initialData: T) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: generateQueryKey(storeKey),
    initialData,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      queryClient.setQueryData<T>(generateQueryKey(storeKey), (prev) => {
        const valueToStore = v instanceof Function ? v(prev as NoInfer<T>) : v;
        return valueToStore;
      });
    },
    [queryClient, storeKey],
  );

  return useMemo(() => [data!, set] as const, [data, set]);
}

export function usePersisQueryStore<T>(storeKey: string, initialData: T) {
  const queryClient = useQueryClient();

  const initial = webStorage.getItem<T>(storeKey) ?? initialData;

  const { data } = useQuery({
    queryKey: generateQueryKey(storeKey),
    initialData: initial,
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      queryClient.setQueryData<T>(generateQueryKey(storeKey), (prev) => {
        const valueToStore = v instanceof Function ? v(prev as NoInfer<T>) : v;
        webStorage.setItem<T>(storeKey, valueToStore);
        return valueToStore;
      });
    },
    [queryClient, storeKey],
  );

  return useMemo(() => [data!, set] as const, [data, set]);
}

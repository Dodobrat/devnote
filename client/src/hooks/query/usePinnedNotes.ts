import { useInfiniteQuery } from "@tanstack/react-query";

import { NotesApi } from "~/api";

export function usePinnedNotes() {
  return useInfiniteQuery({
    queryKey: ["notes", "pinned"],
    queryFn: () => NotesApi.getPinnedPaginated(),
    getNextPageParam: () => undefined,
    initialPageParam: 0,
  });
}

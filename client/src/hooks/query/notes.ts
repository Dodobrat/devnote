import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { NotesApi } from "~/api";
import { NoteSchemaType } from "~/types";

const notesQueryKeys = {
  all: () => ["notes"],
  pinnedList: () => [...notesQueryKeys.all(), "pinned"],
  regularList: () => [...notesQueryKeys.all(), "regular"],
  byIdRoot: () => [...notesQueryKeys.all(), "byId"],
  byId: (id: NoteSchemaType["id"]) => [...notesQueryKeys.byIdRoot(), id],
};

export function usePinnedNotes() {
  return useInfiniteQuery({
    queryKey: notesQueryKeys.pinnedList(),
    queryFn: ({ pageParam }) => {
      return NotesApi.getPinnedPaginated({ cursor: pageParam });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.data?.meta?.hasMore) return undefined;
      return lastPage.data.meta.cursor;
    },
  });
}

export function useRegularNotes() {
  return useInfiniteQuery({
    queryKey: notesQueryKeys.regularList(),
    queryFn: ({ pageParam }) => {
      return NotesApi.getOthersPaginated({ cursor: pageParam });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.data?.meta?.hasMore) return undefined;
      return lastPage.data.meta.cursor;
    },
  });
}

export function useNote(id: NoteSchemaType["id"]) {
  return useQuery({
    queryKey: notesQueryKeys.byId(id),
    queryFn: () => NotesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  return useMutation({
    mutationFn: NotesApi.create,
  });
}

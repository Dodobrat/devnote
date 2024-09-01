import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { NotesApi } from "~/api";
import { NoteSchemaType } from "~/types";

export function usePinnedNotes() {
  return useInfiniteQuery({
    queryKey: ["notes", "pinned"],
    queryFn: ({ pageParam }) =>
      NotesApi.getPinnedPaginated({ cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.data?.meta?.hasMore ? lastPage.data.meta.cursor : undefined,
    initialPageParam: 0,
  });
}

export function useNotes() {
  return useInfiniteQuery({
    queryKey: ["notes", "regular"],
    queryFn: ({ pageParam }) =>
      NotesApi.getOthersPaginated({ cursor: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.data?.meta?.hasMore ? lastPage.data.meta.cursor : undefined,
    initialPageParam: 0,
  });
}

export function useNote(id: NoteSchemaType["id"]) {
  return useQuery({
    queryKey: ["notes", "single", id],
    queryFn: () => NotesApi.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  return useMutation({
    mutationFn: NotesApi.create,
  });
}

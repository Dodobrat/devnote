import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { NotesApi } from "~/api";
import { NoteSchemaType } from "~/types";

export const notesQueryKeys = {
  all: () => ["notes"],
  list: () => [...notesQueryKeys.all(), "list"],
  byIdRoot: () => [...notesQueryKeys.all(), "byId"],
  byId: (id: NoteSchemaType["id"]) => [...notesQueryKeys.byIdRoot(), id],
};

export function useNotes() {
  return useInfiniteQuery({
    queryKey: notesQueryKeys.list(),
    queryFn: ({ pageParam }) => NotesApi.getPaginated({ cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.cursor;
    },
    select: (data) => {
      return data.pages.flatMap((page) => page.data);
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

export function useUpdateNote() {
  return useMutation({
    mutationFn: NotesApi.update,
  });
}

export function useUpdateNotePinState() {
  return useMutation({
    mutationFn: NotesApi.updatePinState,
  });
}

export function useUpdateNoteOrder() {
  return useMutation({
    mutationFn: NotesApi.updateOrder,
  });
}

export function useDeleteNote() {
  return useMutation({
    mutationFn: NotesApi.delete,
  });
}

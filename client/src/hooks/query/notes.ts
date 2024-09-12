import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { NotesApi } from "~/api";
import {
  NoteSchemaType,
  PaginatedNotesSchemaType,
  PaginatedSearchQuerySchemaType,
} from "~/types";

export const notesQueryKeys = {
  all: () => ["notes"],
  list: () => [...notesQueryKeys.all(), "list"],
  listQuery: (query: PaginatedSearchQuerySchemaType["query"]) => [
    ...notesQueryKeys.list(),
    query,
  ],
  byIdRoot: () => [...notesQueryKeys.all(), "byId"],
  byId: (id: NoteSchemaType["id"]) => [...notesQueryKeys.byIdRoot(), id],
};

export function useNotes(query?: PaginatedSearchQuerySchemaType["query"]) {
  return useInfiniteQuery({
    queryKey: notesQueryKeys.listQuery(query),
    queryFn: ({ pageParam }) =>
      NotesApi.getPaginated({ cursor: pageParam, query }),
    enabled: typeof query === "string" ? Boolean(query.length >= 2) : true,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotesApi.update,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<InfiniteData<PaginatedNotesSchemaType>>(
        notesQueryKeys.list(),
        (prev) => {
          if (!prev) return prev;

          const updated = prev.pages.map((p) => ({
            ...p,
            data: p.data.map((n) =>
              n.id === variables.id ? { ...n, ...variables } : n,
            ),
          }));

          return { ...prev, pages: updated };
        },
      );
    },
  });
}

export function useUpdateNotePinState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotesApi.updatePinState,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useUpdateNoteOrder() {
  return useMutation({
    mutationFn: NotesApi.updateOrder,
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: NotesApi.delete,
    onSuccess: () => {
      // TODO: see if order is updated
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

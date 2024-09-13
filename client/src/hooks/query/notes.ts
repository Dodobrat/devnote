import { useCallback } from "react";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { NotesApi } from "~/api";
import { AppRoutes } from "~/routes";
import {
  MonacoStandaloneEditor,
  NoteSchemaType,
  PaginatedNotesSchemaType,
  PaginatedSearchQuerySchemaType,
} from "~/types";

import { useEditorNotePrevState } from "../store/editor";

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
            data: p.data.map((n) => {
              if (n.id !== variables.id) return n;
              return { ...n, ...variables };
            }),
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

export function useSaveNote() {
  const navigate = useNavigate();

  const updateMutation = useUpdateNote();
  const createMutation = useCreateNote();

  const params = useParams<{ id: string }>();
  const id = parseInt(params.id!);

  const { setPrevNote } = useEditorNotePrevState();

  return useCallback(
    (editor: MonacoStandaloneEditor) => {
      const cursorPosition = editor?.getPosition();

      if (id)
        return updateMutation.mutate(
          { id, note: editor?.getValue() },
          {
            onSuccess: (_, variables) => {
              setPrevNote(variables.note || "");
            },
          },
        );

      return createMutation.mutate(
        { note: editor?.getValue() || "" },
        {
          onSuccess: (res) => {
            toast.success(`${res.previewTitle} was created`);

            navigate(generatePath(AppRoutes.NoteById, { id: String(res.id) }), {
              state: cursorPosition,
            });
          },
        },
      );
    },
    [createMutation, id, navigate, setPrevNote, updateMutation],
  );
}

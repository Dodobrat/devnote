import { useCallback } from "react";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { LocalNotesAPI } from "~/api";
import { AppRoutes } from "~/routes";
import { MonacoStandaloneEditor, NoteSchemaType } from "~/types";

import { useEditorNotePrevState } from "../store/editor";

export const notesQueryKeys = {
  all: () => ["notes"],
  list: () => [...notesQueryKeys.all(), "list"],
  pinnedList: () => [...notesQueryKeys.list(), "pinned"],
  unpinnedList: () => [...notesQueryKeys.list(), "unpinned"],
  byQuery: (query: string) => [...notesQueryKeys.list(), "search", query],
  byIdRoot: () => [...notesQueryKeys.all(), "byId"],
  byId: (id: NoteSchemaType["id"]) => [...notesQueryKeys.byIdRoot(), id],
};

export function usePinnedNotes() {
  return useInfiniteQuery({
    queryKey: notesQueryKeys.pinnedList(),
    queryFn: ({ pageParam }) => {
      // logic when to switch to actual api
      return LocalNotesAPI.getPaginatedPinned(undefined, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.cursor;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
  });
}

export function useUnPinnedNotes() {
  return useInfiniteQuery({
    queryKey: notesQueryKeys.unpinnedList(),
    queryFn: ({ pageParam }) => {
      // logic when to switch to actual api
      return LocalNotesAPI.getPaginated(undefined, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.cursor;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
  });
}

export function useNote(id: NoteSchemaType["id"]) {
  return useQuery({
    queryKey: notesQueryKeys.byId(id),
    queryFn: () => {
      // logic when to switch to actual api
      return LocalNotesAPI.getById(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateNote() {
  return useMutation({
    mutationFn: LocalNotesAPI.create,
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LocalNotesAPI.update,
    onSuccess: (_, variables) => {
      // determine which cache to update
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });

      // queryClient.setQueryData<InfiniteData<PaginatedNotesSchemaType>>(
      //   notesQueryKeys.list(),
      //   (prev) => {
      //     if (!prev) return prev;

      //     const updated = prev.pages.map((p) => ({
      //       ...p,
      //       data: p.data.map((n) => {
      //         if (n.id !== variables.id) return n;
      //         return { ...n, ...variables };
      //       }),
      //     }));

      //     return { ...prev, pages: updated };
      //   },
      // );
    },
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LocalNotesAPI.pin,
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useUnpinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LocalNotesAPI.unpin,
    onSuccess: (_, variables) => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LocalNotesAPI.delete,
    onSuccess: () => {
      // TODO: see if order is updated
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useReorderPinnedNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LocalNotesAPI.reorderPinned,
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.pinnedList(),
      });
    },
  });
}

export function useReorderUnpinnedNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: LocalNotesAPI.reorder,
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.unpinnedList(),
      });
    },
  });
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: notesQueryKeys.byQuery(query),
    queryFn: () => {
      // logic when to switch to actual api
      return LocalNotesAPI.search(query);
    },
    enabled: Boolean(query),
  });
}

export function useSaveNote() {
  const navigate = useNavigate();

  const updateMutation = useUpdateNote();
  const createMutation = useCreateNote();

  const params = useParams<{ id: string }>();
  const id = params.id!;

  const [, setPrevNote] = useEditorNotePrevState();

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

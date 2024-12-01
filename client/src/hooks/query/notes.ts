import { useCallback } from "react";
import { generatePath, useNavigate, useParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { EditorView } from "codemirror";
import { toast } from "sonner";

import { LocalNotesAPI } from "~/api";
import { getCurrentCursorPosition } from "~/components/Editor/components/CodeMirrorEditor";
import { AppRoutes } from "~/routes";
import { NoteSchemaType, UpdateNoteSchemaType } from "~/types/notes";

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
    mutationFn: (body: Pick<NoteSchemaType, "note">) => {
      // logic when to switch to actual api
      return LocalNotesAPI.create(body);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateNoteSchemaType) => {
      // logic when to switch to actual api
      return LocalNotesAPI.update(body);
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: NoteSchemaType["id"]) => {
      // logic when to switch to actual api
      return LocalNotesAPI.pin(id);
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useUnpinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: NoteSchemaType["id"]) => {
      // logic when to switch to actual api
      return LocalNotesAPI.unpin(id);
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: NoteSchemaType["id"]) => {
      // logic when to switch to actual api
      return LocalNotesAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
    },
  });
}

export function useReorderPinnedNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: NoteSchemaType["id"][]) => {
      // logic when to switch to actual api
      return LocalNotesAPI.reorderPinned(ids);
    },
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
    mutationFn: (ids: NoteSchemaType["id"][]) => {
      // logic when to switch to actual api
      return LocalNotesAPI.reorder(ids);
    },
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
    (editor: EditorView | undefined) => {
      if (!editor) return;
      const cursorPosition = getCurrentCursorPosition(editor);

      if (id) {
        return updateMutation.mutate(
          { id, note: editor.state.doc.toString() },
          {
            onSuccess: (_, variables) => {
              setPrevNote(variables.note || "");
            },
          },
        );
      }

      return createMutation.mutate(
        { note: editor.state.doc.toString() },
        {
          onSuccess: (res) => {
            toast.success(`${res.title} was created`);

            navigate(generatePath(AppRoutes.NoteById, { id: res.id }), {
              state: { cursorPosition },
            });
          },
        },
      );
    },
    [createMutation, id, navigate, setPrevNote, updateMutation],
  );
}

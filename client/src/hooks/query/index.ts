import { useCallback } from "react";
import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type EditorView } from "codemirror";
import { toast } from "sonner";

import { LocalNotesAPI } from "~/api";
import { getCurrentCursorPosition } from "~/blocks/Editor/components/CodeMirrorEditor";
import { type NoteSchemaType, type UpdateNoteSchemaType } from "~/types/notes";

import { useEditorNotePrevStateAtom } from "../store";

export const notesQueryKeys = {
  all: () => ["notes"],
  list: () => [...notesQueryKeys.all(), "list"],
  pinnedList: () => [...notesQueryKeys.list(), "pinned"],
  unpinnedList: () => [...notesQueryKeys.list(), "unpinned"],
  byQuery: (query: string) => [...notesQueryKeys.list(), "search", query],
  byIdRoot: () => [...notesQueryKeys.all(), "byId"],
  byId: (id: NoteSchemaType["id"]) => [...notesQueryKeys.byIdRoot(), id],
};

export function pinnedNotesQueryOptions() {
  return infiniteQueryOptions({
    queryKey: notesQueryKeys.pinnedList(),
    queryFn: ({ pageParam }) => {
      console.log("GET: pinned notes", { pageParam });

      // logic when to switch to actual api
      return LocalNotesAPI.getPaginatedPinned(undefined, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.cursor;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
    placeholderData: keepPreviousData,
  });
}

export function usePinnedNotes() {
  return useInfiniteQuery(pinnedNotesQueryOptions());
}

export function unPinnedNotesQueryOptions() {
  return infiniteQueryOptions({
    queryKey: notesQueryKeys.unpinnedList(),
    queryFn: ({ pageParam }) => {
      console.log("GET: unpinned notes", { pageParam });

      // logic when to switch to actual api
      return LocalNotesAPI.getPaginated(undefined, pageParam);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.cursor;
    },
    select: (data) => data.pages.flatMap((page) => page.data),
    placeholderData: keepPreviousData,
  });
}

export function useUnPinnedNotes() {
  return useInfiniteQuery(unPinnedNotesQueryOptions());
}

export function noteByIdQueryOptions({ id }: Pick<NoteSchemaType, "id">) {
  return queryOptions({
    queryKey: notesQueryKeys.byId(id),
    queryFn: () => {
      console.log("GET: note by id", { id });

      // logic when to switch to actual api
      return LocalNotesAPI.getById(id);
    },
    enabled: Boolean(id),
  });
}

export function useNote(id: NoteSchemaType["id"]) {
  return useQuery(noteByIdQueryOptions({ id }));
}

export function searchNotesQueryOptions({ query }: { query: string }) {
  return queryOptions({
    queryKey: notesQueryKeys.byQuery(query),
    queryFn: () => {
      console.log("GET: search notes", { query });

      // logic when to switch to actual api
      return LocalNotesAPI.search(query);
    },
    enabled: Boolean(query),
    placeholderData: keepPreviousData,
  });
}

export function useSearchNotes(query: string) {
  return useQuery(searchNotesQueryOptions({ query }));
}

export function useCreateNote() {
  return useMutation({
    mutationFn: (body: Pick<NoteSchemaType, "note">) => {
      console.log("POST: create note", { body });

      // logic when to switch to actual api
      return LocalNotesAPI.create(body);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateNoteSchemaType) => {
      console.log("PUT: update note", { body });

      // logic when to switch to actual api
      return LocalNotesAPI.update(body);
    },
    onSuccess: (_, payload) => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.byId(payload.id),
      });
    },
  });
}

export function usePinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: NoteSchemaType["id"]) => {
      console.log("PATCH: pin note", { id });

      // logic when to switch to actual api
      return LocalNotesAPI.pin(id);
    },
    onSuccess: (_, payload) => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.byId(payload),
      });
    },
  });
}

export function useUnpinNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: NoteSchemaType["id"]) => {
      console.log("PATCH: unpin note", { id });

      // logic when to switch to actual api
      return LocalNotesAPI.unpin(id);
    },
    onSuccess: (_, payload) => {
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.byId(payload),
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: NoteSchemaType["id"]) => {
      console.log("DELETE: delete note", { id });

      // logic when to switch to actual api
      return LocalNotesAPI.delete(id);
    },
    onSuccess: (_, payload) => {
      toast.success("Note deleted");
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });
      if (routerState.location.pathname.startsWith(`/note/${payload}`)) {
        navigate({ to: "/note/new", replace: true });
      }
    },
  });
}

export function useReorderPinnedNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: NoteSchemaType["id"][]) => {
      console.log("PUT: reorder pinned notes", { ids });

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
      console.log("PUT: reorder unpinned notes", { ids });

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

export function useSaveNote(noteData?: Pick<NoteSchemaType, "id">) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: update } = useUpdateNote();
  const { mutate: create } = useCreateNote();

  const [, setPrevNote] = useEditorNotePrevStateAtom();

  return useCallback(
    (editor: EditorView | undefined) => {
      if (!editor) return;
      const cursorPosition = getCurrentCursorPosition(editor);

      if (noteData?.id) {
        return update(
          { id: noteData.id, note: editor.state.doc.toString() },
          {
            onSuccess: (_, variables) => {
              setPrevNote(variables.note || "");
            },
          },
        );
      }

      return create(
        { note: editor.state.doc.toString() },
        {
          onSuccess: (res) => {
            toast.success(`${res.title} was created`);

            queryClient.refetchQueries({
              queryKey: notesQueryKeys.list(),
            });

            navigate({
              to: "/note/$noteId",
              params: { noteId: res.id },
              state: { cursorPosition },
              ignoreBlocker: true,
            });
          },
        },
      );
    },
    [noteData?.id, create, update, setPrevNote, queryClient, navigate],
  );
}

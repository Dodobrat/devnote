import { useCallback } from "react";
import {
  type InfiniteData,
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  type Updater,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { type EditorView } from "codemirror";
import JSZip from "jszip";
import { toast } from "sonner";

import { LocalNotesAPI } from "~/api";
import { getCurrentCursorPosition } from "~/blocks/Editor/components/CodeMirrorEditor";
import {
  type NoteSchemaType,
  type PaginatedNotesSchemaType,
  type UpdateNoteSchemaType,
} from "~/types/notes";

import { useEditorNotePrevStateAtom } from "../store";

// MARK: Notes Query keys

export const notesQueryKeys = {
  all: () => ["notes"],
  list: () => [...notesQueryKeys.all(), "list"],
  pinnedList: () => [...notesQueryKeys.list(), "pinned"],
  unpinnedList: () => [...notesQueryKeys.list(), "unpinned"],
  byQuery: (query: string) => [...notesQueryKeys.list(), "search", query],
  byIdRoot: () => [...notesQueryKeys.all(), "byId"],
  byId: (id: NoteSchemaType["id"]) => [...notesQueryKeys.byIdRoot(), id],
};

// MARK: List Notes

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

// MARK: Note by id

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

// MARK: Note operations

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
  return useMutation({
    mutationFn: (body: UpdateNoteSchemaType) => {
      console.log("PUT: update note", { body });

      // logic when to switch to actual api
      return LocalNotesAPI.update(body);
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
        navigate({ to: "/note/new", replace: true, ignoreBlocker: true });
      }
    },
  });
}

export function useBulkDeleteNotes() {
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (ids: NoteSchemaType["id"][]) => {
      console.log("DELETE: bulk delete notes", { ids });

      // logic when to switch to actual api
      return LocalNotesAPI.bulkDelete(ids);
    },
    onSuccess: (_, payload) => {
      toast.success(
        `${payload.length} Note${payload.length > 1 ? "s" : ""} deleted`,
      );
      queryClient.refetchQueries({
        queryKey: notesQueryKeys.list(),
      });

      const isNoteByIdRoute = Boolean(
        routerState.matches.find((v) => v.routeId === "/note/$noteId"),
      );
      if (!isNoteByIdRoute) return;

      const currentPathNoteId = routerState.location.pathname.replace(
        "/note/",
        "",
      );
      if (payload.includes(currentPathNoteId)) {
        navigate({ to: "/note/new", replace: true, ignoreBlocker: true });
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

export function useSaveNote(note?: NoteSchemaType) {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate: update } = useUpdateNote();
  const { mutate: create } = useCreateNote();

  const [, setPrevNote] = useEditorNotePrevStateAtom();

  return useCallback(
    (editor: EditorView | undefined) => {
      if (!editor) return;
      const cursorPosition = getCurrentCursorPosition(editor);

      if (note?.id) {
        return update(
          { id: note.id, note: editor.state.doc.toString() },
          {
            onSuccess: (_, variables) => {
              setPrevNote(variables.note || "");

              if (note.isPinned) {
                queryClient.setQueryData(
                  notesQueryKeys.pinnedList(),
                  updateNoteListCache(variables),
                );
              } else {
                queryClient.setQueryData(
                  notesQueryKeys.unpinnedList(),
                  updateNoteListCache(variables),
                );
              }
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
    [
      note?.id,
      note?.isPinned,
      create,
      update,
      setPrevNote,
      queryClient,
      navigate,
    ],
  );
}

function updateNoteListCache(
  variables: UpdateNoteSchemaType,
): Updater<
  InfiniteData<PaginatedNotesSchemaType>,
  InfiniteData<PaginatedNotesSchemaType>
> {
  return (data) => {
    if (!data) return data;

    const updatedPages = data.pages.map((n) => ({
      ...n,
      data: n.data.map((x) => {
        if (x.id !== variables.id) return x;
        return { ...x, note: variables.note || "" };
      }),
    }));

    return {
      pages: updatedPages,
      pageParams: data.pageParams,
    };
  };
}

export function useExportNotes() {
  return useMutation({
    mutationFn: async (data: Record<string, NoteSchemaType>) => {
      console.log("ACTION: export notes in .zip");

      const zip = new JSZip();

      const notes = Object.values(data);
      // Add each note to the ZIP archive as a separate Markdown file
      notes.forEach((note, index) => {
        const parsedTitle = toSnakeCase(note.title);
        // Create a file with a .md extension
        zip.file(`${parsedTitle || `note_${index + 1}`}.md`, note.note);
      });

      try {
        // Generate the ZIP file as a Blob
        const blob = await zip.generateAsync({ type: "blob" });
        return blob;
      } catch (error) {
        console.error("Error generating ZIP file:", error);
      }
    },
  });
}

export function toSnakeCase(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") // Replace one or more spaces with an underscore
    .replace(/[^a-z0-9_]/g, ""); // Remove any characters that are not letters, numbers, or underscores
}

import { http, HttpResponse } from "msw";

import { NOTES_STORAGE_KEY } from "~/constants";
import { webStorage } from "~/lib/utils";
import {
  intSchema,
  noteSchema,
  NoteSchemaType,
  PaginatedNotesSchemaType,
  paginatedQuerySchema,
} from "~/types";

const DEFAULT_SLICE = 25;

export const NotesMockApi = {
  getPaginated() {
    return http.get("/notes/list", async ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const parsedSearchParams = Object.fromEntries(searchParams.entries());

      const result = paginatedQuerySchema.safeParse(parsedSearchParams);

      if (!result.success) {
        return HttpResponse.json(
          { error: result.error.message },
          { status: 400 },
        );
      }

      const params = result.data;

      const response: PaginatedNotesSchemaType = {
        data: [],
        meta: {
          hasMore: false,
          count: 0,
          cursor: params.cursor,
          slice: params.slice || DEFAULT_SLICE,
        },
      };

      const stored = webStorage.getItem<NoteSchemaType[]>(NOTES_STORAGE_KEY);

      if (!stored) return HttpResponse.json(response, { status: 200 });

      const count = stored.length;
      const nextCursor = Math.min(
        params.cursor + (params.slice || DEFAULT_SLICE),
        count,
      );
      const currentSlice = stored.slice(params.cursor, nextCursor);

      response.data = currentSlice;
      response.meta.hasMore = nextCursor < count;
      response.meta.count = count;
      response.meta.cursor = nextCursor;

      return HttpResponse.json(response, { status: 200 });
    });
  },

  getById() {
    return http.get("/notes/:id", async ({ params }) => {
      const { id } = params;
      const result = intSchema.safeParse(id);

      if (!result.success) {
        return HttpResponse.json(
          { error: result.error.message },
          { status: 400 },
        );
      }

      const stored = webStorage.getItem<NoteSchemaType[]>(NOTES_STORAGE_KEY);

      if (!stored) return HttpResponse.json(null, { status: 404 });

      let match: NoteSchemaType | null = null;

      for (const note of stored || []) {
        if (note.id === result.data) {
          match = note;
          break;
        }
      }

      if (!match) return HttpResponse.json(match, { status: 404 });

      return HttpResponse.json(match, { status: 200 });
    });
  },

  create() {
    return http.post("/notes", async () => {
      const currentDate = new Date();

      const newNote: NoteSchemaType = {
        id: currentDate.getTime(),
        createdAt: currentDate,
        updatedAt: null,
        isPinned: false,
        isProtected: false,
        note: "",
        previewTitle: "New Note",
        tags: [],
        order: 0,
      };

      webStorage.setItem<NoteSchemaType[]>(
        NOTES_STORAGE_KEY,
        (oldNotes = []) => [
          newNote,
          ...oldNotes.map((x) => ({ ...x, order: x.order + 1 })),
        ],
      );

      return HttpResponse.json(newNote, { status: 201 });
    });
  },

  update() {
    return http.put("/notes/:id", async ({ request }) => {
      const body = await request.json();

      const result = noteSchema.partial().safeParse(body);

      if (!result.success) {
        return HttpResponse.json(
          { error: result.error.message },
          { status: 400 },
        );
      }

      const stored = webStorage.getItem<NoteSchemaType[]>(NOTES_STORAGE_KEY);

      if (!stored) return HttpResponse.json(null, { status: 404 });

      const matchingNote = stored.find((n) => n.id === result.data.id);

      if (!matchingNote) {
        return HttpResponse.json(
          { message: "Note not found" },
          { status: 404 },
        );
      }

      const currentDate = new Date();

      const updatedNote: NoteSchemaType = {
        ...matchingNote,
        updatedAt: currentDate,
        isPinned: result.data.isPinned ?? matchingNote.isPinned,
        isProtected: result.data.isProtected ?? matchingNote.isProtected,
        order: result.data.order ?? matchingNote.order,
        note: result.data.note ?? matchingNote.note,
        previewTitle: result.data.previewTitle ?? matchingNote.previewTitle,
        tags: result.data.tags?.length ? result.data.tags : matchingNote.tags,
      };

      webStorage.setItem<NoteSchemaType[]>(NOTES_STORAGE_KEY, (oldNotes = []) =>
        oldNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note,
        ),
      );

      return HttpResponse.json(true, { status: 200 });
    });
  },

  reorderPinned() {
    // after reordering the PINNED notes, send the note id, with the old and new index ( on FE, enter drag mode )
  },
  reorder() {
    // after reordering the notes, send the note id, with the old and new index ( on FE, enter drag mode )
  },
  search() {
    // search for a word, creation date, update date, tag in the note title or the note body
  },

  delete() {
    // ( ask for password on locked notes )
    return http.delete("/notes/:id", async ({ params }) => {
      const { id } = params;
      const result = intSchema.safeParse(id);

      if (!result.success) {
        return HttpResponse.json(
          { error: result.error.message },
          { status: 400 },
        );
      }

      const stored = webStorage.getItem<NoteSchemaType[]>(NOTES_STORAGE_KEY);

      if (!stored) return HttpResponse.json(null, { status: 404 });

      const currLength = stored.length;

      const filteredNotes = stored.filter((n) => n.id === result.data);

      if (currLength === filteredNotes.length) {
        return HttpResponse.json(
          { message: "Note not found" },
          { status: 404 },
        );
      }

      return HttpResponse.json(true, { status: 200 });
    });
  },

  protect() {
    // encrypt a note with a password ( encrypt with the password locally and send the note encrypted )
    // DON'T store passwords
  },
  expose() {
    // decrypt a note and override existing encrypted note with decrypted text
  },
  pin() {
    // pin the note and bring it to the top
  },
  unPin() {
    // unpin the note and bring it to the top of the other notes
  },
};

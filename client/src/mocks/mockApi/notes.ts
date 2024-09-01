import { NOTES_STORAGE_KEY, PINNED_NOTES_STORAGE_KEY } from "~/constants";
import { webStorage } from "~/lib/utils";
import {
  NoteSchemaType,
  PaginatedNotesSchemaType,
  PaginatedQuerySchemaType,
} from "~/types";

const DEFAULT_SLICE = 25;

export const NotesMockApi = {
  async getPaginated(
    queryParams: PaginatedQuerySchemaType = { cursor: 0, slice: DEFAULT_SLICE },
  ) {
    // TODO: validate request
    const response: PaginatedNotesSchemaType = {
      data: [],
      meta: {
        hasMore: false,
        count: 0,
        cursor: queryParams.cursor,
        slice: queryParams.slice || DEFAULT_SLICE,
      },
    };

    const stored = webStorage.getItem<NoteSchemaType[]>(NOTES_STORAGE_KEY);

    if (!stored) return response;

    const count = stored.length;
    const nextCursor = Math.min(
      queryParams.cursor + (queryParams.slice || DEFAULT_SLICE),
      count,
    );
    const currentSlice = stored.slice(queryParams.cursor, nextCursor);

    response.data = currentSlice;
    response.meta.hasMore = nextCursor < count;
    response.meta.count = count;
    response.meta.cursor = nextCursor;

    return response;
  },
  async getById(id: NoteSchemaType["id"]) {
    // TODO: if locked, require password
    const storedPinned = webStorage.getItem<NoteSchemaType[]>(
      PINNED_NOTES_STORAGE_KEY,
    );
    const stored = webStorage.getItem<NoteSchemaType[]>(NOTES_STORAGE_KEY);

    if (!storedPinned && !stored) return null;

    let match: NoteSchemaType | null = null;

    for (const note of storedPinned || []) {
      if (note.id === id) {
        match = note;
        break;
      }
    }

    for (const note of stored || []) {
      if (note.id === id) {
        match = note;
        break;
      }
    }

    return match;
  },
  async create() {
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

    webStorage.setItem<NoteSchemaType[]>(NOTES_STORAGE_KEY, (oldNotes = []) => [
      newNote,
      ...oldNotes.map((x) => ({ ...x, order: x.order + 1 })),
    ]);

    return newNote;
  },
  update() {
    // update specific fields of a note by id
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
    // delete a note forever ( ask for password on locked notes )
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

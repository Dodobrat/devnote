import { DBSchema, openDB } from "idb";
import { ZodError } from "zod";

import {
  noteSchema,
  NoteSchemaType,
  paginatedNotesSchema,
  PaginatedNotesSchemaType,
  updateNoteSchema,
  UpdateNoteSchemaType,
} from "~/types";

export const NotesApi = {
  // async getPaginated(
  //   params: PaginatedSearchQuerySchemaType = {
  //     cursor: 0,
  //     // slice: 50,
  //     // query: "",
  //   },
  // ) {
  //   return instance
  //     .get<PaginatedNotesSchemaType>("/notes/list", { params })
  //     .then(({ data }) => data);
  // },
  // async getById(id: NoteSchemaType["id"]) {
  //   // if locked, require password
  //   return instance
  //     .get<NoteSchemaType>(`/notes/${id}`)
  //     .then(({ data }) => data);
  // },
  // async create(body: Pick<NoteSchemaType, "note">) {
  //   return instance
  //     .post<void, AxiosResponse<NoteSchemaType>>("/notes", body)
  //     .then(({ data }) => data);
  // },
  // async update(body: UpdateNoteSchemaType) {
  //   // update specific fields of a note by id
  //   return instance
  //     .put<boolean>(`/notes/${body.id}`, body)
  //     .then(({ data }) => data);
  // },
  // async updatePinState(body: UpdateNotePinStateSchemaType) {
  //   return instance
  //     .put<boolean>(`/notes/${body.id}/pin-state`, body)
  //     .then(({ data }) => data);
  // },
  // async updateOrder(body: UpdateNoteOrderSchemaType) {
  //   return instance.put<boolean>(`/notes/order`, body).then(({ data }) => data);
  // },
  // async delete(id: NoteSchemaType["id"]) {
  //   return instance.delete<boolean>(`/notes/${id}`).then(({ data }) => data);
  // },
};

// Define the database schema
interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: NoteSchemaType;
    indexes: {
      order: number;
      isPinned: number;
      previewTitle: string;
      tags: string;
    };
  };
}

// Initialize the IndexedDB database
const dbPromise = openDB<NotesDB>("notes-db", 1, {
  upgrade(db) {
    const store = db.createObjectStore("notes", {
      keyPath: "id",
    });
    store.createIndex("order", "order");
    store.createIndex("isPinned", "isPinned");
    store.createIndex("previewTitle", "previewTitle");
    store.createIndex("tags", "tags", { multiEntry: true });
  },
});

export const LocalNotesAPI = {
  // Create a new note
  async create(body: Pick<NoteSchemaType, "note">): Promise<NoteSchemaType> {
    try {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      // Get all unpinned notes
      const index = store.index("isPinned");
      const unpinnedNotes = await index.getAll(0);

      // Increment order of all unpinned notes by 1
      for (const note of unpinnedNotes) {
        note.order += 1;
        const validatedNote = noteSchema.parse(note);
        await store.put(validatedNote);
      }

      // Create new note
      const now = new Date();
      const newNote = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: null,
        previewTitle: `New note - ${now.toDateString()}`,
        order: 0,
        isPinned: 0,
        isProtected: 0,
        note: body.note,
        tags: [],
      };

      // Validate the new note
      const validatedNewNote = noteSchema.parse(newNote);

      await store.add(validatedNewNote);
      await tx.done;
      return validatedNewNote;
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        throw new Error(`Validation error in create: ${error.message}`);
      } else {
        // Handle other errors
        throw error;
      }
    }
  },

  // Get note by ID
  async getById(id: string): Promise<NoteSchemaType | undefined> {
    try {
      const db = await dbPromise;
      const note = await db.get("notes", id);
      if (note) {
        // Validate the retrieved note
        const validatedNote = noteSchema.parse(note);
        return validatedNote;
      }
      return undefined;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in getById: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Update a note
  async update(noteUpdate: UpdateNoteSchemaType): Promise<void> {
    try {
      // Validate input data
      const validatedNoteUpdate = updateNoteSchema.parse(noteUpdate);

      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      const note = await store.get(validatedNoteUpdate.id);
      if (!note) {
        throw new Error("Note not found");
      }

      // Update fields
      if (validatedNoteUpdate.previewTitle !== undefined) {
        note.previewTitle = validatedNoteUpdate.previewTitle;
      }
      if (validatedNoteUpdate.isProtected !== undefined) {
        note.isProtected = validatedNoteUpdate.isProtected;
      }
      if (validatedNoteUpdate.note !== undefined) {
        note.note = validatedNoteUpdate.note;
      }
      if (validatedNoteUpdate.tags !== undefined) {
        note.tags = validatedNoteUpdate.tags;
      }

      note.updatedAt = new Date();

      // Validate the updated note
      const validatedNote = noteSchema.parse(note);

      await store.put(validatedNote);
      await tx.done;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in update: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Pin a note
  async pin(id: string): Promise<void> {
    try {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      const note = await store.get(id);
      if (!note) {
        throw new Error("Note not found");
      }

      if (note.isPinned === 1) {
        // Note is already pinned
        return;
      }

      // Update orders of unpinned notes
      const unpinnedIndex = store.index("isPinned");
      const unpinnedNotes = await unpinnedIndex.getAll(0);

      for (const unpinnedNote of unpinnedNotes) {
        if (unpinnedNote.order > note.order) {
          unpinnedNote.order -= 1;
          const validatedUnpinnedNote = noteSchema.parse(unpinnedNote);
          await store.put(validatedUnpinnedNote);
        }
      }

      // Get max order in pinned notes
      const pinnedIndex = store.index("isPinned");
      const pinnedNotes = await pinnedIndex.getAll(1);
      let maxOrder = -1;
      for (const pinnedNote of pinnedNotes) {
        if (pinnedNote.order > maxOrder) {
          maxOrder = pinnedNote.order;
        }
      }

      // Update note
      note.isPinned = 1;
      note.order = maxOrder + 1;

      const validatedNote = noteSchema.parse(note);
      await store.put(validatedNote);
      await tx.done;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in pin: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Unpin a note
  async unpin(id: string): Promise<void> {
    try {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      const note = await store.get(id);
      if (!note) {
        throw new Error("Note not found");
      }

      if (note.isPinned === 0) {
        // Note is already unpinned
        return;
      }

      // Update orders of pinned notes
      const pinnedIndex = store.index("isPinned");
      const pinnedNotes = await pinnedIndex.getAll(1);

      for (const pinnedNote of pinnedNotes) {
        if (pinnedNote.order > note.order) {
          pinnedNote.order -= 1;
          const validatedPinnedNote = noteSchema.parse(pinnedNote);
          await store.put(validatedPinnedNote);
        }
      }

      // Update orders of unpinned notes
      const unpinnedIndex = store.index("isPinned");
      const unpinnedNotes = await unpinnedIndex.getAll(0);
      for (const unpinnedNote of unpinnedNotes) {
        unpinnedNote.order += 1;
        const validatedUnpinnedNote = noteSchema.parse(unpinnedNote);
        await store.put(validatedUnpinnedNote);
      }

      // Update note
      note.isPinned = 0;
      note.order = 0;

      const validatedNote = noteSchema.parse(note);
      await store.put(validatedNote);
      await tx.done;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in unpin: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Delete a note
  async delete(id: string): Promise<void> {
    try {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      const note = await store.get(id);
      if (!note) {
        throw new Error("Note not found");
      }

      const isPinned = note.isPinned;
      const order = note.order;

      await store.delete(id);

      // Update orders of other notes in the same group
      const index = store.index("isPinned");
      const notesInGroup = await index.getAll(isPinned);

      for (const otherNote of notesInGroup) {
        if (otherNote.order > order) {
          otherNote.order -= 1;
          const validatedNote = noteSchema.parse(otherNote);
          await store.put(validatedNote);
        }
      }

      await tx.done;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in delete: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Get paginated pinned notes
  async getPaginatedPinned(
    slice: number = 50,
    cursor: number = 0,
  ): Promise<PaginatedNotesSchemaType> {
    try {
      const db = await dbPromise;
      const store = db.transaction("notes", "readonly").objectStore("notes");
      const index = store.index("isPinned");

      // Get pinned notes
      const pinnedNotes = await index.getAll(1);

      // Sort by 'order'
      pinnedNotes.sort((a, b) => a.order - b.order);

      // Implement pagination
      const data = pinnedNotes.slice(cursor, cursor + slice);

      // Validate each note
      const validatedData = data.map((note) => noteSchema.parse(note));

      const hasMore = cursor + slice < pinnedNotes.length;
      const count = validatedData.length;

      const meta = {
        hasMore,
        count,
        cursor: cursor + count,
        slice,
      };

      const paginatedResult = {
        data: validatedData,
        meta,
      };

      // Validate the paginated result
      const validatedResult = paginatedNotesSchema.parse(paginatedResult);

      return validatedResult;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(
          `Validation error in getPaginatedPinned: ${error.message}`,
        );
      } else {
        throw error;
      }
    }
  },

  // Get paginated unpinned notes
  async getPaginated(
    slice: number = 50,
    cursor: number = 0,
  ): Promise<PaginatedNotesSchemaType> {
    try {
      const db = await dbPromise;
      const store = db.transaction("notes", "readonly").objectStore("notes");
      const index = store.index("isPinned");

      // Get unpinned notes
      const unpinnedNotes = await index.getAll(0);

      // Sort by 'order'
      unpinnedNotes.sort((a, b) => a.order - b.order);

      // Implement pagination
      const data = unpinnedNotes.slice(cursor, cursor + slice);

      // Validate each note
      const validatedData = data.map((note) => noteSchema.parse(note));

      const hasMore = cursor + slice < unpinnedNotes.length;
      const count = validatedData.length;

      const meta = {
        hasMore,
        count,
        cursor: cursor + count,
        slice,
      };

      const paginatedResult = {
        data: validatedData,
        meta,
      };

      // Validate the paginated result
      const validatedResult = paginatedNotesSchema.parse(paginatedResult);

      return validatedResult;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in getPaginated: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Reorder pinned notes
  async reorderPinned(ids: string[]): Promise<void> {
    try {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const note = await store.get(id);
        if (note && note.isPinned === 1) {
          note.order = i;
          const validatedNote = noteSchema.parse(note);
          await store.put(validatedNote);
        } else {
          throw new Error(`Note with id ${id} is not pinned or does not exist`);
        }
      }

      await tx.done;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in reorderPinned: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Reorder unpinned notes
  async reorder(ids: string[]): Promise<void> {
    try {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const note = await store.get(id);
        if (note && note.isPinned === 0) {
          note.order = i;
          const validatedNote = noteSchema.parse(note);
          await store.put(validatedNote);
        } else {
          throw new Error(`Note with id ${id} is pinned or does not exist`);
        }
      }

      await tx.done;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in reorder: ${error.message}`);
      } else {
        throw error;
      }
    }
  },

  // Search notes by previewTitle or tags
  async search(query: string): Promise<NoteSchemaType[]> {
    try {
      const db = await dbPromise;
      const store = db.transaction("notes", "readonly").objectStore("notes");

      // Get all notes
      const notes = await store.getAll();

      // Filter notes
      const lowerQuery = query.toLowerCase();
      const filteredNotes = notes.filter((note) => {
        const titleMatch = note.previewTitle.toLowerCase().includes(lowerQuery);
        const tagsMatch = note.tags.some((tag) =>
          tag.toLowerCase().includes(lowerQuery),
        );
        return titleMatch || tagsMatch;
      });

      // Sort by 'order'
      filteredNotes.sort((a, b) => a.order - b.order);

      // Validate each note
      const validatedNotes = filteredNotes.map((note) =>
        noteSchema.parse(note),
      );

      return validatedNotes;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error(`Validation error in search: ${error.message}`);
      } else {
        throw error;
      }
    }
  },
};

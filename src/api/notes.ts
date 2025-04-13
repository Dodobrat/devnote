import { type DBSchema, openDB } from "idb";
import { ZodError } from "zod";

import {
  noteSchema,
  type NoteSchemaType,
  paginatedNotesSchema,
  type PaginatedNotesSchemaType,
  updateNoteSchema,
  type UpdateNoteSchemaType,
} from "~/types/notes";
interface NotesDB extends DBSchema {
  notes: {
    key: string;
    value: NoteSchemaType;
    indexes: {
      order: number;
      isPinned: number;
      title: string;
      tags: string;
    };
  };
  tags: {
    key: string;
    value: { name: string };
  };
}

const DEFAULT_PAGE_SLICE = 50;

const NOTES_DB_NAME = "devnotes-db";
const NOTES_DB_VERSION = 2;

// MARK: Initialize IndexedDB
const dbPromise = openDB<NotesDB>(NOTES_DB_NAME, NOTES_DB_VERSION, {
  upgrade(db) {
    // If the "notes" store doesn't exist, create it (this is just a safety check)
    if (!db.objectStoreNames.contains("notes")) {
      const notesStore = db.createObjectStore("notes", { keyPath: "id" });
      notesStore.createIndex("order", "order");
      notesStore.createIndex("isPinned", "isPinned");
      notesStore.createIndex("title", "title");
      notesStore.createIndex("tags", "tags", { multiEntry: true });
    }
    // Only create the "tags" store if it does not exist already.
    if (!db.objectStoreNames.contains("tags")) {
      db.createObjectStore("tags", { keyPath: "name" });
    }
  },
});

export const LocalNotesAPI = {
  // MARK: Create note
  async create(body: Pick<NoteSchemaType, "note">): Promise<NoteSchemaType> {
    return handleDBQuery(async () => {
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
      const fallbackTitle = `New note - ${now.toUTCString()}`;

      let title = deriveTitle(body.note);

      const isValidTitle = noteSchema.shape.title.safeParse(title);
      if (!isValidTitle.success) {
        title = fallbackTitle;
      }

      const newNote = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: null,
        title,
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
    });
  },

  // MARK: Get note by ID
  async getById(id: NoteSchemaType["id"]): Promise<NoteSchemaType | null> {
    return handleDBQuery(async () => {
      const db = await dbPromise;
      const note = await db.get("notes", id);

      if (!note) return null;

      // Validate the retrieved note
      const validatedNote = noteSchema.parse(note);
      return validatedNote;
    });
  },

  // MARK: Update note
  async update(body: UpdateNoteSchemaType): Promise<void> {
    return handleDBQuery(async () => {
      // Validate input data
      const validatedNoteUpdate = updateNoteSchema.parse(body);

      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      const note = await store.get(validatedNoteUpdate.id);
      if (!note) {
        throw new Error("Note not found");
      }

      // Update fields
      note.title = validatedNoteUpdate.title ?? note.title;
      note.isProtected = validatedNoteUpdate.isProtected ?? note.isProtected;
      note.note = validatedNoteUpdate.note ?? note.note;
      note.tags = validatedNoteUpdate.tags ?? note.tags;
      note.updatedAt = new Date();

      // Validate the updated note
      const validatedNote = noteSchema.parse(note);

      await store.put(validatedNote);
      await tx.done;
    });
  },

  // MARK: Pin note
  async pin(id: NoteSchemaType["id"]): Promise<void> {
    return handleDBQuery(() => updatePinState(id, 1));
  },

  // MARK: Unpin note
  async unpin(id: NoteSchemaType["id"]): Promise<void> {
    return handleDBQuery(() => updatePinState(id, 0));
  },

  // MARK: Delete notes
  async bulkDelete(ids: NoteSchemaType["id"][]): Promise<void> {
    return handleDBQuery(async () => {
      const db = await dbPromise;
      const tx = db.transaction("notes", "readwrite");
      const store = tx.objectStore("notes");

      // Record affected groups (isPinned values)
      const affectedGroups = new Set<number>();

      // Validate existence and delete each note
      for (const id of ids) {
        const note = await store.get(id);
        if (!note) {
          throw new Error(`Note with id ${id} not found`);
        }
        affectedGroups.add(note.isPinned);
        await store.delete(id);
      }

      // For each affected group, update orders on the remaining notes
      for (const group of affectedGroups) {
        const index = store.index("isPinned");
        const remainingNotes = await index.getAll(group);

        // Sort remaining notes by their current order
        remainingNotes.sort((a, b) => a.order - b.order);

        // Reassign orders sequentially (starting from 0)
        for (let newOrder = 0; newOrder < remainingNotes.length; newOrder++) {
          if (remainingNotes[newOrder].order !== newOrder) {
            remainingNotes[newOrder].order = newOrder;
            // Validate using your noteSchema
            const validatedNote = noteSchema.parse(remainingNotes[newOrder]);
            await store.put(validatedNote);
          }
        }
      }

      await tx.done;
    });
  },

  // MARK: Get pinned notes
  async getPaginatedPinned(
    slice = DEFAULT_PAGE_SLICE,
    cursor = 0,
  ): Promise<PaginatedNotesSchemaType> {
    return handleDBQuery(() => getPaginatedNotesByPinState(slice, cursor, 1));
  },

  // MARK: Get unpinned notes
  async getPaginated(
    slice = DEFAULT_PAGE_SLICE,
    cursor = 0,
  ): Promise<PaginatedNotesSchemaType> {
    return handleDBQuery(() => getPaginatedNotesByPinState(slice, cursor, 0));
  },

  // MARK: Reorder pinned notes
  async reorderPinned(ids: NoteSchemaType["id"][]): Promise<void> {
    return handleDBQuery(() => reorderNotesByPinState(ids, 1));
  },

  // MARK: Reorder unpinned notes
  async reorder(ids: NoteSchemaType["id"][]): Promise<void> {
    return handleDBQuery(() => reorderNotesByPinState(ids, 0));
  },

  // MARK: Search notes by title or tags
  async search(query: string): Promise<NoteSchemaType[]> {
    return handleDBQuery(async () => {
      const db = await dbPromise;
      const store = db.transaction("notes", "readonly").objectStore("notes");

      // Get all notes
      const notes = await store.getAll();

      // Filter notes
      const lowerQuery = query.toLowerCase();
      const filteredNotes = notes.filter((note) => {
        const isTagSearch = lowerQuery.startsWith("tag:");

        if (isTagSearch) {
          const tagQuery = lowerQuery.slice(4).trim();
          return note.tags.some((tag) => tag.toLowerCase().includes(tagQuery));
        }

        return note.title.toLowerCase().includes(lowerQuery);
      });

      // Sort by 'order'
      filteredNotes.sort((a, b) => a.order - b.order);

      // Validate each note
      const validatedNotes = filteredNotes.map((note) =>
        noteSchema.parse(note),
      );

      return validatedNotes;
    });
  },

  // MARK: Tags
  tags: {
    // Get all unique tags from the tags store
    async getAll(): Promise<string[]> {
      return handleDBQuery(async () => {
        const db = await dbPromise;
        const tx = db.transaction("tags", "readonly");
        const store = tx.objectStore("tags");
        const keys = await store.getAllKeys();
        return keys;
      });
    },

    // Add a new tag if it doesn't already exist
    async add(tag: string): Promise<void> {
      return handleDBQuery(async () => {
        const db = await dbPromise;
        const tx = db.transaction("tags", "readwrite");
        const store = tx.objectStore("tags");

        const existing = await store.get(tag);
        if (existing) {
          throw new Error("Tag already exists");
        }

        await store.add({ name: tag });
        await tx.done;
      });
    },

    // Assign an existing tag to a note
    async assign(noteId: string, tag: string): Promise<void> {
      return handleDBQuery(async () => {
        const db = await dbPromise;
        const tx = db.transaction(["tags", "notes"], "readwrite");
        const tagStore = tx.objectStore("tags");
        const noteStore = tx.objectStore("notes");

        // Ensure the tag exists
        const existingTag = await tagStore.get(tag);
        if (!existingTag) {
          throw new Error(
            "Tag does not exist. Please add it before assignment.",
          );
        }

        // Retrieve and update the note
        const note = await noteStore.get(noteId);
        if (!note) {
          throw new Error("Note not found");
        }

        if (!note.tags.includes(tag)) {
          note.tags.push(tag);
          note.updatedAt = new Date();
          const validatedNote = noteSchema.parse(note);
          await noteStore.put(validatedNote);
        }
        await tx.done;
      });
    },

    // Unassign a tag from a note
    async unassign(noteId: string, tag: string): Promise<void> {
      return handleDBQuery(async () => {
        const db = await dbPromise;
        const tx = db.transaction("notes", "readwrite");
        const noteStore = tx.objectStore("notes");

        const note = await noteStore.get(noteId);
        if (!note) {
          throw new Error("Note not found");
        }

        if (note.tags.includes(tag)) {
          note.tags = note.tags.filter((t) => t !== tag);
          note.updatedAt = new Date();
          const validatedNote = noteSchema.parse(note);
          await noteStore.put(validatedNote);
        }
        await tx.done;
      });
    },

    // Delete a tag from the tags store and remove it from any notes that have it
    async delete(tag: string): Promise<void> {
      return handleDBQuery(async () => {
        const db = await dbPromise;
        const tx = db.transaction(["tags", "notes"], "readwrite");
        const tagStore = tx.objectStore("tags");
        const noteStore = tx.objectStore("notes");

        // Delete the tag from the store
        await tagStore.delete(tag);

        // Remove the tag from all notes that have it
        const allNotes = await noteStore.getAll();
        for (const note of allNotes) {
          if (note.tags.includes(tag)) {
            note.tags = note.tags.filter((t) => t !== tag);
            note.updatedAt = new Date();
            const validatedNote = noteSchema.parse(note);
            await noteStore.put(validatedNote);
          }
        }
        await tx.done;
      });
    },
  },
};

// MARK: Helper functions

async function reorderNotesByPinState(
  ids: NoteSchemaType["id"][],
  pinState: 1 | 0,
): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const note = await store.get(id);

    if (!note) {
      throw new Error(`Note with id ${id} does not exist`);
    }

    if (note.isPinned !== pinState) continue;

    note.order = i;
    const validatedNote = noteSchema.parse(note);
    await store.put(validatedNote);
  }

  await tx.done;
}

async function updatePinState(
  id: NoteSchemaType["id"],
  pinState: 1 | 0,
): Promise<void> {
  const db = await dbPromise;
  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  const note = await store.get(id);
  if (!note) {
    throw new Error("Note not found");
  }

  if (note.isPinned === pinState) {
    // Note is already in the target state
    return;
  }

  // Update orders of the opposite pin state notes
  const oppositePinStateIndex = store.index("isPinned");
  const oppositePinStateNotes = await oppositePinStateIndex.getAll(
    pinState ? 0 : 1,
  );

  for (const oppositePinStateNote of oppositePinStateNotes) {
    if (oppositePinStateNote.order > note.order) {
      oppositePinStateNote.order -= 1;
      const validatedOppositePinStateNote =
        noteSchema.parse(oppositePinStateNote);
      await store.put(validatedOppositePinStateNote);
    }
  }

  // Get current notes in target pin state
  const targetPinStateIndex = store.index("isPinned");
  const targetPinStateNotes = await targetPinStateIndex.getAll(pinState);

  // Update note and assign new order based on target state
  note.isPinned = pinState;

  if (pinState === 1) {
    note.order = targetPinStateNotes.length;
  }

  if (pinState === 0) {
    for (const targetPinStateNote of targetPinStateNotes) {
      targetPinStateNote.order += 1;
      const validatedTargetPinStateNote = noteSchema.parse(targetPinStateNote);
      await store.put(validatedTargetPinStateNote);
    }
    note.order = 0;
  }

  const validatedNote = noteSchema.parse(note);
  await store.put(validatedNote);
  await tx.done;
}

async function getPaginatedNotesByPinState(
  slice: number,
  cursor: number,
  pinState: 1 | 0,
): Promise<PaginatedNotesSchemaType> {
  const db = await dbPromise;
  const store = db.transaction("notes", "readonly").objectStore("notes");
  const index = store.index("isPinned");

  // Get notes filtered by pin state
  const filteredNotes = await index.getAll(pinState);

  // Sort notes by their order
  filteredNotes.sort((a, b) => a.order - b.order);

  // Implement pagination
  const data = filteredNotes.slice(cursor, cursor + slice);

  // Validate each note
  const validatedData = data.map((note) => noteSchema.parse(note));

  const hasMore = cursor + slice < filteredNotes.length;
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
}

async function handleDBQuery<TData>(
  query: () => Promise<TData>,
): Promise<TData> {
  try {
    return await query();
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Validation error: ${error.message}`);
    } else {
      throw error;
    }
  }
}

function deriveTitle(markdownContent: string) {
  const lines = markdownContent.split("\n");
  const firstLineWithWords = lines.find((line) => /\w+/.test(line)) || "";
  const withoutHtmlTags = firstLineWithWords.replace(/<\/?[^>]+(>|$)/g, "");
  const cleanTitle = withoutHtmlTags.replace(/[^\w\s]/g, "");
  return cleanTitle.trim();
}

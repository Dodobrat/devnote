import {
  NoteSchemaType,
  PaginatedNotesSchemaType,
  PaginatedQuerySchemaType,
} from "~/types";

import { instance } from "./axios";

export const NotesApi = {
  getPinnedPaginated(
    queryParams: PaginatedQuerySchemaType = { cursor: 0, slice: 50 },
  ) {
    return instance.get<PaginatedNotesSchemaType>("/notes/list/pinned", {
      params: queryParams,
    });
  },
  getOthersPaginated(
    queryParams: PaginatedQuerySchemaType = { cursor: 0, slice: 50 },
  ) {
    return instance.get<PaginatedNotesSchemaType>("/notes/list", {
      params: queryParams,
    });
  },
  getById(id: NoteSchemaType["id"]) {
    // if locked, require password
    return instance.get<NoteSchemaType>("/notes/:id", { params: id });
  },
  create() {
    return instance.post<void, NoteSchemaType>("/notes");
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

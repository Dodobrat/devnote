import { AxiosResponse } from "axios";

import {
  NoteSchemaType,
  PaginatedNotesSchemaType,
  PaginatedQuerySchemaType,
  UpdateNoteOrderSchemaType,
  UpdateNotePinStateSchemaType,
  UpdateNoteSchemaType,
} from "~/types";

import { instance } from "./axios";

export const NotesApi = {
  async getPaginated(
    params: PaginatedQuerySchemaType = { cursor: 0, slice: 50 },
  ) {
    return instance
      .get<PaginatedNotesSchemaType>("/notes/list", { params })
      .then(({ data }) => data);
  },
  async search() {
    // search for a word, creation date, update date, tag in the note title or the note body
  },
  async getById(id: NoteSchemaType["id"]) {
    // if locked, require password
    return instance
      .get<NoteSchemaType>(`/notes/${id}`)
      .then(({ data }) => data);
  },
  async create(body: Pick<NoteSchemaType, "note">) {
    return instance
      .post<void, AxiosResponse<NoteSchemaType>>("/notes", body)
      .then(({ data }) => data);
  },
  async update(body: UpdateNoteSchemaType) {
    // update specific fields of a note by id
    return instance
      .put<boolean>(`/notes/${body.id}`, body)
      .then(({ data }) => data);
  },
  async updatePinState(body: UpdateNotePinStateSchemaType) {
    return instance
      .put<boolean>(`/notes/${body.id}/pin-state`, body)
      .then(({ data }) => data);
  },
  async updateOrder(body: UpdateNoteOrderSchemaType) {
    return instance.put<boolean>(`/notes/order`, body).then(({ data }) => data);
  },
  async delete(id: NoteSchemaType["id"]) {
    return instance.delete<boolean>(`/notes/${id}`).then(({ data }) => data);
  },
};

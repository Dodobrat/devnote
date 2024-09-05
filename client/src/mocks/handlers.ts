import { NotesMockApi } from "./mockApi";

export const handlers = [
  NotesMockApi.getPaginated(),
  NotesMockApi.getById(),
  NotesMockApi.create(),
  NotesMockApi.update(),
  NotesMockApi.delete(),
];

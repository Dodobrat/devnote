import { NotesMockApi } from "./mockApi";

export const handlers = [
  NotesMockApi.getPaginated(),
  NotesMockApi.updatePinState(),
  NotesMockApi.updateOrder(),
  NotesMockApi.getById(),
  NotesMockApi.create(),
  NotesMockApi.update(),
  NotesMockApi.delete(),
];

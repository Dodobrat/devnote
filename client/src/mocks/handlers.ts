import { NotesMockApi } from "./mockApi";

export const handlers = [
  NotesMockApi.getPaginated(),
  NotesMockApi.updatePinState(),
  NotesMockApi.updateOrder(),
  NotesMockApi.create(),
  NotesMockApi.update(),
  NotesMockApi.delete(),
  NotesMockApi.getById(),
];

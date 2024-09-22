import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { z } from "zod";

export const intSchema = z.coerce.number().int();
export const intBoolSchema = z.number().int().min(0).max(1); // 0 or 1

export const titleSchema = z.string().trim().min(2).max(50);

export const noteSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }).nullable(),
  previewTitle: titleSchema,
  order: intSchema,
  isPinned: intBoolSchema,
  isProtected: intBoolSchema,
  note: z.string(),
  tags: z.array(z.string().min(1)),
});

export const updateNoteSchema = noteSchema
  .pick({
    isProtected: true,
    note: true,
    previewTitle: true,
    tags: true,
  })
  .partial()
  .merge(noteSchema.pick({ id: true }));

export const updateNotePinStateSchema = noteSchema.pick({
  id: true,
  isPinned: true,
});

export const updateNoteOrderSchema = z.object({
  order: z.array(intSchema.positive()),
});

export type NoteSchemaType = z.infer<typeof noteSchema>;
export type UpdateNoteSchemaType = z.infer<typeof updateNoteSchema>;
export type UpdateNotePinStateSchemaType = z.infer<
  typeof updateNotePinStateSchema
>;
export type UpdateNoteOrderSchemaType = z.infer<typeof updateNoteOrderSchema>;

export const paginationMetaSchema = z.object({
  hasMore: z.boolean(),
  count: intSchema,
  cursor: intSchema,
  slice: intSchema.positive(),
});

export const paginatedNotesSchema = z.object({
  data: z.array(noteSchema),
  meta: paginationMetaSchema,
});

export const paginatedQuerySchema = paginationMetaSchema
  .pick({ cursor: true, slice: true })
  .partial({ slice: true });

export const paginatedSearchQuerySchema = paginatedQuerySchema.extend({
  query: titleSchema.max(100).optional(),
});

export type PaginatedNotesSchemaType = z.infer<typeof paginatedNotesSchema>;
export type PaginatedQuerySchemaType = z.infer<typeof paginatedQuerySchema>;
export type PaginatedSearchQuerySchemaType = z.infer<
  typeof paginatedSearchQuerySchema
>;

export type MonacoStandaloneEditor = monaco.editor.IStandaloneCodeEditor | null;

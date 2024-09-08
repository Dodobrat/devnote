import { z } from "zod";

export const intSchema = z.coerce.number().int();

export const titleSchema = z.string().trim().min(2).max(50);

export const noteSchema = z.object({
  id: intSchema.positive(),
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }).nullable(),
  previewTitle: titleSchema,
  order: intSchema,
  isPinned: z.boolean(),
  isProtected: z.boolean(),
  note: z.string(),
  tags: z.array(z.string().min(1)),
});

export const updateNoteSchema = noteSchema
  .partial()
  .merge(noteSchema.pick({ id: true }));

export type NoteSchemaType = z.infer<typeof noteSchema>;
export type UpdateNoteSchemaType = z.infer<typeof updateNoteSchema>;

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

export type PaginatedNotesSchemaType = z.infer<typeof paginatedNotesSchema>;
export type PaginatedQuerySchemaType = z.infer<typeof paginatedQuerySchema>;

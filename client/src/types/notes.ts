import { z } from "zod";

export const intSchema = z.coerce.number().int();
export const intBoolSchema = z.number().int().min(0).max(1); // 0 or 1
export const titleSchema = z.string().trim().min(2).max(50);

export const noteSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }).nullable(),
  title: titleSchema,
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
    title: true,
    tags: true,
  })
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

export type PaginatedNotesSchemaType = z.infer<typeof paginatedNotesSchema>;

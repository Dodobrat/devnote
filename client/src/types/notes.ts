import { z } from "zod";

export const positiveIntSchema = z.number().int().positive();

export const noteSchema = z.object({
  id: positiveIntSchema,
  createdAt: z.date({ coerce: true }),
  updatedAt: z.date({ coerce: true }).nullable(),
  previewTitle: z.string().min(1).max(50),
  order: positiveIntSchema,
  isPinned: z.boolean(),
  isProtected: z.boolean(),
  note: z.string(),
  tags: z.array(z.string().min(1)),
});

export type NoteSchemaType = z.infer<typeof noteSchema>;

export const paginationMetaSchema = z.object({
  hasMore: z.boolean(),
  count: positiveIntSchema,
  cursor: positiveIntSchema,
  slice: positiveIntSchema,
});

export const paginatedNotesSchema = z.object({
  data: z.array(noteSchema),
  meta: paginationMetaSchema,
});

export const paginatedQuerySchema = paginationMetaSchema.pick({
  cursor: true,
  slice: true,
});

export type PaginatedNotesSchemaType = z.infer<typeof paginatedNotesSchema>;
export type PaginatedQuerySchemaType = z.infer<typeof paginatedQuerySchema>;

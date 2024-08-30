import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
import { z } from "zod";

import { NOTE_STORAGE_KEY } from "~/constants/notes";

// TODO: tanstack wrapper

export function useNotes() {
  const [data] = useLocalStorage(NOTE_STORAGE_KEY, {});
  return { data };
}

const createNoteSchema = z.object({
  value: z.string(),
  title: z.string(),
  orderId: z.number().int().positive().nullable(),
  parent: z.string(),
});

type CreateNoteSchemaType = z.infer<typeof createNoteSchema>;

export function useCreateNote() {
  const [, setData] = useLocalStorage(NOTE_STORAGE_KEY, {});

  return {
    mutate: (body: CreateNoteSchemaType) => {
      try {
        const validatedBody = createNoteSchema.parse(body);
        setData((prev) => {
          const uniqueKey = new Date().getTime();
          return {
            ...prev,
            [uniqueKey]: validatedBody,
          };
        });
      } catch {
        toast.error("Unable to create note");
      }
    },
  };
}

const editNoteSchema = createNoteSchema.extend({
  orderId: z.number().int().positive(),
  id: z.number().int().positive(),
});

type EditNoteSchemaType = z.infer<typeof editNoteSchema>;

export function useEditNote() {
  const [, setData] = useLocalStorage(NOTE_STORAGE_KEY, {});

  return {
    mutate: (body: EditNoteSchemaType) => {
      try {
        const validatedBody = editNoteSchema.parse(body);
        setData((prev) => {
          return {
            ...prev,
            [validatedBody.id]: validatedBody,
          };
        });
      } catch {
        toast.error("Unable to edit note");
      }
    },
  };
}

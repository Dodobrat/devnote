import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type ZodError } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { notesQueryKeys, useUpdateNote } from "~/hooks/query";
import { cn } from "~/lib/utils";
import { type NoteSchemaType, titleSchema } from "~/types/notes";

export function NoteEditTitleForm({
  note,
  onSuccess,
}: {
  note: NoteSchemaType;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const updateNoteMutation = useUpdateNote();

  const [title, setTitle] = useState(note.title);
  const [error, setError] = useState<ZodError<string> | null>(null);

  const validate = useCallback((titleValue: string) => {
    const result = titleSchema.safeParse(titleValue);
    if (!result.success) return setError(result.error);
    return setError(null);
  }, []);

  return (
    <form
      className={cn("flex flex-col gap-4", "px-4 md:px-0")}
      onSubmit={(e) => {
        e.preventDefault();

        if (error) return;

        updateNoteMutation.mutate(
          { id: note.id, title: title },
          {
            onSuccess: () => {
              toast.success("Note title updated");
              queryClient.refetchQueries({
                queryKey: notesQueryKeys.list(),
              });
              queryClient.refetchQueries({
                queryKey: notesQueryKeys.byId(note.id),
              });
              onSuccess?.();
            },
            onError: () => toast.error("Failed to update note title"),
          },
        );
      }}
    >
      <Input
        value={title}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          validate(v);
        }}
        placeholder="Enter a note title"
      />
      {Boolean(error) && (
        <small className="text-destructive -mt-2 block text-xs font-bold">
          {error!.issues[0].message}
        </small>
      )}
      <Button className="md:self-end" type="submit">
        Update
      </Button>
    </form>
  );
}

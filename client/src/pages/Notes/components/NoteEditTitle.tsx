import { useCallback, useEffect, useState } from "react";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { ZodError } from "zod";

import { ResponsiveDialog } from "~/components/ResponsiveDialog";
import {
  Button,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { useUpdateNote } from "~/hooks/query";
import { cn } from "~/lib/utils";
import { NoteSchemaType, titleSchema } from "~/types/notes";

export function NoteEditTitle({ note }: { note: NoteSchemaType }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0"
            onClick={() => setOpen(true)}
          >
            <PencilIcon className="size-5" aria-hidden />
            <span className="sr-only">Update note title</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Update note title</p>
        </TooltipContent>
      </Tooltip>

      <ResponsiveDialog
        labels={{
          title: "Update note title",
          desc: "Edit the title of your note so you can find it faster later.",
          cancel: "Cancel",
        }}
        open={open}
        onOpenChange={setOpen}
      >
        <NoteEditTitleForm note={note} onSuccess={() => setOpen(false)} />
      </ResponsiveDialog>
    </>
  );
}

function NoteEditTitleForm({
  note,
  onSuccess,
}: {
  note: NoteSchemaType;
  onSuccess?: () => void;
}) {
  const updateNoteMutation = useUpdateNote();

  const [title, setTitle] = useState(note.title);
  const [error, setError] = useState<ZodError<string> | null>(null);

  const validate = useCallback(() => {
    const result = titleSchema.safeParse(title);
    if (!result.success) return setError(result.error);
    return setError(null);
  }, [title]);

  useEffect(() => {
    validate();
  }, [validate]);

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
              onSuccess?.();
            },
            onError: () => toast.error("Failed to update note title"),
          },
        );
      }}
    >
      <Input
        value={title}
        onChange={({ target }) => setTitle(target.value)}
        placeholder="Enter a note title"
      />
      {Boolean(error) && (
        <small className="-mt-2 block text-xs font-bold text-destructive">
          {error!.issues[0].message}
        </small>
      )}
      <Button type="submit">Update</Button>
    </form>
  );
}

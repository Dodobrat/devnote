import { useState } from "react";
import { TrashIcon } from "lucide-react";

import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { useDeleteNote } from "~/hooks/query";
import { NoteSchemaType } from "~/types/notes";

export function NoteDelete({ note }: { note: NoteSchemaType }) {
  const deleteNoteMutation = useDeleteNote();

  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setOpen(true)}
          >
            <TrashIcon className="size-5" aria-hidden />
            <span className="sr-only">Delete note</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete note</p>
        </TooltipContent>
      </Tooltip>

      <ResponsiveConfirmation
        open={open}
        onOpenChange={setOpen}
        onContinue={() => deleteNoteMutation.mutate(note.id)}
        labels={{
          title: "Are you absolutely sure?",
          desc: "This action cannot be undone. This will permanently delete your note.",
          cancel: "Cancel",
          continue: "Continue",
        }}
      />
    </>
  );
}

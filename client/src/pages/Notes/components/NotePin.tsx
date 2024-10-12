import { PinIcon, PinOffIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { usePinNote, useUnpinNote } from "~/hooks/query";
import { NoteSchemaType } from "~/types/notes";

export function NotePin({ note }: { note: NoteSchemaType }) {
  const pinNoteMutation = usePinNote();
  const unpinNoteMutation = useUnpinNote();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            const updatePinStateMutation = note.isPinned
              ? unpinNoteMutation
              : pinNoteMutation;

            updatePinStateMutation.mutate(note.id, {
              onSuccess: () =>
                toast.success(`Note ${note.isPinned ? "unpinned" : "pinned"}`),
            });
          }}
        >
          {note.isPinned ? (
            <PinIcon className="size-5" aria-hidden />
          ) : (
            <PinOffIcon className="size-5" aria-hidden />
          )}
          <span className="sr-only">
            {note.isPinned ? "Unpin" : "Pin"} note
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{note.isPinned ? "Unpin" : "Pin"} note</p>
      </TooltipContent>
    </Tooltip>
  );
}

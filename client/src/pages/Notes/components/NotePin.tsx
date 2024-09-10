import { PinIcon, PinOffIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { useUpdateNotePinState } from "~/hooks/query";
import { NoteSchemaType } from "~/types";

export function NotePin({ note }: { note: NoteSchemaType }) {
  const updatePinStateMutation = useUpdateNotePinState();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            updatePinStateMutation.mutate(
              { id: note.id, isPinned: !note.isPinned },
              {
                onSuccess: () =>
                  toast.success(
                    `Note ${note.isPinned ? "unpinned" : "pinned"}`,
                  ),
              },
            );
          }}
        >
          {note.isPinned ? (
            <PinIcon className="size-5" />
          ) : (
            <PinOffIcon className="size-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{note.isPinned ? "Unpin" : "Pin"} note</p>
      </TooltipContent>
    </Tooltip>
  );
}

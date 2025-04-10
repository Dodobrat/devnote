import { PinIcon, PinOffIcon } from "lucide-react";

import { Button, Tooltip } from "~/components/ui";
import { usePinNote, useUnpinNote } from "~/hooks/query";
import { type NoteSchemaType } from "~/types/notes";

export function NotePinAction({ note }: { note: NoteSchemaType }) {
  const pinMutation = usePinNote();
  const unpinMutation = useUnpinNote();

  if (note.isPinned) {
    return (
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => unpinMutation.mutate(note.id)}
          >
            <PinOffIcon />
            <span className="sr-only">Unpin</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Unpin</p>
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => pinMutation.mutate(note.id)}
        >
          <PinIcon />
          <span className="sr-only">Pin</span>
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Pin</p>
      </Tooltip.Content>
    </Tooltip>
  );
}

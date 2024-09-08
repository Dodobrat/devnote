import { useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { notesQueryKeys, useDeleteNote } from "~/hooks/query";
import { NoteSchemaType } from "~/types";

export function NoteDelete({ note }: { note: NoteSchemaType }) {
  const queryClient = useQueryClient();
  const deleteNoteMutation = useDeleteNote();

  // TODO: confirmation
  // TODO: confirmation with pass for protected

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            deleteNoteMutation.mutate(note.id, {
              onSuccess: () => {
                queryClient.refetchQueries({ queryKey: notesQueryKeys.list() });
              },
            });
          }}
        >
          <TrashIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Delete note</p>
      </TooltipContent>
    </Tooltip>
  );
}

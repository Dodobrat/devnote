import { useQueryClient } from "@tanstack/react-query";

import { Button } from "~/components/ui";
import { notesQueryKeys, useCreateNote } from "~/hooks/query";

export function NotesWelcome() {
  const queryClient = useQueryClient();
  const createMutation = useCreateNote();

  return (
    <div className="grow overflow-auto">
      <Button
        onClick={() =>
          createMutation.mutate(undefined, {
            onSettled: () =>
              queryClient.invalidateQueries({
                queryKey: notesQueryKeys.list(),
              }),
          })
        }
      >
        Create
      </Button>
    </div>
  );
}

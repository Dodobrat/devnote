import { createFileRoute } from "@tanstack/react-router";

import { Button } from "~/components/ui/button";
import { useCreateNote } from "~/hooks/query";

export const Route = createFileRoute("/note/new")({
  component: RouteComponent,
});

function RouteComponent() {
  const createNoteMutation = useCreateNote();

  return (
    <div>
      Hello "/note/new"!
      <Button
        onClick={() =>
          createNoteMutation.mutate({
            note: "Testvam note 4 with additional long text because I need to test the truncation",
          })
        }
      >
        Create
      </Button>
    </div>
  );
}

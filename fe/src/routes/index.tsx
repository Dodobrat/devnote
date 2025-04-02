import { createFileRoute, Navigate } from "@tanstack/react-router";

import { LAST_VISITED_ROUTE_STATE_KEY } from "~/constants";
import { useLastOpenedNote } from "~/hooks/store";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [lastOpenedNote] = useLastOpenedNote();

  if (!lastOpenedNote) return <Navigate to="/note/new" />;

  return (
    <Navigate
      replace
      state={{ redirectedToLastSavedNote: LAST_VISITED_ROUTE_STATE_KEY }}
      to="/note/$noteId"
      params={{ noteId: lastOpenedNote }}
    />
  );
}

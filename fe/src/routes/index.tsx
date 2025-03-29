import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  // TODO: redirect to new note if no last visited saved

  return <Navigate to="/note/new" />;
}

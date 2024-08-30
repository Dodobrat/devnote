import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/notes")({
  component: NotesLayout,
});

function NotesLayout() {
  return (
    <div className="flex grow gap-4">
      <ul></ul>
      <Outlet />
    </div>
  );
}

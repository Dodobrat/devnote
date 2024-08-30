import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/notes")({
  component: NotesLayout,
});

function NotesLayout() {
  return (
    <div>
      <nav>OTHER NOTES</nav>
      <Outlet />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notes/")({
  component: NotesWelcome,
});

function NotesWelcome() {
  return <div>Welcome to notes</div>;
}

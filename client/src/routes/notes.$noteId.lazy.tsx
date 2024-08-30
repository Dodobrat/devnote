import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/notes/$noteId")({
  component: NoteEditor,
});

function NoteEditor() {
  const noteId = Route.useParams().noteId;

  return <div>Hello {noteId}</div>;
}

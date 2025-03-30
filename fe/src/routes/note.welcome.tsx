import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/note/welcome")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/note/welcome"!</div>;
}

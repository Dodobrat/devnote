import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/note/$noteId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/note/$noteId"!</div>
}

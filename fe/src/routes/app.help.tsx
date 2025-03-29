import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/help')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/help"!</div>
}

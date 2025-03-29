import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/changelog')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/app/changelog"!</div>
}

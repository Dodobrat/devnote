import { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: Root,
    notFoundComponent: NotFound,
  },
);

function Root() {
  return (
    <main>
      <Outlet />
      <TanStackRouterDevtools />
    </main>
  );
}

function NotFound() {
  return (
    <div>
      <p>404</p>
      <Link to="/">Start Over</Link>
    </div>
  );
}

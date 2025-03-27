import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { Separator } from "~/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "~/components/ui/sidebar";

export const Route = createRootRoute({
  component: () => (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              {/* <Breadcrumb>
              <BreadcrumbList>
              <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">
              Project Management & Task Tracking
              </BreadcrumbPage>
              </BreadcrumbItem>
              </BreadcrumbList>
              </Breadcrumb> */}
            </div>
            <div className="ml-auto px-3">
              <span>hello</span>
              {/* <NavActions /> */}
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 px-4 py-10">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
      <TanStackRouterDevtools />
    </>
  ),
});

function AppSidebar() {
  return (
    <Sidebar
      // collapsible="icon"
      variant="floating"
    >
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}

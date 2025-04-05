import { useEffect, useRef } from "react";
import { type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  type FileRoutesByPath,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  GitMergeIcon,
  type LucideIcon,
  MessageCircleQuestionIcon,
  PlusIcon,
  TerminalIcon,
  WrenchIcon,
} from "lucide-react";

import { CommandPalette } from "~/blocks/CommandPalette";
import { Notes } from "~/blocks/Notes";
import { InstallButton } from "~/blocks/PWA";
import { Button } from "~/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar";
import { Toaster } from "~/components/ui/sonner";
import { getIsCreateNewNoteKeyCombo } from "~/constants/shortcuts";
import { ThemeProvider } from "~/context";
import { useKeyDownEvent, useOnlineNotification } from "~/hooks";
import {
  pinnedNotesQueryOptions,
  unPinnedNotesQueryOptions,
} from "~/hooks/query";
import { useCommandPaletteOpenAtom } from "~/hooks/store";

// ORDERED BY PRIORITY
// TODO: tooltips everywhere
// TODO: upload note
// TODO: sidebar skip to content hidden link
// TODO: PWA correct spacing
// TODO: add workspace suggestions
// TODO: translations
// TODO: general styling of the whole app to be more vibrant / coder like. Maybe add some custom fonts

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    loader: async ({ context: { queryClient } }) => {
      const pinnedNotes = await queryClient.ensureInfiniteQueryData(
        pinnedNotesQueryOptions(),
      );
      const unPinnedNotes = await queryClient.ensureInfiniteQueryData(
        unPinnedNotesQueryOptions(),
      );
      return { pinnedNotes, unPinnedNotes };
    },
  },
);

function RootComponent() {
  useOnlineNotification();

  const navigate = Route.useNavigate();
  useKeyDownEvent((e) => {
    if (getIsCreateNewNoteKeyCombo(e)) {
      e.preventDefault();
      navigate({ to: "/note/new" });
    }
  });

  return (
    <ThemeProvider>
      <InstallButton />

      <CommandPalette />

      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      <Toaster />

      {/* DEV TOOLS */}
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-left" />
    </ThemeProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <SidebarHeader>
        <LogoAction />
      </SidebarHeader>
      <SidebarContent>
        <AppLinks />
        <SidebarSeparator className="mx-0" />
        <Notes />
      </SidebarContent>
      <SidebarRail />
      <NavigationSidebarToggler />
    </Sidebar>
  );
}

function NavigationSidebarToggler() {
  const routerState = useRouterState();
  const pathRef = useRef(routerState.location.pathname);
  const path = routerState.location.pathname;

  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const currentPath = pathRef.current;
    if (currentPath !== path) {
      setOpenMobile(false);
    }
  }, [path, setOpenMobile]);

  return null;
}

function LogoAction() {
  const [, setCommandPaletteOpen] = useCommandPaletteOpenAtom();

  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex gap-2">
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
            <TerminalIcon aria-hidden className="size-4 stroke-3" />
          </div>
          <div className="grid flex-1 text-left text-2xl leading-tight">
            <span className="truncate font-bold">DevNote</span>
          </div>
        </SidebarMenuButton>
        <Button asChild variant="ghost" className="size-12">
          {/* "https://github.com/Dodobrat/devnote" */}
          <a href="https://github.com/Dodobrat" target="_blank">
            <svg
              role="img"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="size-6"
            >
              <title>GitHub</title>
              <path
                fill="currentColor"
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              />
            </svg>
            <span className="sr-only">GitHub Repository</span>
          </a>
        </Button>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type SidebarPage = {
  to: keyof FileRoutesByPath;
  label: string;
  icon: LucideIcon;
};
const pages: SidebarPage[] = [
  { to: "/note/new", label: "Create new note", icon: PlusIcon },
  { to: "/app/help", label: "Help", icon: MessageCircleQuestionIcon },
  { to: "/app/changelog", label: "Changelog", icon: GitMergeIcon },
  { to: "/app/settings", label: "Settings", icon: WrenchIcon },
];

function AppLinks() {
  const routerState = useRouterState();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {pages.map(({ to, label, icon: Icon }) => (
            <SidebarMenuItem key={to}>
              <SidebarMenuButton
                asChild
                isActive={routerState.location.pathname.includes(to)}
              >
                <Link to={to}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

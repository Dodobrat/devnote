import { useEffect, useRef, useState } from "react";
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
  ListIcon,
  type LucideIcon,
  MessageCircleQuestionIcon,
  PlusIcon,
  TerminalIcon,
  WrenchIcon,
} from "lucide-react";

import { CommandPalette } from "~/blocks/CommandPalette";
import { Notes, NotesActionModeSidebarFooter } from "~/blocks/Notes";
import { InstallButton, useServiceWorkerPrompt } from "~/blocks/PWA";
import {
  Button,
  DropdownMenu,
  Sidebar,
  Toaster,
  Tooltip,
  useSidebar,
} from "~/components/ui";
import { getIsCreateNewNoteKeyCombo } from "~/constants/shortcuts";
import { ThemeProvider } from "~/context";
import { useIsMobile, useKeyDownEvent, useOnlineNotification } from "~/hooks";
import {
  pinnedNotesQueryOptions,
  unPinnedNotesQueryOptions,
} from "~/hooks/query";
import {
  useCommandPaletteOpenAtom,
  useSidebarAtom,
  useSidebarVariantAtom,
} from "~/hooks/store";
import { cn } from "~/lib/utils";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    loader: async ({ context: { queryClient } }) => {
      await Promise.all([
        queryClient.ensureInfiniteQueryData(pinnedNotesQueryOptions()),
        queryClient.ensureInfiniteQueryData(unPinnedNotesQueryOptions()),
      ]);
    },
  },
);

function useSplashScreen() {
  useEffect(() => {
    const splashEl = document.querySelector("[data-splash]");
    if (!splashEl) return;
    splashEl.classList.add("loaded");
  }, []);
}

function RootComponent() {
  useSplashScreen();
  useOnlineNotification();
  useServiceWorkerPrompt();

  const navigate = Route.useNavigate();
  useKeyDownEvent((e) => {
    if (getIsCreateNewNoteKeyCombo(e)) {
      e.preventDefault();
      navigate({ to: "/note/new" });
    }
  });

  const [open, setOpen] = useSidebarAtom();

  return (
    <ThemeProvider>
      <CommandPalette />

      <Sidebar.Provider open={open} onOpenChange={setOpen}>
        <AppSidebar />
        <Sidebar.Inset>
          <Outlet />
        </Sidebar.Inset>
      </Sidebar.Provider>

      <Toaster />

      {/* DEV TOOLS */}
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </ThemeProvider>
  );
}

function AppSidebar() {
  return (
    <Sidebar variant="floating">
      <HiddenSkipLink href="#sidebar-end">Go to content</HiddenSkipLink>
      <div id="sidebar-start" />

      <Sidebar.Header>
        <LogoAction />
        <InstallButton />
      </Sidebar.Header>
      <Sidebar.Content>
        <AppLinks />
        <Sidebar.Separator className="mx-0" />
        <Notes />
      </Sidebar.Content>
      <NotesActionModeSidebarFooter />
      <Sidebar.Rail />
      <NavigationSidebarToggler />

      <HiddenSkipLink href="#sidebar-start" className="bottom-2">
        Go to start of navigation
      </HiddenSkipLink>
      <div id="sidebar-end" />
    </Sidebar>
  );
}

function HiddenSkipLink(props: React.ComponentProps<"a">) {
  return (
    <a
      {...props}
      className={cn(
        "text-background",
        "bg-foreground",
        "pointer-events-none",
        "absolute",
        "z-50",
        "rounded-md",
        "p-2",
        "opacity-0",
        "focus-visible:opacity-100",
        props.className,
      )}
    />
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
    <Sidebar.Menu>
      <Sidebar.MenuItem className="flex gap-2">
        <Sidebar.MenuButton
          size="lg"
          className="cursor-pointer"
          onClick={() => setCommandPaletteOpen(true)}
        >
          <div className="bg-foreground text-background flex aspect-square size-8 items-center justify-center rounded-md">
            <TerminalIcon className="size-4 stroke-3" />
          </div>
          <div className="grid flex-1 text-left text-2xl leading-tight">
            <span className="truncate font-bold">DevNote</span>
          </div>
          <span className="sr-only">Open command palette</span>
        </Sidebar.MenuButton>
        <Button asChild variant="ghost" className="size-12">
          <a href="https://github.com/Dodobrat/devnote" target="_blank">
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
      </Sidebar.MenuItem>
    </Sidebar.Menu>
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
  const [sidebarVariant] = useSidebarVariantAtom();

  if (sidebarVariant === "minimal" || sidebarVariant === "dense") {
    return <MinimalSidebarVariantGroup />;
  }

  return (
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          {pages.map(({ to, label, icon: Icon }) => (
            <Sidebar.MenuItem key={to}>
              <Sidebar.MenuButton
                asChild
                isActive={routerState.location.pathname.includes(to)}
              >
                <Link to={to}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
}

function MinimalSidebarVariantGroup() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const routerState = useRouterState();
  const isMobile = useIsMobile();

  const createNewOption = pages[0];
  const otherOptions = pages.slice(1);

  const isCreateNewActive = routerState.location.pathname.includes(
    createNewOption.to,
  );
  const isOtherOptionsActive = otherOptions.some((option) =>
    routerState.location.pathname.includes(option.to),
  );

  return (
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <Sidebar.MenuItem className="flex gap-2">
            <Sidebar.MenuButton asChild isActive={isCreateNewActive}>
              <Link to={createNewOption.to}>
                <createNewOption.icon />
                <span>{createNewOption.label}</span>
              </Link>
            </Sidebar.MenuButton>
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      size="icon"
                      variant={isOtherOptionsActive ? "outline" : "ghost"}
                    >
                      <ListIcon />
                      <span className="sr-only">More pages</span>
                      {isOtherOptionsActive && (
                        <span className="bg-foreground absolute -top-1 -right-1 size-4 rounded-full" />
                      )}
                    </Button>
                  </DropdownMenu.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>More pages</p>
                </Tooltip.Content>
              </Tooltip>

              <DropdownMenu.Content
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
                className="min-w-56"
              >
                {otherOptions.map(({ to, label, icon: Icon }) => (
                  <DropdownMenu.Item
                    key={to}
                    asChild
                    className={cn(
                      routerState.location.pathname.includes(to) &&
                        "font-semibold",
                    )}
                  >
                    <Link to={to} onPointerDown={() => setDropdownOpen(false)}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
}

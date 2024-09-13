import { useEffect } from "react";
import { NavLink, NavLinkProps, useLocation } from "react-router-dom";
import {
  CircleHelpIcon,
  LogsIcon,
  NotebookTabsIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  Settings2Icon,
  TerminalIcon,
} from "lucide-react";

import {
  openCommandPaletteBrowserShortcut,
  openCommandPaletteVSCodeShortcut,
  toggleSidebarShortcut,
} from "~/constants/shortcuts";
import { useMediaQuery } from "~/hooks";
import {
  SidebarState,
  useCommandPaletteOpenStore,
  useSidebarStateStore,
} from "~/hooks/store/layout";
import { cn, getCssVar } from "~/lib/utils";
import { AppRoutes } from "~/routes";

import {
  Button,
  ButtonProps,
  CommandShortcutSnippet,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";

const SIDEBAR_END_ID = "sidebar-end";

export function Navigation() {
  const location = useLocation();

  const isLargerThanLg = useMediaQuery(getCssVar("--screen-lg"));
  const isLargerThanMd = useMediaQuery(getCssVar("--screen-md"));

  const [sidebarState, setSidebarState] = useSidebarStateStore();
  const [, setCommandPaletteOpenState] = useCommandPaletteOpenStore();

  useEffect(() => {
    if (isLargerThanMd && !isLargerThanLg) {
      setSidebarState((v) =>
        v === SidebarState.Minimized ? v : SidebarState.Minimized,
      );
    }
  }, [isLargerThanLg, isLargerThanMd, setSidebarState]);

  const isMobileView = !isLargerThanMd && !isLargerThanLg;
  const isTabletView = isLargerThanMd && !isLargerThanLg;

  useEffect(() => {
    if (isTabletView || isMobileView) {
      setSidebarState(SidebarState.Minimized);
    }
  }, [isMobileView, isTabletView, location.pathname, setSidebarState]);

  return (
    <nav
      className={cn(
        "relative z-50 shrink-0 motion-safe:transition-[width]",
        sidebarState === SidebarState.Minimized && [
          "w-0 md:-mr-4 md:w-[4.5rem]",
          "fine:hover:[&>[data-sidebar]]:w-72",
          "fine:hover:[&>[data-sidebar]]:border-r",
          // "fine:hover:[&>[data-sidebar]]:bg-background",
          "fine:hover:[&>[data-sidebar]]:px-3",
        ],
        sidebarState === SidebarState.Expanded && [
          "w-0 md:-mr-4 md:w-[4.5rem] lg:w-72",
          "[&>[data-sidebar]]:w-72",
        ],
      )}
    >
      <a
        href={`#${SIDEBAR_END_ID}`}
        className={cn(
          "sr-only pointer-events-none z-50 bg-foreground text-background",
          "focus-visible:not-sr-only focus-visible:absolute",
        )}
      >
        Skip navigation
      </a>

      <div
        data-overlay
        className={cn(
          "pointer-events-none absolute h-screen w-screen bg-background/50 opacity-0 transition-opacity",
          !isLargerThanLg &&
            sidebarState === SidebarState.Expanded &&
            "pointer-events-auto opacity-100",
        )}
        onClick={() => setSidebarState(SidebarState.Minimized)}
      />

      <div
        data-sidebar
        className={cn(
          "absolute inset-0 h-screen",
          "w-full motion-safe:transition-[width,padding]",
          "flex flex-col items-start justify-start gap-2",
          "overflow-y-auto overflow-x-hidden",
          "bg-background px-3 py-4",
          isMobileView && sidebarState === SidebarState.Minimized && "px-0",
        )}
      >
        <div className="flex w-full items-center p-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                className="mr-4 shrink-0"
                onClick={() => setCommandPaletteOpenState(true)}
              >
                <TerminalIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Command Palette <br />
                <CommandShortcutSnippet>
                  {openCommandPaletteVSCodeShortcut}
                </CommandShortcutSnippet>{" "}
                or{" "}
                <CommandShortcutSnippet>
                  {openCommandPaletteBrowserShortcut}
                </CommandShortcutSnippet>
              </p>
            </TooltipContent>
          </Tooltip>
          <p className="whitespace-nowrap text-2xl font-bold text-foreground">
            DevNote
          </p>
        </div>
        <SidebarItem to={AppRoutes.Root}>
          <SidebarIconItem>
            <PlusIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Create new note</p>
        </SidebarItem>
        <SidebarItem to={AppRoutes.Notes}>
          <SidebarIconItem>
            <NotebookTabsIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Notes</p>
        </SidebarItem>

        <div className="grow" />

        <Separator />

        <SidebarItem to={AppRoutes.Help}>
          <SidebarIconItem>
            <CircleHelpIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Help</p>
        </SidebarItem>
        <SidebarItem to={AppRoutes.Changelog}>
          <SidebarIconItem>
            <LogsIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Changelog</p>
        </SidebarItem>
        <SidebarItem to={AppRoutes.Settings}>
          <SidebarIconItem>
            <Settings2Icon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Settings</p>
        </SidebarItem>

        <Separator />

        {/* Toggle placeholder */}
        <div className="sticky -bottom-4 h-10 w-full shrink-0 bg-gradient-to-t from-background via-background to-transparent" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="fixed bottom-4 left-4"
              onClick={() => {
                setSidebarState((v) =>
                  v === SidebarState.Minimized
                    ? SidebarState.Expanded
                    : SidebarState.Minimized,
                );
              }}
            >
              {sidebarState === SidebarState.Minimized ? (
                <PanelLeftOpenIcon />
              ) : (
                <PanelLeftCloseIcon />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>
              Toggle sidebar{" "}
              <CommandShortcutSnippet>
                {toggleSidebarShortcut}
              </CommandShortcutSnippet>
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div id={SIDEBAR_END_ID} className="sr-only" />
    </nav>
  );
}

function SidebarItem(props: NavLinkProps) {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        cn(
          "flex w-full items-center rounded-lg p-1",
          "focus:outline-none focus-visible:ring",
          "hover:bg-muted",
          isActive && "ring ring-secondary focus-visible:ring-primary",
          props.className,
        )
      }
    />
  );
}

function SidebarIconItem(props: ButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      tabIndex={-1}
      {...props}
      className={cn("mr-4 shrink-0", props.className)}
    />
  );
}

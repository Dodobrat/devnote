import { cloneElement, useEffect, useState } from "react";
import {
  NavLink,
  NavLinkProps,
  useLocation,
  useOutlet,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  CircleHelpIcon,
  FileCode2Icon,
  LogsIcon,
  NotebookTabsIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";

import { useMediaQuery } from "~/hooks";
import { cn, getCssVar } from "~/lib/utils";
import { AppRoutes } from "~/routes";

import {
  Button,
  ButtonProps,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";

function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={true}>
      {element && cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
}

export function Layout() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <Navigation />
      <AnimatedOutlet />
    </div>
  );
}

enum SidebarState {
  Minimized = "minimized",
  Expanded = "expanded",
}

function Navigation() {
  const location = useLocation();

  const isLargerThanLg = useMediaQuery(getCssVar("--screen-lg"));
  const isLargerThanMd = useMediaQuery(getCssVar("--screen-md"));

  const [sidebarState, setSidebarState] = useState(
    isLargerThanLg ? SidebarState.Expanded : SidebarState.Minimized,
  );

  useEffect(() => {
    if (isLargerThanMd && !isLargerThanLg) {
      setSidebarState((v) =>
        v === SidebarState.Minimized ? v : SidebarState.Minimized,
      );
    }
  }, [isLargerThanLg, isLargerThanMd]);

  const isMobileView = !isLargerThanMd && !isLargerThanLg;
  const isTabletView = isLargerThanMd && !isLargerThanLg;

  useEffect(() => {
    if (isTabletView) {
      setSidebarState(SidebarState.Minimized);
    }
  }, [isTabletView, location.pathname]);

  return (
    <nav
      className={cn(
        "relative z-50 shrink-0 transition-[width]",
        sidebarState === SidebarState.Minimized &&
          "w-0 md:-mr-4 md:w-[4.5rem] fine:hover:[&>[data-sidebar]]:w-72 fine:hover:[&>[data-sidebar]]:border-r fine:hover:[&>[data-sidebar]]:bg-background fine:hover:[&>[data-sidebar]]:px-3",
        sidebarState === SidebarState.Expanded &&
          "w-0 md:w-[4.5rem] lg:w-72 [&>[data-sidebar]]:w-72",
      )}
    >
      {/* TODO: skip navigation link */}

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
          "flex flex-col items-start justify-start gap-2",
          "overflow-y-auto overflow-x-hidden",
          "bg-background px-3 py-4",
          sidebarState === SidebarState.Minimized && "bg-transparent",
          isMobileView && sidebarState === SidebarState.Minimized && "px-0",
        )}
      >
        <SidebarItem to={AppRoutes.Root}>
          <SidebarIconItem variant="default">
            <FileCode2Icon />
          </SidebarIconItem>
          <p className="whitespace-nowrap text-2xl font-bold text-foreground">
            DevNote
          </p>
        </SidebarItem>
        {/* <SidebarItem to={AppRoutes.GoPremium}>
          <SidebarIconItem>
            <CrownIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Go Premium</p>
        </SidebarItem> */}
        {/* <SidebarItem to={AppRoutes.Account}>
          <SidebarIconItem>
            <UserRoundIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Account</p>
        </SidebarItem> */}
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
        {/* <SidebarItem to={AppRoutes.Search}>
          <SidebarIconItem>
            <SearchIcon className="size-5" />
          </SidebarIconItem>
          <p className="whitespace-nowrap">Search</p>
        </SidebarItem> */}

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
            <p>Toggle sidebar</p>
          </TooltipContent>
        </Tooltip>
      </div>
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
          isActive && "",
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

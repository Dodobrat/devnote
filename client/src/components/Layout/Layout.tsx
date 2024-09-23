import { cloneElement, useEffect, useMemo, useState } from "react";
import {
  generatePath,
  NavLink,
  NavLinkProps,
  useLocation,
  useNavigate,
  useOutlet,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  CircleHelpIcon,
  LogsIcon,
  MilestoneIcon,
  NotebookTabsIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PlusIcon,
  Settings2Icon,
  StickyNoteIcon,
  TerminalIcon,
  WifiIcon,
  WifiOffIcon,
} from "lucide-react";
import { ExternalToast, toast } from "sonner";

import {
  collapseEditorPanelShortcut,
  collapsePreviewPanelShortcut,
  createNewNoteShortcut,
  getIsCreateNewNoteKeyCombo,
  getIsOpenCommandPaletteBrowserKeyCombo,
  getIsOpenCommandPaletteVSCodeKeyCombo,
  getIsToggleSidebarKeyCombo,
  openCommandPaletteBrowserShortcut,
  openCommandPaletteVSCodeShortcut,
  resetEditorPanelSizesShortcut,
  toggleSidebarShortcut,
  toggleSplitViewModeShortcut,
} from "~/constants/shortcuts";
import { useActions, useKeyDownEvent, useMediaQuery } from "~/hooks";
import { useSearchNotes } from "~/hooks/query";
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
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommandShortcutSnippet,
  DialogDescription,
  DialogTitle,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <GlobalKeyboardShortcuts />
      <OnlineIndicator />

      <CommandPalette />

      <Navigation />

      <AnimatedOutlet />
    </div>
  );
}

/**
 * Animated Outlet
 */

function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait" initial={true}>
      {element && cloneElement(element, { key: location.pathname })}
    </AnimatePresence>
  );
}

/**
 * Global Keyboard Shortcuts
 */

function GlobalKeyboardShortcuts() {
  const navigate = useNavigate();

  const { toggleSidebar } = useActions();

  useKeyDownEvent((e) => {
    if (getIsToggleSidebarKeyCombo(e)) {
      e.preventDefault();
      toggleSidebar();
    }
  });

  useKeyDownEvent((e) => {
    if (getIsCreateNewNoteKeyCombo(e)) {
      e.preventDefault();
      navigate(AppRoutes.Root);
    }
  });

  return null;
}

/**
 * Online Indicator
 */

const commonOnlineIndicatorOptions: ExternalToast = {
  id: "online-indicator",
  duration: 1000 * 30,
  closeButton: true,
};

function OnlineIndicator() {
  useEffect(() => {
    const handleOnline = () => {
      toast.info("You are online", {
        icon: <WifiIcon />,
        ...commonOnlineIndicatorOptions,
      });
    };

    const handleOffline = () => {
      toast.info("You are offline", {
        icon: <WifiOffIcon />,
        ...commonOnlineIndicatorOptions,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return null;
}

/**
 * Command Palette
 */

function CommandPalette() {
  const [open, setOpen] = useCommandPaletteOpenStore();
  const [prompt, setPrompt] = useState("");

  useKeyDownEvent((e) => {
    if (
      getIsOpenCommandPaletteVSCodeKeyCombo(e) ||
      getIsOpenCommandPaletteBrowserKeyCombo(e)
    ) {
      e.preventDefault();
      setOpen(true);
    }
  });

  const closeAndReset = () => {
    setOpen(false);
    setPrompt("");
  };

  const isPathCommand = prompt.startsWith("/");
  const isActionCommand = prompt.startsWith(">");
  const isNotePrompt = Boolean(prompt) && !isPathCommand && !isActionCommand;

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={!isNotePrompt}
    >
      <DialogTitle className="sr-only">Command prompt</DialogTitle>
      <DialogDescription className="sr-only">
        Execute actions or navigate to pages
      </DialogDescription>
      <CommandInput
        placeholder="Type a command or search..."
        value={prompt}
        onValueChange={setPrompt}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!prompt && (
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => setPrompt("/")}>
              <MilestoneIcon className="mr-2 size-4" />
              <span>
                Start with a <code className="rounded border px-1">/</code> to
                navigate to a page
              </span>
            </CommandItem>
            <CommandItem onSelect={() => setPrompt(">")}>
              <TerminalIcon className="mr-2 size-4" />
              <span>
                Start with a <code className="rounded border px-1">&gt;</code>{" "}
                to execute an action
              </span>
            </CommandItem>
            <CommandItem>
              <StickyNoteIcon className="mr-2 size-4" />
              <span>Start with a word to search for notes by title</span>
            </CommandItem>
          </CommandGroup>
        )}

        <PageCommandGroup
          show={isPathCommand}
          prompt={prompt}
          closeAndReset={closeAndReset}
        />
        <ActionsCommandGroup
          show={isActionCommand}
          prompt={prompt}
          closeAndReset={closeAndReset}
        />
        <NotesCommandGroup
          show={isNotePrompt}
          prompt={prompt}
          closeAndReset={closeAndReset}
        />
      </CommandList>
    </CommandDialog>
  );
}

type CommandGroupProps = {
  show: boolean;
  prompt: string;
  closeAndReset: () => void;
};

type CommandEntry = {
  label: string;
  shortcut?: string;
};

type PageCommandEntry = CommandEntry & { to: AppRoutes };
const pages: PageCommandEntry[] = [
  {
    to: AppRoutes.Root,
    label: "New note",
    shortcut: createNewNoteShortcut,
  },
  { to: AppRoutes.Notes, label: "List all notes" },
  { to: AppRoutes.Help, label: "Help" },
  { to: AppRoutes.Changelog, label: "Changelog" },
  { to: AppRoutes.Settings, label: "Settings" },
];

function PageCommandGroup({ show, prompt, closeAndReset }: CommandGroupProps) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <>
      <CommandGroup heading="Pages">
        {pages.map(({ to, label, shortcut }) => (
          <CommandItem
            key={to}
            onSelect={() => {
              navigate(to);
              closeAndReset();
            }}
            keywords={[to, label]}
          >
            <MilestoneIcon className="mr-2 size-4" />
            <span>{label}</span>
            {Boolean(shortcut) && <CommandShortcut>{shortcut}</CommandShortcut>}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="">
        <CommandItem
          onSelect={() => {
            navigate(prompt);
            closeAndReset();
          }}
        >
          <MilestoneIcon className="mr-2 size-4" />
          <span>Go to {prompt}</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

function NotesCommandGroup({ show, prompt, closeAndReset }: CommandGroupProps) {
  const navigate = useNavigate();

  const { data } = useSearchNotes(prompt);

  if (!show) return null;
  if (!data?.length) return null;

  return (
    <CommandGroup heading="Notes">
      {data.map((note) => (
        <CommandItem
          key={note.id}
          onSelect={() => {
            navigate(generatePath(AppRoutes.NoteById, { id: String(note.id) }));
            closeAndReset();
          }}
        >
          <StickyNoteIcon className="mr-2 size-4" />
          <span>{note.title}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

type ActionCommandEntry = CommandEntry & { action: () => void };

function ActionsCommandGroup({ show, closeAndReset }: CommandGroupProps) {
  const actions = useActions();

  const commandActions = useMemo(
    () =>
      [
        { label: "Change to the light theme", action: actions.setLightTheme },
        { label: "Change to the dark theme", action: actions.setDarkTheme },
        { label: "Change to the system theme", action: actions.setSystemTheme },
        { label: "Toggle note autosave", action: actions.toggleEditorAutosave },
        {
          label: "Collapse editor panel",
          shortcut: collapseEditorPanelShortcut,
          action: actions.collapseEditorPanel,
        },
        {
          label: "Collapse preview panel",
          shortcut: collapsePreviewPanelShortcut,
          action: actions.collapsePreviewPanel,
        },
        {
          label: "Reset editor panel sizes",
          shortcut: resetEditorPanelSizesShortcut,
          action: actions.resetPanelSizes,
        },
        {
          label: "Toggle split view mode between horizontal and vertical",
          shortcut: toggleSplitViewModeShortcut,
          action: actions.toggleSplitViewMode,
        },
        {
          label: "Toggle sidebar open/closed",
          shortcut: toggleSidebarShortcut,
          action: actions.toggleSidebar,
        },
      ] satisfies ActionCommandEntry[],
    [actions],
  );

  if (!show) return null;

  return (
    <CommandGroup heading="Actions">
      {commandActions.map(({ label, action, shortcut }) => (
        <CommandItem
          key={label}
          onSelect={() => {
            action();
            closeAndReset();
          }}
          keywords={[">", label]}
        >
          <TerminalIcon className="mr-2 size-4" />
          <span>{label}</span>
          {Boolean(shortcut) && <CommandShortcut>{shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

/**
 * Navigation
 */

const SIDEBAR_END_ID = "sidebar-end";

function Navigation() {
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

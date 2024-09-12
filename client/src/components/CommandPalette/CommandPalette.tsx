import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MilestoneIcon, StickyNoteIcon, TerminalIcon } from "lucide-react";

import { useActions, useKeyDownEvent } from "~/hooks";
import { getIsMac } from "~/lib/utils";
import { AppRoutes } from "~/routes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  DialogDescription,
  DialogTitle,
} from "../ui";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  useKeyDownEvent((e, isMac) => {
    // if key combination is ctrl / cmd + k
    // if key combination is ctrl / cmd + Shift + p
    if (
      ((isMac ? e.metaKey : e.ctrlKey) && e.key === "k") ||
      ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "p")
    ) {
      e.preventDefault();
      setOpen(true);
    }
  });

  const closeAndReset = () => {
    setOpen(false);
    setPrompt("");
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
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

        <PageCommandGroup prompt={prompt} closeAndReset={closeAndReset} />
        <ActionsCommandGroup prompt={prompt} closeAndReset={closeAndReset} />
      </CommandList>
    </CommandDialog>
  );
}

type CommandEntry = {
  label: string;
  shortcut?: string;
};

type PageCommandEntry = CommandEntry & { to: AppRoutes };
const pages: PageCommandEntry[] = [
  {
    to: AppRoutes.Root,
    label: "New note",
    shortcut: `${getIsMac() ? "⌘" : "Ctrl"} + Enter`,
  },
  { to: AppRoutes.Notes, label: "List all notes" },
  { to: AppRoutes.Help, label: "Help" },
  { to: AppRoutes.Changelog, label: "Changelog" },
  { to: AppRoutes.Settings, label: "Settings" },
];

function PageCommandGroup({
  prompt,
  closeAndReset,
}: {
  prompt: string;
  closeAndReset: () => void;
}) {
  const navigate = useNavigate();

  const isPagePrompt = prompt.startsWith("/");
  if (!isPagePrompt) return null;

  return (
    <CommandGroup heading="Pages">
      {pages.map(({ to, label, shortcut }) => (
        <CommandItem
          onSelect={() => {
            navigate(to);
            closeAndReset();
          }}
          key={to}
          keywords={[to, label]}
        >
          <MilestoneIcon className="mr-2 size-4" />
          <span>{label}</span>
          {Boolean(shortcut) && <CommandShortcut>{shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
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
  );
}

type ActionCommandEntry = CommandEntry & { action: () => void };

function ActionsCommandGroup({
  prompt,
  closeAndReset,
}: {
  prompt: string;
  closeAndReset: () => void;
}) {
  const actions = useActions();

  const commandActions = useMemo(() => {
    const options: ActionCommandEntry[] = [
      {
        label: "> Change to the light theme",
        action: actions.setLightTheme,
      },
      {
        label: "> Change to the dark theme",
        action: actions.setDarkTheme,
      },
      {
        label: "> Change to the system theme",
        action: actions.setSystemTheme,
      },
      {
        label: "> Collapse editor panel",
        shortcut: `${getIsMac() ? "⌘" : "Ctrl"} + Shift + ,`,
        action: actions.collapseEditorPanel,
      },
      {
        label: "> Collapse preview panel",
        shortcut: `${getIsMac() ? "⌘" : "Ctrl"} + Shift + .`,
        action: actions.collapsePreviewPanel,
      },
      {
        label: "> Reset editor panel sizes",
        shortcut: `${getIsMac() ? "⌘" : "Ctrl"} + Shift + ;`,
        action: actions.resetPanelSizes,
      },
      {
        label: "> Toggle split view mode between horizontal and vertical",
        shortcut: `${getIsMac() ? "⌘" : "Ctrl"} + Shift + M`,
        action: actions.toggleSplitViewMode,
      },
      {
        label: "> Toggle note autosave",
        action: actions.toggleEditorAutosave,
      },
      {
        label: "> Toggle sidebar open/closed",
        shortcut: `${getIsMac() ? "⌘" : "Ctrl"} + B`,
        action: actions.toggleSidebar,
      },
    ];

    return options;
  }, [actions]);

  const isActionPrompt = prompt.startsWith(">");

  if (!isActionPrompt) return null;

  return (
    <CommandGroup heading="Actions">
      {commandActions.map(({ label, action, shortcut }) => (
        <CommandItem
          onSelect={() => {
            action();
            closeAndReset();
          }}
          key={label}
          keywords={[label]}
        >
          <TerminalIcon className="mr-2 size-4" />
          <span>{label.replace("> ", "")}</span>
          {Boolean(shortcut) && <CommandShortcut>{shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

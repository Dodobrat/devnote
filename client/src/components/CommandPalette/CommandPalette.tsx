import { useMemo, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { MilestoneIcon, StickyNoteIcon, TerminalIcon } from "lucide-react";

import {
  collapseEditorPanelShortcut,
  collapsePreviewPanelShortcut,
  createNewNoteShortcut,
  getIsOpenCommandPaletteBrowserKeyCombo,
  getIsOpenCommandPaletteVSCodeKeyCombo,
  resetEditorPanelSizesShortcut,
  toggleSidebarShortcut,
  toggleSplitViewModeShortcut,
} from "~/constants/shortcuts";
import { useActions, useKeyDownEvent } from "~/hooks";
import { useNotes } from "~/hooks/query";
import { useCommandPaletteOpenStore } from "~/hooks/store/layout";
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

        <PageCommandGroup prompt={prompt} closeAndReset={closeAndReset} />
        <ActionsCommandGroup prompt={prompt} closeAndReset={closeAndReset} />
        <NotesCommandGroup prompt={prompt} closeAndReset={closeAndReset} />
      </CommandList>
    </CommandDialog>
  );
}

type CommandGroupProps = {
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

function PageCommandGroup({ prompt, closeAndReset }: CommandGroupProps) {
  const navigate = useNavigate();

  const isPagePrompt = prompt.startsWith("/");

  if (!isPagePrompt) return null;

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

function NotesCommandGroup({ prompt, closeAndReset }: CommandGroupProps) {
  const navigate = useNavigate();

  const { data } = useNotes(prompt || undefined);

  const isPathCommand = prompt.startsWith("/");
  const isActionCommand = prompt.startsWith(">");
  const isNotePrompt = Boolean(prompt) && !isPathCommand && !isActionCommand;

  if (!isNotePrompt) return null;
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
          <span>{note.previewTitle}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

type ActionCommandEntry = CommandEntry & { action: () => void };
function ActionsCommandGroup({ prompt, closeAndReset }: CommandGroupProps) {
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

  const isActionPrompt = prompt.startsWith(">");

  if (!isActionPrompt) return null;

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

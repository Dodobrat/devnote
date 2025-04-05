import { useState } from "react";
import { type FileRoutesByPath, useNavigate } from "@tanstack/react-router";
import {
  CheckIcon,
  MilestoneIcon,
  StickyNoteIcon,
  TerminalIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommandShortcutSnippet,
} from "~/components/ui/command";
import {
  createNewNoteShortcut,
  getIsOpenCommandPaletteBrowserKeyCombo,
  getIsOpenCommandPaletteVSCodeKeyCombo,
} from "~/constants/shortcuts";
import { useTheme } from "~/context";
import { useKeyDownEvent } from "~/hooks";
import { useSearchNotes } from "~/hooks/query";
import {
  useCommandPaletteOpenAtom,
  useEditorAutosaveAtom,
  useEditorContainedWidthAtom,
} from "~/hooks/store";

export function CommandPalette() {
  const [commandPaletteOpen, setCommandPaletteOpen] =
    useCommandPaletteOpenAtom();
  const [prompt, setPrompt] = useState("");

  useKeyDownEvent((e) => {
    if (getIsOpenCommandPaletteBrowserKeyCombo(e)) {
      e.preventDefault();
      setCommandPaletteOpen(true);
    }
  });

  useKeyDownEvent((e) => {
    if (getIsOpenCommandPaletteVSCodeKeyCombo(e)) {
      e.preventDefault();
      setCommandPaletteOpen(true);
      setPrompt(">");
    }
  });

  const isPathCommand = prompt.startsWith("/");
  const isActionCommand = prompt.startsWith(">");
  const isNotePrompt = Boolean(prompt) && !isPathCommand && !isActionCommand;

  const close = () => setCommandPaletteOpen(false);

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      shouldFilter={!isNotePrompt}
    >
      <CommandInput
        value={prompt}
        onValueChange={setPrompt}
        placeholder="Type a command or search..."
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!prompt && (
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => setPrompt("/")}>
              <MilestoneIcon />
              <span>
                Start with a <CommandShortcutSnippet>/</CommandShortcutSnippet>{" "}
                to navigate to a page
              </span>
            </CommandItem>
            <CommandItem onSelect={() => setPrompt(">")}>
              <TerminalIcon />
              <span>
                Start with a{" "}
                <CommandShortcutSnippet>&gt;</CommandShortcutSnippet> to execute
                an action
              </span>
            </CommandItem>
            <CommandItem>
              <StickyNoteIcon />
              <span>Start with a word to search for notes by title</span>
            </CommandItem>
          </CommandGroup>
        )}

        <PageCommandGroup show={isPathCommand} prompt={prompt} close={close} />
        <ActionsCommandGroup
          show={isActionCommand}
          prompt={prompt}
          close={close}
        />
        <NotesCommandGroup show={isNotePrompt} prompt={prompt} close={close} />
      </CommandList>
    </CommandDialog>
  );
}

type CommandGroupProps = {
  show: boolean;
  prompt: string;
  close: () => void;
};

type CommandEntry = {
  label: string;
  shortcut?: string;
};

type PageCommandEntry = CommandEntry & { to: keyof FileRoutesByPath };
const pages: PageCommandEntry[] = [
  {
    to: "/note/new",
    label: "New note",
    shortcut: createNewNoteShortcut,
  },
  { to: "/note/welcome", label: "Edit welcome message" },
  { to: "/app/help", label: "Help" },
  { to: "/app/changelog", label: "Changelog" },
  { to: "/app/settings", label: "Settings" },
];

function PageCommandGroup({ show, prompt, close }: CommandGroupProps) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <>
      <CommandGroup heading="Pages">
        {pages.map(({ to, label, shortcut }) => (
          <CommandItem
            key={to}
            onSelect={() => {
              navigate({ to });
              close();
            }}
            keywords={[to, label]}
          >
            <MilestoneIcon />
            <span className="grow">{label}</span>
            {Boolean(shortcut) && <CommandShortcut>{shortcut}</CommandShortcut>}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="">
        <CommandItem
          onSelect={() => {
            navigate({ to: prompt });
            close();
          }}
        >
          <MilestoneIcon />
          <span>Go to {prompt}</span>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

function NotesCommandGroup({ show, prompt, close }: CommandGroupProps) {
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
            navigate({ to: "/note/$noteId", params: { noteId: note.id } });
            close();
          }}
        >
          <StickyNoteIcon />
          <span>{note.title}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

type ActionCommandEntry = CommandEntry & {
  action: () => void;
  checked: boolean;
};

function ActionsCommandGroup({ show, close }: CommandGroupProps) {
  const { theme, setTheme } = useTheme();
  const [editorAutosave, setEditorAutosave] = useEditorAutosaveAtom();
  const [editorContained, setEditorContainedWidth] =
    useEditorContainedWidthAtom();

  const commandActions: ActionCommandEntry[] = [
    {
      label: "Change to the light theme",
      action: () => setTheme("light"),
      checked: theme === "light",
    },
    {
      label: "Change to the dark theme",
      action: () => setTheme("dark"),
      checked: theme === "dark",
    },
    {
      label: "Change to the system theme",
      action: () => setTheme("system"),
      checked: theme === "system",
    },
    {
      label: "Toggle note autosave",
      action: () => setEditorAutosave((v) => !v),
      checked: editorAutosave,
    },
    {
      label: "Toggle contained width",
      action: () => setEditorContainedWidth((v) => !v),
      checked: editorContained,
    },
  ];

  if (!show) return null;

  return (
    <CommandGroup heading="Actions">
      {commandActions.map(({ label, action, shortcut, checked }) => (
        <CommandItem
          key={label}
          onSelect={() => {
            action();
            close();
          }}
          keywords={[">", label]}
        >
          <TerminalIcon />
          <span className="mr-auto grow">{label}</span>
          {checked && <CheckIcon />}
          {Boolean(shortcut) && <CommandShortcut>{shortcut}</CommandShortcut>}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

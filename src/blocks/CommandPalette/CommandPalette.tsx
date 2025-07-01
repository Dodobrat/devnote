import { useState } from "react";
import { type FileRoutesByPath, useNavigate } from "@tanstack/react-router";
import {
  CheckIcon,
  MilestoneIcon,
  StickyNoteIcon,
  TerminalIcon,
} from "lucide-react";

import { TagList } from "~/components/TagList";
import { Command } from "~/components/ui";
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
  useEditorSyncScrollAtom,
  useSidebarLinksVariantAtom,
  useSidebarNotesVariantAtom,
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
    <Command.Dialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      shouldFilter={!isNotePrompt}
    >
      <Command.Input
        value={prompt}
        onValueChange={setPrompt}
        placeholder="Type a command or search..."
      />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>

        {!prompt && (
          <Command.Group heading="Suggestions">
            <Command.Item onSelect={() => setPrompt("/")}>
              <MilestoneIcon />
              <span>
                Start with a{" "}
                <Command.ShortcutSnippet>/</Command.ShortcutSnippet> to navigate
                to a page
              </span>
            </Command.Item>
            <Command.Item onSelect={() => setPrompt(">")}>
              <TerminalIcon />
              <span>
                Start with a{" "}
                <Command.ShortcutSnippet>&gt;</Command.ShortcutSnippet> to
                execute an action
              </span>
            </Command.Item>
            <Command.Item>
              <StickyNoteIcon />
              <span>Start with a word to search for notes by title</span>
            </Command.Item>
          </Command.Group>
        )}

        <PageCommandGroup show={isPathCommand} prompt={prompt} close={close} />
        <ActionsCommandGroup
          show={isActionCommand}
          prompt={prompt}
          close={close}
        />
        <NotesCommandGroup show={isNotePrompt} prompt={prompt} close={close} />
      </Command.List>
    </Command.Dialog>
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
      <Command.Group heading="Pages">
        {pages.map(({ to, label, shortcut }) => (
          <Command.Item
            key={to}
            onSelect={() => {
              navigate({ to });
              close();
            }}
            keywords={[to, label]}
          >
            <MilestoneIcon />
            <span className="grow">{label}</span>
            {Boolean(shortcut) && (
              <Command.Shortcut>{shortcut}</Command.Shortcut>
            )}
          </Command.Item>
        ))}
      </Command.Group>
      <Command.Group heading="">
        <Command.Item
          onSelect={() => {
            navigate({ to: prompt });
            close();
          }}
        >
          <MilestoneIcon />
          <span>Go to {prompt}</span>
        </Command.Item>
      </Command.Group>
    </>
  );
}

function NotesCommandGroup({ show, prompt, close }: CommandGroupProps) {
  const navigate = useNavigate();

  const { data } = useSearchNotes(prompt);

  if (!show) return null;
  if (!data?.length) return null;

  return (
    <Command.Group heading="Notes">
      {data.map((note) => (
        <Command.Item
          key={note.id}
          onSelect={() => {
            navigate({ to: "/note/$noteId", params: { noteId: note.id } });
            close();
          }}
        >
          <div className="-my-1 grid gap-2">
            <p className="flex items-center gap-2 text-lg leading-tight font-semibold">
              <StickyNoteIcon />
              <span>{note.title}</span>
            </p>
            {Boolean(note.tags.length) && <TagList tags={note.tags} />}
          </div>
        </Command.Item>
      ))}
    </Command.Group>
  );
}

type ActionCommandEntry = CommandEntry & {
  action: () => void;
  checked: boolean;
};

function ActionsCommandGroup({ show, close }: CommandGroupProps) {
  const { theme, setTheme } = useTheme();
  const [sidebarNotesVariant, setSidebarNotesVariant] =
    useSidebarNotesVariantAtom();
  const [sidebarLinksVariant, setSidebarLinksVariant] =
    useSidebarLinksVariantAtom();
  const [editorAutosave, setEditorAutosave] = useEditorAutosaveAtom();
  const [scrollSync, setScrollSync] = useEditorSyncScrollAtom();
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
      label: "Change to 'default' sidebar links variant",
      action: () => setSidebarLinksVariant("default"),
      checked: sidebarLinksVariant === "default",
    },
    {
      label: "Change to 'minimal' sidebar links variant",
      action: () => setSidebarLinksVariant("minimal"),
      checked: sidebarLinksVariant === "minimal",
    },
    {
      label: "Change to 'dense' sidebar links variant",
      action: () => setSidebarLinksVariant("dense"),
      checked: sidebarLinksVariant === "dense",
    },
    {
      label: "Change to 'default' sidebar notes variant",
      action: () => setSidebarNotesVariant("default"),
      checked: sidebarNotesVariant === "default",
    },
    {
      label: "Change to 'minimal' sidebar notes variant",
      action: () => setSidebarNotesVariant("minimal"),
      checked: sidebarNotesVariant === "minimal",
    },
    {
      label: "Change to 'dense' sidebar notes variant",
      action: () => setSidebarNotesVariant("dense"),
      checked: sidebarNotesVariant === "dense",
    },
    {
      label: "Toggle note autosave",
      action: () => setEditorAutosave((v) => !v),
      checked: editorAutosave,
    },
    {
      label: "Toggle editor synced scroll",
      action: () => setScrollSync((v) => !v),
      checked: scrollSync,
    },
    {
      label: "Toggle contained width",
      action: () => setEditorContainedWidth((v) => !v),
      checked: editorContained,
    },
  ];

  if (!show) return null;

  return (
    <Command.Group heading="Actions">
      {commandActions.map(({ label, action, shortcut, checked }) => (
        <Command.Item
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
          {Boolean(shortcut) && <Command.Shortcut>{shortcut}</Command.Shortcut>}
        </Command.Item>
      ))}
    </Command.Group>
  );
}

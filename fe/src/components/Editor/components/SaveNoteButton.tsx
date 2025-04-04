import { useEffect } from "react";
import { useBlocker, useRouterState } from "@tanstack/react-router";
import { type EditorView } from "codemirror";
import { SaveIcon } from "lucide-react";

import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import { CommandShortcutSnippet } from "~/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { saveCurrentNoteShortcut } from "~/constants/shortcuts";
import { useCodeMirrorInstance } from "~/context";
import {
  useEditorNote,
  useEditorNotePrevState,
  useEditorWelcomeNote,
} from "~/hooks/store";
import { cn } from "~/lib/utils";

export function SaveNoteButton({
  saveNote,
  noteValue,
}: {
  saveNote: (editor: EditorView | undefined) => void;
  noteValue?: string;
}) {
  const routerState = useRouterState();
  const matches = routerState.matches;
  const editNoteRouteMatch = matches.find((m) => m.routeId === "/note/$noteId");
  const id = editNoteRouteMatch?.params?.noteId;

  const { codeMirrorInstance } = useCodeMirrorInstance();

  const { note } = useEditorNote();

  const [prevNote, setPrevNote] = useEditorNotePrevState();
  const [welcomeNote] = useEditorWelcomeNote();

  useEffect(() => {
    if (!noteValue) return;
    setPrevNote(noteValue);
  }, [noteValue, setPrevNote]);

  const isDiff = note !== prevNote;
  const isDirty = id ? isDiff : note !== welcomeNote;

  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    withResolver: true,
    disabled: !isDirty,
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="relative shrink-0"
            disabled={!codeMirrorInstance}
            onClick={() => saveNote(codeMirrorInstance)}
          >
            <SaveIcon aria-hidden />
            <span
              className={cn(
                "bg-primary pointer-events-none absolute top-1 left-6 inline-block size-3 rounded-full transition-transform",
                isDirty ? "scale-100" : "scale-0",
              )}
            />
            <span className="sr-only">Save note</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            Save note{" "}
            <CommandShortcutSnippet>
              {saveCurrentNoteShortcut}
            </CommandShortcutSnippet>
          </p>
        </TooltipContent>
      </Tooltip>

      <ResponsiveConfirmation
        open={blocker.status === "blocked"}
        onContinue={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
        labels={{
          title: "Are you absolutely sure?",
          desc: "You will lose your changes if you don't save them.",
          cancel: "Cancel",
          continue: "Continue",
        }}
      />
    </>
  );
}

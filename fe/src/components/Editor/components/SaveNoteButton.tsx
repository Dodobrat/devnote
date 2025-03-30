import { useEffect } from "react";
import { useBlocker, useParams } from "@tanstack/react-router";
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
import { useNote } from "~/hooks/query";
import {
  useEditorAutosave,
  useEditorNote,
  useEditorNotePrevState,
  useEditorWelcomeNote,
} from "~/hooks/store";
import { cn } from "~/lib/utils";

export function SaveNoteButton({
  saveNote,
}: {
  saveNote: (editor: EditorView | undefined) => void;
}) {
  const id = useParams({
    from: "/note/$noteId",
    select: ({ noteId }) => noteId,
  });

  const [autoSaveEnabled] = useEditorAutosave();

  const { codeMirrorInstance } = useCodeMirrorInstance();

  const { note } = useEditorNote();
  const { data } = useNote(id || "");

  const [prevNote, setPrevNote] = useEditorNotePrevState();
  const [welcomeNote] = useEditorWelcomeNote();

  useEffect(() => {
    if (!data?.note) return;
    setPrevNote(data?.note);
  }, [data?.note, setPrevNote]);

  const isDiff = note !== prevNote;
  const isDirty = id ? isDiff : note !== welcomeNote;

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) => {
      return isDirty && current.fullPath !== next.fullPath;
    },
    withResolver: true,
  });

  // TODO: verify this works
  // useBeforeUnload(
  //   useCallback(
  //     (e) => {
  //       if (!isDirty) return;
  //       // if dirty, show browser confirm dialog
  //       e.preventDefault();
  //     },
  //     [isDirty],
  //   ),
  // );

  return (
    <div className="flex items-center justify-end gap-2">
      {id ? (
        <p className="hidden text-right leading-tight md:block">
          Autosave {autoSaveEnabled ? <b>Enabled</b> : <b>Disabled</b>}
        </p>
      ) : (
        <p className="hidden text-right leading-tight md:block">
          Autosave is disabled while creating a note
        </p>
      )}
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
          <hr className="my-1 block md:hidden" />
          {id ? (
            <p className="block md:hidden">
              Autosave {autoSaveEnabled ? <b>Enabled</b> : <b>Disabled</b>}
            </p>
          ) : (
            <p className="block md:hidden">
              Autosave is unavailable while creating a note
            </p>
          )}
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
    </div>
  );
}

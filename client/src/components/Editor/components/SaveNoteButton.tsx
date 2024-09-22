import { useEffect } from "react";
import { useBlocker, useParams } from "react-router-dom";
import { SaveIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  CommandShortcutSnippet,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { saveCurrentNoteShortcut } from "~/constants/shortcuts";
import { useMonacoInstance } from "~/context";
import { useNote, useSaveNote } from "~/hooks/query";
import {
  useEditorAutosave,
  useEditorLayoutState,
  useEditorNote,
  useEditorNotePrevState,
  useEditorWelcomeNote,
} from "~/hooks/store/editor";
import { cn } from "~/lib/utils";

// (function () {
//   const handleOnBeforeUnload = (e: BeforeUnloadEvent) => {
//     const getIsDirty = () => Boolean(sessionStorage.getItem("isDirty"));
//     if (!getIsDirty()) return;
//     e.stopImmediatePropagation();
//     e.preventDefault();
//   };

//   window.addEventListener("beforeunload", handleOnBeforeUnload, {
//     capture: true,
//   });
// })();

export function SaveNoteButton() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [autoSaveEnabled] = useEditorAutosave();
  const [state] = useEditorLayoutState();
  const isHorizontal = state.direction === "horizontal";

  const { monacoInstance } = useMonacoInstance();

  const { note } = useEditorNote();
  const { data } = useNote(id || "");

  const [prevNote, setPrevNote] = useEditorNotePrevState();
  const [welcomeNote] = useEditorWelcomeNote();

  const saveNote = useSaveNote();

  useEffect(() => {
    if (!data?.note) return;
    setPrevNote(data?.note);
  }, [data?.note, setPrevNote]);

  const isDiff = note !== prevNote;
  const isDirty = id ? isDiff : note !== welcomeNote;

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    sessionStorage.setItem("isDirty", isDirty ? "1" : "");
    return () => sessionStorage.removeItem("isDirty");
  }, [isDirty]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="relative"
            disabled={!monacoInstance}
            onClick={() => saveNote(monacoInstance)}
          >
            <SaveIcon />
            <span
              className={cn(
                "pointer-events-none absolute left-6 top-1 inline-block size-3 rounded-full bg-primary transition-transform",
                isDirty ? "scale-100" : "scale-0",
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={isHorizontal ? "right" : "top"}>
          <p>
            Save note{" "}
            <CommandShortcutSnippet>
              {saveCurrentNoteShortcut}
            </CommandShortcutSnippet>
          </p>
          <hr className="my-1" />
          {id ? (
            <p>Autosave {autoSaveEnabled ? <b>Enabled</b> : <b>Disabled</b>}</p>
          ) : (
            <p>Autosave is unavailable while creating a note</p>
          )}
        </TooltipContent>
      </Tooltip>

      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose your changes if you don't save them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => blocker.proceed?.()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

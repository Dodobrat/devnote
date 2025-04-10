import { useEffect, useState } from "react";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { RotateCcwIcon, SaveIcon } from "lucide-react";

import { Editor } from "~/blocks/Editor";
import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import { Button, Tooltip } from "~/components/ui";
import { WELCOME_TEXT } from "~/constants";
import { useEditorNoteAtom, useEditorWelcomeNoteAtom } from "~/hooks/store";

export const Route = createFileRoute("/note/welcome")({
  component: RouteComponent,
});

function RouteComponent() {
  const [welcomeNote, setWelcomeNote] = useEditorWelcomeNoteAtom();

  const { setNote } = useEditorNoteAtom();

  useEffect(() => {
    if (!welcomeNote) return;
    setNote(welcomeNote);
  }, [setNote, welcomeNote]);

  return (
    <Editor
      title="Welcome Message"
      saveNote={(editor) => {
        if (!editor) return;
        setWelcomeNote(editor.state.doc.toString());
      }}
    >
      <WelcomeMessageEditActions />
    </Editor>
  );
}

function WelcomeMessageEditActions() {
  const [welcomeNote, setWelcomeNote] = useEditorWelcomeNoteAtom();
  const { note, setNote } = useEditorNoteAtom();

  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const canReset = note !== WELCOME_TEXT;
  const canSave = note !== welcomeNote;

  const blocker = useBlocker({
    shouldBlockFn: () => canSave,
    withResolver: true,
    disabled: !canSave,
  });

  return (
    <>
      <div className="flex gap-2">
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canReset}
              onClick={() => setShowConfirmReset(true)}
            >
              <RotateCcwIcon />
              <span className="sr-only">Reset to default</span>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Reset to default</p>
          </Tooltip.Content>
        </Tooltip>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              disabled={!canSave}
              onClick={() => setWelcomeNote(note)}
            >
              <SaveIcon />
              <span className="sr-only">Save note</span>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Save note</p>
          </Tooltip.Content>
        </Tooltip>
      </div>

      <ResponsiveConfirmation
        open={showConfirmReset}
        onOpenChange={setShowConfirmReset}
        onContinue={() => {
          setWelcomeNote(WELCOME_TEXT);
          setNote(WELCOME_TEXT);
          setShowConfirmReset(false);
        }}
        labels={{
          title: "Are you absolutely sure?",
          desc: "This action cannot be undone. You will lose your changes.",
          cancel: "Cancel",
          continue: "Continue",
        }}
      />

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

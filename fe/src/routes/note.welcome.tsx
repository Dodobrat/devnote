import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RotateCcwIcon, SaveIcon } from "lucide-react";

import { Editor } from "~/blocks/Editor";
import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import { WELCOME_TEXT } from "~/constants";
import { useEditorNote, useEditorWelcomeNote } from "~/hooks/store";

export const Route = createFileRoute("/note/welcome")({
  component: RouteComponent,
});

function RouteComponent() {
  const [welcomeNote, setWelcomeNote] = useEditorWelcomeNote();

  const { setNote } = useEditorNote();

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
  const [welcomeNote, setWelcomeNote] = useEditorWelcomeNote();
  const { note, setNote } = useEditorNote();

  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const canReset = note !== WELCOME_TEXT;
  const canSave = note !== welcomeNote;

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          disabled={!canReset}
          onClick={() => setShowConfirmReset(true)}
        >
          <RotateCcwIcon aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={!canSave}
          onClick={() => setWelcomeNote(note)}
        >
          <SaveIcon aria-hidden />
        </Button>
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
    </>
  );
}

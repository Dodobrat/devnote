import { useEffect, useState } from "react";
import { SaveIcon } from "lucide-react";

import { Editor } from "~/components/Editor";
import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui";
import { WELCOME_TEXT } from "~/constants";
import { useEditorNote, useEditorWelcomeNote } from "~/hooks/store/editor";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";

export function SettingsWelcomeMessage() {
  const [welcomeNote, setWelcomeNote] = useEditorWelcomeNote();

  useDocumentTitle("DevNote | Edit Welcome Message");

  const { setNote } = useEditorNote();

  useEffect(() => {
    if (!welcomeNote) return;
    setNote(welcomeNote);
  }, [setNote, welcomeNote]);

  return (
    <Editor
      saveNote={(editor) => {
        if (!editor) return;
        setWelcomeNote(editor.state.doc.toString());
      }}
      renderSaveActions={() => <WelcomeMessageEditActions />}
    />
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
          variant="secondary"
          disabled={!canReset}
          onClick={() => setShowConfirmReset(true)}
        >
          Reset
        </Button>
        <Button
          disabled={!canSave}
          onClick={() => {
            setWelcomeNote(note);
          }}
        >
          <SaveIcon aria-hidden className="mr-2 size-5" />
          Save
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

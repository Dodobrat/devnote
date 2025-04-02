import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { Editor } from "~/components/Editor";
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
      {/* TODO: autosave is always disabled */}
      {/* TODO: reset button */}
      {/* TODO: show confirmation on reset */}
      {/* TODO: manual save button */}
      {/* TODO: preview toggle */}
    </Editor>
  );
}

// function WelcomeMessageEditActions() {
//   const [welcomeNote, setWelcomeNote] = useEditorWelcomeNote();
//   const { note, setNote } = useEditorNote();

//   const [showConfirmReset, setShowConfirmReset] = useState(false);

//   const canReset = note !== WELCOME_TEXT;
//   const canSave = note !== welcomeNote;

//   return (
//     <>
//       <div className="flex gap-2">
//         <Button
//           variant="secondary"
//           disabled={!canReset}
//           onClick={() => setShowConfirmReset(true)}
//         >
//           Reset
//         </Button>
//         <Button
//           disabled={!canSave}
//           onClick={() => {
//             setWelcomeNote(note);
//           }}
//         >
//           <SaveIcon aria-hidden className="mr-2 size-5" />
//           Save
//         </Button>
//       </div>

//       <ResponsiveConfirmation
//         open={showConfirmReset}
//         onOpenChange={setShowConfirmReset}
//         onContinue={() => {
//           setWelcomeNote(WELCOME_TEXT);
//           setNote(WELCOME_TEXT);
//           setShowConfirmReset(false);
//         }}
//         labels={{
//           title: "Are you absolutely sure?",
//           desc: "This action cannot be undone. You will lose your changes.",
//           cancel: "Cancel",
//           continue: "Continue",
//         }}
//       />
//     </>
//   );
// }

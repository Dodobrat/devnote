import { lazy, Suspense, useEffect, useState } from "react";
import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";

import { EditorOutput, MonacoEditorFallback } from "~/components/Editor";
import { Page } from "~/components/Layout";
import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import { Button, Tabs, TabsList, TabsTrigger } from "~/components/ui";
import { WELCOME_TEXT } from "~/constants";
import { MonacoInstanceProvider, ThemeMode, useTheme } from "~/context";
import { useDocumentTitle } from "~/hooks";
import {
  useEditorAutosave,
  useEditorContainedWidth,
  useEditorNote,
  useEditorWelcomeNote,
} from "~/hooks/store/editor";
import { cn } from "~/lib/utils";

const MonacoEditor = lazy(async () => {
  const res = await import("~/components/Editor/components/MonacoEditor");
  return { default: res.MonacoEditor };
});

export function Settings() {
  useDocumentTitle("DevNote | Settings");

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Settings</Page.Title>

        <div className="grid gap-10">
          <Page.Section
            title="Theme"
            description="Choose a theme that suits your preference"
          >
            <ThemeSwitch />
          </Page.Section>

          <Page.Section
            title="Autosave"
            description="Automatically save your work as you type ( Unavailable while creating a note )"
          >
            <AutosaveToggle />
          </Page.Section>

          <Page.Section
            title="Contained width"
            description="Contain the width of the preview for big screen devices ( ~ 65 characters )"
          >
            <ContainedWidthToggle />
          </Page.Section>

          <Page.Section
            title="Welcome message"
            description="Edit the message that appears when creating a new note"
          >
            <WelcomeMessage />
          </Page.Section>
        </div>
      </Page.Content>
    </Page.Card>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
      <TabsList className="h-auto">
        <TabsTrigger value={ThemeMode.Light} className="min-h-10 md:px-4">
          <SunIcon className="md:mr-2 md:size-5" />
          <span className="hidden md:block">Light</span>
        </TabsTrigger>
        <TabsTrigger value={ThemeMode.Dark} className="min-h-10 md:px-4">
          <MoonIcon className="md:mr-2 md:size-5" />
          <span className="hidden md:block">Dark</span>
        </TabsTrigger>
        <TabsTrigger value={ThemeMode.System} className="min-h-10 md:px-4">
          <LaptopMinimalIcon className="md:mr-2 md:size-5" />
          <span className="hidden md:block">System</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function AutosaveToggle() {
  const [isAutosaving, setIsAutosaving] = useEditorAutosave();

  return <BooleanToggle value={isAutosaving} onValueChange={setIsAutosaving} />;
}

function ContainedWidthToggle() {
  const [isContained, setIsContained] = useEditorContainedWidth();

  return <BooleanToggle value={isContained} onValueChange={setIsContained} />;
}

function BooleanToggle({
  value,
  onValueChange,
  truthyLabel = "Enabled",
  falsyLabel = "Disabled",
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  truthyLabel?: string;
  falsyLabel?: string;
}) {
  return (
    <Tabs
      value={value ? "1" : ""}
      onValueChange={(v) => onValueChange(Boolean(v))}
    >
      <TabsList className="h-auto">
        <TabsTrigger value="1" className="min-h-10 md:px-4">
          {truthyLabel}
        </TabsTrigger>
        <TabsTrigger value="" className="min-h-10 md:px-4">
          {falsyLabel}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function WelcomeMessage() {
  const [welcomeNote, setWelcomeNote] = useEditorWelcomeNote();
  const { note, setNote } = useEditorNote();

  const [isViewingEditor, setIsViewingEditor] = useState(true);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    if (!welcomeNote) return;
    setNote(welcomeNote);
  }, [setNote, welcomeNote]);

  const canReset = note !== WELCOME_TEXT;
  const canSave = note !== welcomeNote;

  return (
    <>
      <BooleanToggle
        value={isViewingEditor}
        onValueChange={setIsViewingEditor}
        truthyLabel="Editor"
        falsyLabel="Preview"
      />

      <div className="grid h-96 min-h-20 w-full resize-y overflow-hidden rounded border">
        <div className={cn("overflow-hidden", !isViewingEditor && "hidden")}>
          <MonacoInstanceProvider>
            <Suspense fallback={<MonacoEditorFallback />}>
              <MonacoEditor enableSaveNote={false} autoFocus={false} />
            </Suspense>
          </MonacoInstanceProvider>
          {!isViewingEditor && <EditorOutput />}
        </div>
        <div className={cn("overflow-hidden", isViewingEditor && "hidden")}>
          <EditorOutput />
        </div>
      </div>

      <div className="flex w-full gap-2 pt-2">
        <Button
          disabled={!canSave}
          onClick={() => {
            setWelcomeNote(note);
          }}
        >
          Save
        </Button>
        <Button
          variant="secondary"
          disabled={!canReset}
          onClick={() => setShowConfirmReset(true)}
        >
          Reset to default
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

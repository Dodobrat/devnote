import { useEffect, useState } from "react";
import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";

import { EditorOutput, MonacoEditor } from "~/components/Editor";
import { Page } from "~/components/Layout";
import { Button, Tabs, TabsList, TabsTrigger } from "~/components/ui";
import { WELCOME_TEXT } from "~/constants";
import { MonacoInstanceProvider, ThemeMode, useTheme } from "~/context";
import {
  useEditorAutosave,
  useEditorNote,
  useEditorWelcomeNote,
} from "~/hooks/store/editor";
import { cn } from "~/lib/utils";

export function Settings() {
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
            <MonacoEditor enableSaveNote={false} autoFocus={false} />
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
          variant="destructive"
          disabled={!canReset}
          onClick={() => {
            setWelcomeNote(WELCOME_TEXT);
            setNote(WELCOME_TEXT);
          }}
        >
          Reset to default
        </Button>
      </div>
    </>
  );
}

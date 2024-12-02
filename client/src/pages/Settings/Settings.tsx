import { Link } from "react-router-dom";
import { LaptopMinimalIcon, MoonIcon, PencilIcon, SunIcon } from "lucide-react";

import { Page } from "~/components/Layout";
import { Button, Tabs, TabsList, TabsTrigger } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";
import { useDocumentTitle } from "~/hooks";
import {
  useEditorAutosave,
  useEditorContainedWidth,
} from "~/hooks/store/editor";
import { AppRoutes } from "~/routes";

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
            <Button asChild>
              <Link to={AppRoutes.SettingsWelcomeMessage}>
                <PencilIcon className="mr-2 size-5" aria-hidden />
                Edit Welcome Message
              </Link>
            </Button>
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
          <SunIcon className="md:mr-2 md:size-5" aria-hidden />
          <span className="hidden md:block">Light</span>
        </TabsTrigger>
        <TabsTrigger value={ThemeMode.Dark} className="min-h-10 md:px-4">
          <MoonIcon className="md:mr-2 md:size-5" aria-hidden />
          <span className="hidden md:block">Dark</span>
        </TabsTrigger>
        <TabsTrigger value={ThemeMode.System} className="min-h-10 md:px-4">
          <LaptopMinimalIcon className="md:mr-2 md:size-5" aria-hidden />
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { LaptopMinimalIcon, MoonIcon, PencilIcon, SunIcon } from "lucide-react";

import { Page } from "~/components/Page";
import { Button, Tabs } from "~/components/ui";
import { ThemeMode, type ThemeModeKey, useTheme } from "~/context";
import {
  useEditorAutosaveAtom,
  useEditorContainedWidthAtom,
  useEditorSyncScrollAtom,
  useSidebarLinksVariantAtom,
  useSidebarNotesVariantAtom,
} from "~/hooks/store";

export const Route = createFileRoute("/app/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Page.Header title="Settings" />
      <Page>
        <div className="grid gap-10">
          <Page.Section
            title="Theme"
            description="Choose a theme that suits your preference"
          >
            <ThemeSwitch />
          </Page.Section>

          <Page.Section
            title="Sidebar links variant"
            description="Choose a sidebar links variant that suits your preference"
          >
            <SidebarLinksVariantSwitch />
          </Page.Section>

          <Page.Section
            title="Sidebar notes variant"
            description="Choose a sidebar notes variant that suits your preference"
          >
            <SidebarNotesVariantSwitch />
          </Page.Section>

          <Page.Section
            title="Autosave"
            description="Automatically save your work as you type ( Unavailable while creating a note )"
          >
            <AutosaveToggle />
          </Page.Section>

          <Page.Section
            title="Sync scroll"
            description="Sync the scroll position between the editor and preview ( Scrolling the editor will scroll the preview, scrolling the preview will NOT scroll the editor )"
          >
            <SyncScrollToggle />
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
            <Button
              asChild
              className="h-auto min-h-10 leading-tight whitespace-normal"
            >
              <Link to="/note/welcome">
                <PencilIcon aria-hidden />
                Edit Welcome Message
              </Link>
            </Button>
          </Page.Section>
        </div>
      </Page>
    </>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs value={theme} onValueChange={(v) => setTheme(v as ThemeModeKey)}>
      <Tabs.List>
        <Tabs.Trigger value={ThemeMode.Light}>
          <SunIcon aria-hidden />
          <span className="hidden md:block">Light</span>
        </Tabs.Trigger>
        <Tabs.Trigger value={ThemeMode.Dark}>
          <MoonIcon aria-hidden />
          <span className="hidden md:block">Dark</span>
        </Tabs.Trigger>
        <Tabs.Trigger value={ThemeMode.System}>
          <LaptopMinimalIcon aria-hidden />
          <span className="hidden md:block">System</span>
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
}

function SidebarLinksVariantSwitch() {
  const [sidebarLinksVariant, setSidebarLinksVariant] =
    useSidebarLinksVariantAtom();

  return (
    <Tabs
      value={sidebarLinksVariant}
      onValueChange={(v) =>
        setSidebarLinksVariant(v as typeof sidebarLinksVariant)
      }
    >
      <Tabs.List>
        <Tabs.Trigger value="default">Default</Tabs.Trigger>
        <Tabs.Trigger value="minimal">Minimal</Tabs.Trigger>
        <Tabs.Trigger value="dense">Dense</Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
}

function SidebarNotesVariantSwitch() {
  const [sidebarNotesVariant, setSidebarNotesVariant] =
    useSidebarNotesVariantAtom();

  return (
    <Tabs
      value={sidebarNotesVariant}
      onValueChange={(v) =>
        setSidebarNotesVariant(v as typeof sidebarNotesVariant)
      }
    >
      <Tabs.List>
        <Tabs.Trigger value="default">Default</Tabs.Trigger>
        <Tabs.Trigger value="minimal">Minimal</Tabs.Trigger>
        <Tabs.Trigger value="dense">Dense</Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
}

function AutosaveToggle() {
  const [isAutosaving, setIsAutosaving] = useEditorAutosaveAtom();

  return <BooleanToggle value={isAutosaving} onValueChange={setIsAutosaving} />;
}

function SyncScrollToggle() {
  const [isSynced, setIsSynced] = useEditorSyncScrollAtom();

  return <BooleanToggle value={isSynced} onValueChange={setIsSynced} />;
}

function ContainedWidthToggle() {
  const [isContained, setIsContained] = useEditorContainedWidthAtom();

  return <BooleanToggle value={isContained} onValueChange={setIsContained} />;
}

type BooleanToggleProps = {
  value: boolean;
  onValueChange: (v: boolean) => void;
};

function BooleanToggle({ value, onValueChange }: BooleanToggleProps) {
  return (
    <Tabs
      value={value ? "1" : ""}
      onValueChange={(v) => onValueChange(Boolean(v))}
    >
      <Tabs.List>
        <Tabs.Trigger value="1">Enabled</Tabs.Trigger>
        <Tabs.Trigger value="">Disabled</Tabs.Trigger>
      </Tabs.List>
    </Tabs>
  );
}

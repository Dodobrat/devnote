import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";

import { Page } from "~/components/Layout";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";
import { useEditorAutosave } from "~/hooks/store/editor";

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
            description="Automatically save your work as you type ( 500ms debounce )"
          >
            <AutosaveToggle />
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
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Tabs
      value={value ? "1" : ""}
      onValueChange={(v) => onValueChange(Boolean(v))}
    >
      <TabsList className="h-auto">
        <TabsTrigger value="1" className="min-h-10 md:px-4">
          Enabled
        </TabsTrigger>
        <TabsTrigger value="" className="min-h-10 md:px-4">
          Disabled
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

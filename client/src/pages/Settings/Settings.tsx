import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";

import { PageCard } from "~/components/Layout";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";

export function Settings() {
  return (
    <PageCard>
      <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
        <h1 className="mb-8 text-2xl md:text-4xl lg:text-6xl">Settings</h1>

        <SettingsSection
          title="Appearance"
          description="Controls for controlling the appearance of the app"
        >
          <ThemeSwitch />
        </SettingsSection>
      </div>
    </PageCard>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-start gap-2">
      <header>
        <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
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

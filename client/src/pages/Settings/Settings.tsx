import { LaptopMinimalIcon, MoonIcon, SunIcon } from "lucide-react";

import { PageCard } from "~/components/Layout";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";

export function Settings() {
  return (
    <PageCard>
      <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
        <h1 className="mb-8 text-2xl md:text-4xl lg:text-6xl">Settings</h1>

        <div>
          Change the appearance of the app
          <ThemeSwitch />
        </div>
      </div>
    </PageCard>
  );
}

function ThemeSwitch() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
      <TabsList className="h-auto">
        <TabsTrigger value={ThemeMode.Light} className="size-10 p-0">
          <SunIcon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value={ThemeMode.Dark} className="size-10 p-0">
          <MoonIcon className="size-5" />
        </TabsTrigger>
        <TabsTrigger value={ThemeMode.System} className="size-10 p-0">
          <LaptopMinimalIcon className="size-5" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

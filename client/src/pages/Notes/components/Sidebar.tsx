import { useState } from "react";
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  DialogDescription,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui";
import { usePinnedNotes, useRegularNotes } from "~/hooks/query";

export function Sidebar() {
  // TODO: mobile view
  return (
    <Card className="overflow-auto lg:w-80">
      <CardHeader className="relative space-y-0 p-4">
        <CardTitle>DevNote</CardTitle>
        <SearchNotes />
      </CardHeader>
      <Tabs defaultValue="pinned">
        <TabsList className="mx-4 flex h-auto">
          <TabsTrigger value="pinned" className="grow">
            Pinned
          </TabsTrigger>
          <TabsTrigger value="regular" className="grow">
            Others
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pinned" className="mt-0">
          <NotesList useFetcher={usePinnedNotes} />
        </TabsContent>
        <TabsContent value="regular" className="mt-0">
          <NotesList useFetcher={useRegularNotes} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function SearchNotes() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-2 top-2 mt-0"
        onClick={() => setShowSearch(true)}
      >
        <SearchIcon />
      </Button>

      <CommandDialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogTitle hidden>Command Prompt</DialogTitle>
        <DialogDescription hidden>
          Command Prompt for executing various actions
        </DialogDescription>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <SmileIcon className="mr-2 h-4 w-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <CalculatorIcon className="mr-2 h-4 w-4" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCardIcon className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function NotesList({
  useFetcher,
}: {
  useFetcher: typeof usePinnedNotes | typeof useRegularNotes;
}) {
  const query = useFetcher();

  if (query.isLoading) {
    return <div>Loading for the first time</div>;
  }

  if (!query.data?.pages?.[0]?.data?.data?.length) {
    return <div>No data</div>;
  }

  return (
    <ul>
      {query.data?.pages?.map((page) => {
        return page.data.data?.map((note) => {
          return (
            <li key={note.id}>
              {note.id}
              {note.order}
            </li>
          );
        });
      })}
      <li>
        {/* TODO: infinite scroll */}
        <Button
          onClick={() => query.fetchNextPage()}
          disabled={!query.hasNextPage}
        >
          Load more
        </Button>
      </li>
    </ul>
  );
}

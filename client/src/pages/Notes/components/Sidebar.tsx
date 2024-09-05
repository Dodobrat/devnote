import { useState } from "react";
import { InView } from "react-intersection-observer";
import { generatePath, Link, NavLink } from "react-router-dom";
import {
  ArrowDownToLineIcon,
  ArrowUpDownIcon,
  ArrowUpToLineIcon,
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  EllipsisVerticalIcon,
  LaptopMinimalIcon,
  LockIcon,
  MoonIcon,
  MoveDownIcon,
  MoveUpIcon,
  PanelLeftCloseIcon,
  PinIcon,
  SearchIcon,
  SettingsIcon,
  SmileIcon,
  SunIcon,
  TrashIcon,
  UserIcon,
} from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
} from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";
import { useDeleteNote, useNotes } from "~/hooks/query";
import { cn, formatRelativeDateTime } from "~/lib/utils";
import { AppRoutes } from "~/routes";

export function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // TODO: mobile view
  return (
    <>
      {/* Sidebar placeholder */}
      <div className={cn("shrink-0", isSidebarOpen ? "w-[25rem]" : "w-0")} />

      <Button
        size="icon"
        className="fixed bottom-8 left-8 z-50"
        onClick={() => setIsSidebarOpen((v) => !v)}
      >
        <PanelLeftCloseIcon className="size-5" />
      </Button>

      <Card
        className={cn(
          "fixed bottom-4 left-4 isolate h-[calc(100vh-2rem)] w-96 origin-bottom-left overflow-hidden fill-mode-forwards",
          isSidebarOpen ? "block" : "hidden",
        )}
      >
        <div className="flex h-full flex-col overflow-auto overscroll-contain">
          <CardHeader className="sticky top-0 z-50 flex-row items-center justify-between space-y-0 bg-card/75 p-4 backdrop-blur-sm">
            <Link
              to={AppRoutes.Notes}
              className="outline-transparent focus-visible:underline"
            >
              <CardTitle>DevNote</CardTitle>
            </Link>
            <div className="flex items-center gap-2">
              <SearchNotes />
              <NotesActions />
            </div>
          </CardHeader>

          <CardContent className="grow p-0">
            <NotesList />
          </CardContent>

          <CardFooter className="sticky bottom-0 z-50 justify-end space-y-0 bg-card/75 p-4 backdrop-blur-sm">
            <ThemeSwitch />
          </CardFooter>
        </div>
      </Card>
    </>
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

function SearchNotes() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <Button size="icon" variant="ghost" onClick={() => setShowSearch(true)}>
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
              <CalendarIcon className="mr-2 size-4" />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <SmileIcon className="mr-2 size-4" />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <CalculatorIcon className="mr-2 size-4" />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <UserIcon className="mr-2 size-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCardIcon className="mr-2 size-4" />
              <span>Billing</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SettingsIcon className="mr-2 size-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function NotesActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="shrink-0">
          <EllipsisVerticalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuLabel>Notes actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <ArrowUpDownIcon className="mr-2 size-4" />
          <span>Toggle Reorder Mode</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <TrashIcon className="mr-2 size-4" />
          <span>Bulk Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotesList() {
  const notesQuery = useNotes();
  const deleteNoteMutation = useDeleteNote();

  if (notesQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (!notesQuery.data?.pages?.[0]?.data?.data?.length) {
    return <div>No data</div>;
  }

  return (
    <div className="flex flex-col">
      {notesQuery.data?.pages?.map((page) => {
        return page.data.data?.map((note) => {
          return (
            <NavLink
              key={note.id}
              to={generatePath(AppRoutes.NoteById, { id: String(note.id) })}
              className={({ isActive }) =>
                cn([
                  "relative flex items-center gap-2 px-4 py-1 outline-transparent ring-primary focus-visible:z-10 focus-visible:ring",
                  "before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-2 before:rounded-r",
                  isActive && "font-bold before:bg-primary",
                ])
              }
            >
              <p className="grow truncate">{note.previewTitle}</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="shrink-0">
                    <EllipsisVerticalIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  // Prevent navigating to the specific note
                  // onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuLabel>
                    <p>{note.previewTitle}</p>
                    <p className="font-normal">
                      Created:{" "}
                      <time>
                        {formatRelativeDateTime(new Date(note.createdAt))}
                      </time>
                    </p>
                    {Boolean(note.updatedAt) && (
                      <p className="font-normal">
                        Updated:{" "}
                        <time>
                          {formatRelativeDateTime(new Date(note.updatedAt!))}
                        </time>
                      </p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem>
                    <PinIcon className="mr-2 size-4" />
                    <span>Pin</span>
                    {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LockIcon className="mr-2 size-4" />
                    <span>Protect</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowUpToLineIcon className="mr-2 size-4" />
                    <span>Move to top</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MoveUpIcon className="mr-2 size-4" />
                    <span>Move up</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MoveDownIcon className="mr-2 size-4" />
                    <span>Move down</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowDownToLineIcon className="mr-2 size-4" />
                    <span>Move to bottom</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      deleteNoteMutation.mutate(note.id, {
                        onSettled: () => {
                          notesQuery.refetch();
                        },
                      });
                    }}
                  >
                    <TrashIcon className="mr-2 size-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavLink>
          );
        });
      })}

      {notesQuery.hasNextPage && (
        <InView
          as="div"
          onChange={(isInView) => {
            if (isInView) {
              notesQuery.fetchNextPage();
            }
          }}
        >
          Loading more...
        </InView>
      )}
    </div>
  );
}

import { InView } from "react-intersection-observer";
import {
  type QueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  ArrowUpRightIcon,
  EllipsisVerticalIcon,
  GripVerticalIcon,
  LinkIcon,
  PencilIcon,
  PinIcon,
  TerminalIcon,
  Trash2Icon,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar";
import {
  pinnedNotesQueryOptions,
  unPinnedNotesQueryOptions,
} from "~/hooks/query";
import { type NoteSchemaType } from "~/types/notes";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    component: RootComponent,
    loader: async ({ context: { queryClient } }) => {
      const pinnedNotes = await queryClient.ensureInfiniteQueryData(
        pinnedNotesQueryOptions(),
      );
      const unPinnedNotes = queryClient.ensureInfiniteQueryData(
        unPinnedNotesQueryOptions(),
      );
      return { pinnedNotes, unPinnedNotes };
    },
    notFoundComponent: () => {
      return (
        <div>
          <p>This is the notFoundComponent configured on root route</p>
          <Link to="/">Start Over</Link>
        </div>
      );
    },
  },
);

function RootComponent() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>

      {/* DEV TOOLS */}
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}

function AppSidebar() {
  return (
    <Sidebar
      variant="floating"
      // collapsible="icon"
    >
      <SidebarHeader>
        <LogoAction />
        {/* TODO: install pwa button */}
        {/* TODO: create new note link */}
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <NotesList />
      </SidebarContent>
      <SidebarFooter>test</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function LogoAction() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="cursor-pointer"
          tooltip="Command palette" // TODO: translate
          // onClick={() => setCommandPaletteOpenState(true)} // TODO: add interactivity
          onClick={() => console.log("CLICKED SIDEBAR LOGO")} // TODO: remove
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
            <TerminalIcon aria-hidden className="size-4 stroke-3" />
          </div>
          <div className="grid flex-1 text-left text-2xl leading-tight">
            <span className="truncate font-bold">DevNote</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function NotesList() {
  const pinnedNotesQuery = useSuspenseInfiniteQuery(pinnedNotesQueryOptions());
  const unPinnedNotesQuery = useSuspenseInfiniteQuery(
    unPinnedNotesQueryOptions(),
  );

  return (
    <>
      {/* <SidebarGroupContent> */}
      {/* <div className="bg-sidebar sticky top-0 -my-2 py-2">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <SidebarInput
                    id="search"
                    placeholder="Search notes" // TODO: translate
                    className="pl-8"
                    // value={noteQuery}
                    // onChange={onNoteSearchChange}
                  />
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
                </div> */}
      {/* </SidebarGroupContent> */}

      {!!pinnedNotesQuery.data.length && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <SidebarGroupLabel>
              {pinnedNotesQuery.data.length} Pinned Notes
            </SidebarGroupLabel>
            <SidebarMenu>
              {pinnedNotesQuery.data.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {pinnedNotesQuery.hasNextPage && !pinnedNotesQuery.isFetching && (
        <InView
          onChange={(isInView) => isInView && pinnedNotesQuery.fetchNextPage()}
        >
          Loading more...
        </InView>
      )}

      {!!unPinnedNotesQuery.data.length && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <SidebarGroupLabel>
              {unPinnedNotesQuery.data.length} Notes
            </SidebarGroupLabel>
            <SidebarMenu>
              {unPinnedNotesQuery.data.map((note) => (
                <NoteItem key={note.id} note={note} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {unPinnedNotesQuery.hasNextPage && !unPinnedNotesQuery.isFetching && (
        <InView
          onChange={(isInView) =>
            isInView && unPinnedNotesQuery.fetchNextPage()
          }
        >
          Loading more...
        </InView>
      )}
    </>
  );
}

function NoteItem({ note }: { note: NoteSchemaType }) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenuItem
      key={note.id}
      className="border-border grid grid-cols-[auto_1fr_auto] gap-1 rounded-lg border p-2"
    >
      {/* TODO: reorder dnd */}
      <Button size="icon" variant="ghost">
        <GripVerticalIcon />
        <span className="sr-only">Reorder</span>
      </Button>

      {/* TODO: pin */}
      <Button size="icon" variant="ghost">
        <PinIcon />
        <span className="sr-only">Pin</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <EllipsisVerticalIcon />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
        >
          <DropdownMenuItem>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* TODO: delete with confirmation */}
          <DropdownMenuItem>
            <Trash2Icon className="text-muted-foreground" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        asChild
        variant="secondary"
        className="col-span-full inline-grid h-auto justify-start overflow-hidden px-2 whitespace-normal"
      >
        <Link to="/note/$noteId" params={{ noteId: note.id }}>
          <p className="truncate text-base">{note.title}</p>
          <p className="text-muted-foreground line-clamp-2 break-words">
            {note.note}
          </p>
        </Link>
      </Button>
    </SidebarMenuItem>
  );
}

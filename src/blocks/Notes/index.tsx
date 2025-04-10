import { useState } from "react";
import { InView } from "react-intersection-observer";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import {
  ArrowUpRightIcon,
  CalendarClockIcon,
  CalendarSyncIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FileDigitIcon,
  LinkIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";

import {
  ResponsiveConfirmation,
  ResponsiveDialog,
} from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import { CommandShortcutSnippet } from "~/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInput,
} from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { openCommandPaletteBrowserShortcut } from "~/constants/shortcuts";
import {
  pinnedNotesQueryOptions,
  searchNotesQueryOptions,
  unPinnedNotesQueryOptions,
  useDeleteNote,
  usePinNote,
  useUnpinNote,
} from "~/hooks/query";
import { type NoteSchemaType } from "~/types/notes";

import { NoteEditTitleForm } from "./components/NoteEditTitleForm";
import { NotesBulkActions } from "./components/NotesBulkActions";
import { NotesList } from "./components/NotesList";
import {
  copyNoteLink,
  downloadNote,
  getPrettyDate,
  openNoteInNewTab,
} from "./utils";

export function Notes() {
  const pinnedNotesQuery = useSuspenseInfiniteQuery(pinnedNotesQueryOptions());
  const unPinnedNotesQuery = useSuspenseInfiniteQuery(
    unPinnedNotesQueryOptions(),
  );

  const [query, setQuery] = useState("");

  const searchedNotesQuery = useQuery(searchNotesQueryOptions({ query }));

  const hasNoNotesYet =
    pinnedNotesQuery.data.length + unPinnedNotesQuery.data.length === 0;

  return (
    <>
      <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Notes</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="flex items-center gap-2">
            <div className="relative">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <SidebarInput
                id="search"
                placeholder="Search notes"
                className="pr-21 pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
              <CommandShortcutSnippet className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 select-none">
                {openCommandPaletteBrowserShortcut}
              </CommandShortcutSnippet>
            </div>

            <NotesBulkActions />
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {Boolean(query) && (
        <>
          {!searchedNotesQuery.isFetching &&
            !searchedNotesQuery.data?.length && (
              <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarGroupContent>
                  <SidebarGroupLabel>No notes found</SidebarGroupLabel>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

          {Boolean(searchedNotesQuery.data?.length) && (
            <NotesList
              type="search"
              notes={searchedNotesQuery.data!}
              disableReorder
            />
          )}
        </>
      )}

      {!query && (
        <>
          <NotesList type="pinned" notes={pinnedNotesQuery.data} />

          {pinnedNotesQuery.hasNextPage && !pinnedNotesQuery.isFetching && (
            <InView
              onChange={(isInView) =>
                isInView && pinnedNotesQuery.fetchNextPage()
              }
            >
              Loading more...
            </InView>
          )}

          <NotesList type="unpinned" notes={unPinnedNotesQuery.data} />

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
      )}

      {!query && hasNoNotesYet && (
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <SidebarGroupLabel>No notes</SidebarGroupLabel>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
    </>
  );
}

export function NotePinAction({ note }: { note: NoteSchemaType }) {
  const pinMutation = usePinNote();
  const unpinMutation = useUnpinNote();

  if (note.isPinned) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => unpinMutation.mutate(note.id)}
          >
            <PinOffIcon />
            <span className="sr-only">Unpin</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Unpin</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => pinMutation.mutate(note.id)}
        >
          <PinIcon />
          <span className="sr-only">Pin</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Pin</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function NoteActions({
  note,
  side,
  align,
}: {
  note: NoteSchemaType;
  side?: React.ComponentProps<typeof DropdownMenuContent>["side"];
  align?: React.ComponentProps<typeof DropdownMenuContent>["align"];
}) {
  const deleteNoteMutation = useDeleteNote();

  const [editTitleDialog, setEditTitleDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVerticalIcon />
                <span className="sr-only">Note actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Note actions</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent side={side} align={align} className="min-w-56">
          <div className="flex flex-col text-sm">
            <div className="space-y-0.5 p-2">
              <p className="text-muted-foreground flex items-center gap-2 leading-tight">
                <CalendarClockIcon className="size-4" />
                <span>Created at</span>
              </p>
              <p className="leading-tight">{getPrettyDate(note.createdAt)}</p>
            </div>
            {note.updatedAt && (
              <div className="space-y-0.5 p-2">
                <p className="text-muted-foreground flex items-center gap-2 leading-tight">
                  <CalendarSyncIcon className="size-4" />
                  <span>Updated at</span>
                </p>
                <p className="leading-tight">{getPrettyDate(note.updatedAt)}</p>
              </div>
            )}
            <div className="space-y-0.5 p-2">
              <p className="text-muted-foreground flex items-center gap-2 leading-tight">
                <FileDigitIcon className="size-4" />
                <span>Characters</span>
              </p>
              <p className="leading-tight">{note.note.length}</p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditTitleDialog(true)}>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={copyNoteLink(note)}>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={openNoteInNewTab(note)}>
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={downloadNote(note)}>
            <DownloadIcon className="text-muted-foreground" />
            <span>Download .md file</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteConfirmDialog(true)}>
            <Trash2Icon className="text-destructive" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ResponsiveDialog
        labels={{
          title: "Update note title",
          desc: "Edit the title of your note so you can find it faster later.",
          cancel: "Cancel",
        }}
        open={editTitleDialog}
        onOpenChange={setEditTitleDialog}
      >
        <NoteEditTitleForm
          note={note}
          onSuccess={() => setEditTitleDialog(false)}
        />
      </ResponsiveDialog>

      <ResponsiveConfirmation
        open={deleteConfirmDialog}
        onOpenChange={setDeleteConfirmDialog}
        onContinue={() => deleteNoteMutation.mutate(note.id)}
        labels={{
          title: "Are you absolutely sure?",
          desc: "This action cannot be undone. This will permanently delete your note.",
          cancel: "Cancel",
          continue: "Continue",
        }}
      />
    </>
  );
}

export * from "./components/NotesActionModeSidebarFooter";

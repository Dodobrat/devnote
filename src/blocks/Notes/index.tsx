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
import {
  Button,
  Command,
  DropdownMenu,
  Sidebar,
  Tooltip,
} from "~/components/ui";
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
      <Sidebar.Group className="py-0 group-data-[collapsible=icon]:hidden">
        <Sidebar.GroupLabel>Notes</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <div className="flex items-center gap-2">
            <div className="relative">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <Sidebar.Input
                id="search"
                placeholder="Search notes"
                className="pr-21 pl-8"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
              <Command.ShortcutSnippet className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 select-none">
                {openCommandPaletteBrowserShortcut}
              </Command.ShortcutSnippet>
            </div>

            <NotesBulkActions />
          </div>
        </Sidebar.GroupContent>
      </Sidebar.Group>

      {Boolean(query) && (
        <>
          {!searchedNotesQuery.isFetching &&
            !searchedNotesQuery.data?.length && (
              <Sidebar.Group className="group-data-[collapsible=icon]:hidden">
                <Sidebar.GroupContent>
                  <Sidebar.GroupLabel>No notes found</Sidebar.GroupLabel>
                </Sidebar.GroupContent>
              </Sidebar.Group>
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
        <Sidebar.Group className="group-data-[collapsible=icon]:hidden">
          <Sidebar.GroupContent>
            <Sidebar.GroupLabel>No notes</Sidebar.GroupLabel>
          </Sidebar.GroupContent>
        </Sidebar.Group>
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
        <Tooltip.Trigger asChild>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => unpinMutation.mutate(note.id)}
          >
            <PinOffIcon />
            <span className="sr-only">Unpin</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Unpin</p>
        </Tooltip.Content>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => pinMutation.mutate(note.id)}
        >
          <PinIcon />
          <span className="sr-only">Pin</span>
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>Pin</p>
      </Tooltip.Content>
    </Tooltip>
  );
}

export function NoteActions({
  note,
  side,
  align,
}: {
  note: NoteSchemaType;
  side?: React.ComponentProps<typeof DropdownMenu.Content>["side"];
  align?: React.ComponentProps<typeof DropdownMenu.Content>["align"];
}) {
  const deleteNoteMutation = useDeleteNote();

  const [editTitleDialog, setEditTitleDialog] = useState(false);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <DropdownMenu.Trigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVerticalIcon />
                <span className="sr-only">Note actions</span>
              </Button>
            </DropdownMenu.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Note actions</p>
          </Tooltip.Content>
        </Tooltip>
        <DropdownMenu.Content side={side} align={align} className="min-w-56">
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
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={() => setEditTitleDialog(true)}>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={copyNoteLink(note)}>
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={openNoteInNewTab(note)}>
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={downloadNote(note)}>
            <DownloadIcon className="text-muted-foreground" />
            <span>Download .md file</span>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={() => setDeleteConfirmDialog(true)}>
            <Trash2Icon className="text-destructive" />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
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

import { useState } from "react";
import { InView } from "react-intersection-observer";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";

import { Command, Sidebar } from "~/components/ui";
import { openCommandPaletteBrowserShortcut } from "~/constants/shortcuts";
import {
  pinnedNotesQueryOptions,
  searchNotesQueryOptions,
  unPinnedNotesQueryOptions,
} from "~/hooks/query";

import { NotesBulkActions } from "./components/NotesBulkActions";
import { NotesList } from "./components/NotesList";

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

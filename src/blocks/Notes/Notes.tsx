import { useState } from "react";
import { InView } from "react-intersection-observer";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { FunnelIcon, SearchIcon, TagIcon } from "lucide-react";

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
  useGetTags,
} from "~/hooks/query";
import { cn } from "~/lib/utils";

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

            <NoteTagsFilter query={query} setQuery={setQuery} />
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

type NoteTagsFilterProps = {
  query: string;
  setQuery: (query: string) => void;
};

function NoteTagsFilter({ query, setQuery }: NoteTagsFilterProps) {
  const tagsQuery = useGetTags();
  const hasTagFilterApplied = query.startsWith("tag:");

  return (
    <DropdownMenu>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <DropdownMenu.Trigger asChild>
            <Button size="icon" variant="outline" className="relative">
              <FunnelIcon />
              {hasTagFilterApplied && (
                <span className="bg-foreground absolute -top-1 -right-1 size-4 rounded-full" />
              )}
              <span className="sr-only">Filter</span>
            </Button>
          </DropdownMenu.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Filter</p>
        </Tooltip.Content>
      </Tooltip>

      <DropdownMenu.Content side="bottom" align="start" className="min-w-56">
        <DropdownMenu.Label>Filter by tags</DropdownMenu.Label>
        {tagsQuery.data?.length === 0 && (
          <DropdownMenu.Item disabled>No tags found</DropdownMenu.Item>
        )}
        {tagsQuery.data?.map((tag) => {
          const tagQuery = `tag:${tag}`;
          const isActive = query === tagQuery;

          return (
            <DropdownMenu.Item
              key={tag}
              onClick={() => setQuery(isActive ? "" : tagQuery)}
              className={cn(isActive && "font-semibold")}
            >
              <TagIcon />
              <span>{tag}</span>
            </DropdownMenu.Item>
          );
        })}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

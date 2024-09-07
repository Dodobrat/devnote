import { InView } from "react-intersection-observer";
import { generatePath, NavLink } from "react-router-dom";
import {
  ArrowDownToLineIcon,
  ArrowUpToLineIcon,
  EllipsisVerticalIcon,
  LockIcon,
  MoveDownIcon,
  MoveUpIcon,
  PinIcon,
  TrashIcon,
} from "lucide-react";

import { PageCard } from "~/components/Layout";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui";
import { useDeleteNote, useNotes } from "~/hooks/query";
import { cn, formatRelativeDateTime } from "~/lib/utils";
import { AppRoutes } from "~/routes";

export function Notes() {
  return (
    <PageCard>
      <div className="h-full overflow-auto p-4 md:p-6 lg:p-8">
        <h1 className="mb-8 text-2xl md:text-4xl lg:text-6xl">Notes</h1>
        <NotesList />
      </div>
    </PageCard>
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
    <div className="flex flex-col gap-2">
      {notesQuery.data?.pages?.map((page) => {
        return page.data.data?.map((note) => {
          return (
            <NavLink
              key={note.id}
              to={generatePath(AppRoutes.NoteById, { id: String(note.id) })}
              className={() =>
                cn([
                  "flex items-center gap-2 rounded-lg px-4 py-1",
                  "focus:outline-none focus-visible:ring",
                  "fine:hover:bg-muted",
                ])
              }
            >
              <p className="grow truncate">{note.previewTitle}</p>
              <p className="font-normal">
                Created:{" "}
                <time>{formatRelativeDateTime(new Date(note.createdAt))}</time>
              </p>
              {Boolean(note.updatedAt) && (
                <p className="font-normal">
                  Updated:{" "}
                  <time>
                    {formatRelativeDateTime(new Date(note.updatedAt!))}
                  </time>
                </p>
              )}
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
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* <DropdownMenuLabel>
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
                  </DropdownMenuLabel> */}
                  {/* <DropdownMenuSeparator /> */}

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

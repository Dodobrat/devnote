import { Editor } from "~/components/Editor";
import { Button } from "~/components/ui";
import {
  useCreateNote,
  useNote,
  useNotes,
  usePinnedNotes,
} from "~/hooks/query";

export function NotesWelcome() {
  const pinnedQuery = usePinnedNotes();
  console.log("pinned has next", pinnedQuery.hasNextPage);

  const regularQuery = useNotes();
  console.log("regular has next", regularQuery.hasNextPage);

  const singleQuery = useNote(0);
  console.log("single data", singleQuery.data);

  const createMutation = useCreateNote();

  return (
    <div>
      NotesWelcome
      <Button
        onClick={() =>
          createMutation.mutateAsync().then(() => regularQuery.refetch())
        }
      >
        CREATE
      </Button>
      <Button
        disabled={!regularQuery.hasNextPage}
        onClick={() => regularQuery.fetchNextPage()}
      >
        LOAD MORE
      </Button>
      <ul>
        {regularQuery.data?.pages?.map((p) => {
          return p.data.data.map((x) => (
            <li key={x.id}>
              {x.order} - {x.id}
            </li>
          ));
        })}
      </ul>
      <Editor />
    </div>
  );
}

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CirclePlusIcon,
  SquareCheckBigIcon,
  SquareIcon,
  TagIcon,
  TagsIcon,
  Trash2Icon,
} from "lucide-react";
import { type ZodError } from "zod";

import {
  ResponsiveConfirmation,
  ResponsiveDialog,
} from "~/components/ResponsiveDialog";
import { Button, Input, Separator, Tooltip } from "~/components/ui";
import {
  notesQueryKeys,
  useAddTag,
  useAssignTag,
  useDeleteTag,
  useGetTags,
  useUnassignTag,
} from "~/hooks/query";
import { cn } from "~/lib/utils";
import { type NoteSchemaType, titleSchema } from "~/types/notes";

export function NoteTagAction({ note }: { note: NoteSchemaType }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
            <TagsIcon />
            <span className="sr-only">Manage Tags</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Manage Tags</p>
        </Tooltip.Content>
      </Tooltip>

      <ResponsiveDialog
        open={open}
        onOpenChange={() => setOpen(false)}
        labels={{
          cancel: "Cancel",
          title: "Manage Tags",
          desc: "Select the tags you want to assign to this note.",
        }}
      >
        <ManageNoteTags note={note} />
      </ResponsiveDialog>
    </>
  );
}

export function ManageNoteTags({ note }: { note: NoteSchemaType }) {
  const tagsQuery = useGetTags();

  const [tagSearchValue, setTagSearchValue] = useState("");

  const filteredTags = useMemo(() => {
    if (!tagsQuery.data) return [];

    return tagsQuery.data?.filter((tag) => {
      if (!tagSearchValue) return true;
      return tag.toLowerCase().includes(tagSearchValue.toLowerCase());
    });
  }, [tagSearchValue, tagsQuery.data]);

  const hasExactMatch = (tag: string) =>
    Boolean(filteredTags.find((t) => t === tag));

  return (
    <>
      <AddTagForm
        value={tagSearchValue}
        onValueChange={setTagSearchValue}
        disabledAdd={!tagSearchValue || hasExactMatch(tagSearchValue)}
      />

      <Separator className="mt-4" />

      <div className="grid gap-2 px-4 pt-4 pb-2 md:px-0">
        {filteredTags.length === 0 && (
          <p className="text-muted-foreground">No tags found</p>
        )}
        {filteredTags.map((tag) => (
          <TagActionButton key={tag} note={note} tag={tag} />
        ))}
      </div>
    </>
  );
}

function TagActionButton({ tag, note }: { tag: string; note: NoteSchemaType }) {
  const queryClient = useQueryClient();

  const deleteTagMutation = useDeleteTag();
  const assignTagMutation = useAssignTag();
  const unassignTagMutation = useUnassignTag();

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);

  const isSelected = note.tags.includes(tag);

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="grow justify-start"
          onClick={() => {
            const mutationFn = isSelected
              ? unassignTagMutation
              : assignTagMutation;

            mutationFn.mutate({ noteId: note.id, tag });
          }}
        >
          <TagIcon />
          <span className="grow text-left">{tag}</span>
          {!isSelected && <SquareIcon />}
          {isSelected && <SquareCheckBigIcon />}
        </Button>

        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setDeleteConfirmDialog(true)}
            >
              <Trash2Icon className="text-destructive" />
              <span className="sr-only">Delete tag</span>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Delete tag</p>
          </Tooltip.Content>
        </Tooltip>
      </div>

      <ResponsiveConfirmation
        open={deleteConfirmDialog}
        onOpenChange={setDeleteConfirmDialog}
        onContinue={() => {
          deleteTagMutation.mutate(tag, {
            onSuccess: () => {
              queryClient.refetchQueries({
                queryKey: notesQueryKeys.byId(note.id),
              });
            },
          });
        }}
        labels={{
          title: "Are you absolutely sure?",
          desc: "This action cannot be undone. This will permanently delete your tag and will unassign it from every note that uses it.",
          cancel: "Cancel",
          continue: "Continue",
        }}
      />
    </>
  );
}

type AddTagFormProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabledAdd?: boolean;
};

function AddTagForm({ value, onValueChange, disabledAdd }: AddTagFormProps) {
  const createTagMutation = useAddTag();

  const [error, setError] = useState<ZodError<string> | null>(null);

  const validate = useCallback((titleValue: string) => {
    const result = titleSchema.safeParse(titleValue);
    if (!result.success) return setError(result.error);
    return setError(null);
  }, []);

  return (
    <form
      className={cn("flex flex-col gap-4", "px-4 pt-1 md:px-0")}
      onSubmit={(e) => {
        e.preventDefault();

        if (error) return;

        createTagMutation.mutate(value, {
          onSuccess: () => onValueChange(""),
        });
      }}
    >
      <div className="items-bottom flex gap-2">
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            onValueChange(v);
            validate(v);
          }}
          placeholder="Search for a tag"
        />
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button size="icon" disabled={Boolean(error) || disabledAdd}>
              <CirclePlusIcon />
              <span className="sr-only">Create new tag</span>
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <p>Create new tag</p>
          </Tooltip.Content>
        </Tooltip>
      </div>
      {Boolean(error) && (
        <small className="text-destructive -mt-2 block text-xs font-bold">
          {error!.issues[0].message}
        </small>
      )}
    </form>
  );
}

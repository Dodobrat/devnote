import { useCallback, useState } from "react";
import {
  ArrowUpRightIcon,
  CalendarClockIcon,
  CalendarSyncIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";
import { type ZodError } from "zod";

import {
  ResponsiveConfirmation,
  ResponsiveDialog,
} from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  useDeleteNote,
  usePinNote,
  useUnpinNote,
  useUpdateNote,
} from "~/hooks/query";
import { cn, getPrettyDate } from "~/lib/utils";
import { type NoteSchemaType, titleSchema } from "~/types/notes";

export function NotePinAction({ note }: { note: NoteSchemaType }) {
  const pinMutation = usePinNote();
  const unpinMutation = useUnpinNote();

  if (note.isPinned) {
    return (
      <Button
        size="icon"
        variant="ghost"
        onClick={() => unpinMutation.mutate(note.id)}
      >
        <PinOffIcon />
        <span className="sr-only">Unpin</span>
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={() => pinMutation.mutate(note.id)}
    >
      <PinIcon />
      <span className="sr-only">Pin</span>
    </Button>
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
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <EllipsisVerticalIcon />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
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
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setEditTitleDialog(true)}>
            <PencilIcon className="text-muted-foreground" />
            <span>Edit Title</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              const fullNoteUrl = new URL(
                `/note/${note.id}`,
                window.location.origin,
              ).toString();

              window.navigator.clipboard
                .writeText(fullNoteUrl)
                .then(() => toast.success("Link copied to clipboard"))
                .catch(() => toast.error("Failed to copy link"));
            }}
          >
            <LinkIcon className="text-muted-foreground" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              window.open(
                new URL(`/note/${note.id}`, window.location.origin),
                "_blank",
              );
            }}
          >
            <ArrowUpRightIcon className="text-muted-foreground" />
            <span>Open in New Tab</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteConfirmDialog(true)}>
            <Trash2Icon className="text-destructive-foreground" />
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

function NoteEditTitleForm({
  note,
  onSuccess,
}: {
  note: NoteSchemaType;
  onSuccess?: () => void;
}) {
  const updateNoteMutation = useUpdateNote();

  const [title, setTitle] = useState(note.title);
  const [error, setError] = useState<ZodError<string> | null>(null);

  const validate = useCallback((titleValue: string) => {
    const result = titleSchema.safeParse(titleValue);
    if (!result.success) return setError(result.error);
    return setError(null);
  }, []);

  return (
    <form
      className={cn("flex flex-col gap-4", "px-4 md:px-0")}
      onSubmit={(e) => {
        e.preventDefault();

        if (error) return;

        updateNoteMutation.mutate(
          { id: note.id, title: title },
          {
            onSuccess: () => {
              toast.success("Note title updated");
              onSuccess?.();
            },
            onError: () => toast.error("Failed to update note title"),
          },
        );
      }}
    >
      <Input
        value={title}
        onChange={(e) => {
          const v = e.target.value;
          setTitle(v);
          validate(v);
        }}
        placeholder="Enter a note title"
      />
      {Boolean(error) && (
        <small className="text-destructive -mt-2 block text-xs font-bold">
          {error!.issues[0].message}
        </small>
      )}
      <Button className="md:self-end" type="submit">
        Update
      </Button>
    </form>
  );
}

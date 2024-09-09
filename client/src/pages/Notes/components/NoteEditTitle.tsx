import { useCallback, useEffect, useState } from "react";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";
import { ZodError } from "zod";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Input,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { useMediaQuery } from "~/hooks";
import { notesQueryKeys, useUpdateNote } from "~/hooks/query";
import { cn, getCssVar } from "~/lib/utils";
import { NoteSchemaType, PaginatedNotesSchemaType, titleSchema } from "~/types";

const UPDATE_NOTE_TITLE = "Update note title";
const UPDATE_NOTE_TITLE_DESC =
  "Edit the title of your note so you can find it faster later.";

function NoteEditTitleForm({
  note,
  className,
  onSuccess,
}: {
  note: NoteSchemaType;
  className?: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const updateNoteMutation = useUpdateNote();

  const [title, setTitle] = useState(note.previewTitle);
  const [error, setError] = useState<ZodError<string> | null>(null);

  const validate = useCallback(() => {
    const result = titleSchema.safeParse(title);
    if (!result.success) return setError(result.error);
    return setError(null);
  }, [title]);

  useEffect(() => {
    validate();
  }, [validate]);

  return (
    <form
      className={cn("flex flex-col gap-4", className)}
      onSubmit={(e) => {
        e.preventDefault();

        if (error) return;

        updateNoteMutation.mutate(
          { id: note.id, previewTitle: title },
          {
            onSuccess: (_, variables) => {
              toast.success("Note title updated");

              queryClient.setQueryData<InfiniteData<PaginatedNotesSchemaType>>(
                notesQueryKeys.list(),
                (prev) => {
                  if (!prev) return prev;

                  const updated = prev.pages.map((p) => ({
                    ...p,
                    data: p.data.map((n) =>
                      n.id === variables.id ? { ...n, ...variables } : n,
                    ),
                  }));

                  return { ...prev, pages: updated };
                },
              );

              onSuccess?.();
            },
          },
        );
      }}
    >
      <Input
        value={title}
        onChange={({ target }) => setTitle(target.value)}
        placeholder="Enter a note title"
      />
      {Boolean(error) && (
        <small className="-mt-2 block text-xs font-bold text-destructive">
          {error!.issues[0].message}
        </small>
      )}
      <Button type="submit">Update</Button>
    </form>
  );
}

export function NoteEditTitle({ note }: { note: NoteSchemaType }) {
  const [open, setOpen] = useState(false);
  const isLargerThanMd = useMediaQuery(getCssVar("--screen-md"));

  if (isLargerThanMd) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="shrink-0">
                <PencilIcon className="size-5" />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{UPDATE_NOTE_TITLE}</p>
          </TooltipContent>
        </Tooltip>

        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{UPDATE_NOTE_TITLE}</DialogTitle>
            <DialogDescription>{UPDATE_NOTE_TITLE_DESC}</DialogDescription>
          </DialogHeader>
          <NoteEditTitleForm note={note} onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0">
              <PencilIcon className="size-5" />
            </Button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{UPDATE_NOTE_TITLE}</p>
        </TooltipContent>
      </Tooltip>

      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{UPDATE_NOTE_TITLE}</DrawerTitle>
          <DrawerDescription>{UPDATE_NOTE_TITLE_DESC}</DrawerDescription>
        </DrawerHeader>
        <NoteEditTitleForm
          note={note}
          onSuccess={() => setOpen(false)}
          className="px-4"
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

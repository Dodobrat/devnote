import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { TrashIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { useMediaQuery } from "~/hooks";
import { notesQueryKeys, useDeleteNote } from "~/hooks/query";
import { getCssVar } from "~/lib/utils";
import { NoteSchemaType } from "~/types";

const DELETE_NOTE_TOOLTIP = "Delete note";
const DELETE_NOTE_TITLE = "Are you absolutely sure?";
const DELETE_NOTE_DESC =
  "This action cannot be undone. This will permanently delete your note.";

export function NoteDelete({ note }: { note: NoteSchemaType }) {
  const queryClient = useQueryClient();
  const deleteNoteMutation = useDeleteNote();

  const [open, setOpen] = useState(false);
  const isLargerThanMd = useMediaQuery(getCssVar("--screen-md"));

  if (isLargerThanMd) {
    return (
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <TrashIcon className="size-5" />
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{DELETE_NOTE_TOOLTIP}</p>
          </TooltipContent>
        </Tooltip>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{DELETE_NOTE_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{DELETE_NOTE_DESC}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteNoteMutation.mutate(note.id, {
                  onSuccess: () => {
                    queryClient.refetchQueries({
                      queryKey: notesQueryKeys.list(),
                    });
                  },
                });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <TrashIcon className="size-5" />
            </Button>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{DELETE_NOTE_TOOLTIP}</p>
        </TooltipContent>
      </Tooltip>

      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{DELETE_NOTE_TITLE}</DrawerTitle>
          <DrawerDescription>{DELETE_NOTE_DESC}</DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <Button
            onClick={() => {
              deleteNoteMutation.mutate(note.id, {
                onSuccess: () => {
                  queryClient.refetchQueries({
                    queryKey: notesQueryKeys.list(),
                  });
                },
              });
            }}
          >
            Continue
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

import { useMemo, useState } from "react";
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
import { useDeleteNote } from "~/hooks/query";
import { getCssVar } from "~/lib/utils";
import { NoteSchemaType } from "~/types";

const DELETE_NOTE_TOOLTIP = "Delete note";
const DELETE_NOTE_TITLE = "Are you absolutely sure?";
const DELETE_NOTE_DESC =
  "This action cannot be undone. This will permanently delete your note.";
const DELETE_CANCEL = "Cancel";
const DELETE_CONTINUE = "Continue";

export function NoteDelete({ note }: { note: NoteSchemaType }) {
  const deleteNoteMutation = useDeleteNote();

  const [open, setOpen] = useState(false);
  const isLargerThanMd = useMediaQuery(getCssVar("--screen-md"));

  const onDelete = () => deleteNoteMutation.mutate(note.id);

  const deleteBtn = useMemo(
    () => (
      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <TrashIcon className="size-5" />
      </Button>
    ),
    [],
  );

  if (isLargerThanMd) {
    return (
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>{deleteBtn}</AlertDialogTrigger>
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
            <AlertDialogCancel>{DELETE_CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete}>
              {DELETE_CONTINUE}
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
          <DrawerTrigger asChild>{deleteBtn}</DrawerTrigger>
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
          <Button onClick={onDelete}>{DELETE_CONTINUE}</Button>
          <DrawerClose asChild>
            <Button variant="ghost">{DELETE_CANCEL}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

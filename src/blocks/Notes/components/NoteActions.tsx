import { useState } from "react";
import {
  ArrowUpRightIcon,
  CalendarClockIcon,
  CalendarSyncIcon,
  DownloadIcon,
  EllipsisVerticalIcon,
  FileDigitIcon,
  LinkIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";

import {
  ResponsiveConfirmation,
  ResponsiveDialog,
} from "~/components/ResponsiveDialog";
import { Button, DropdownMenu, Tooltip } from "~/components/ui";
import { useDeleteNote } from "~/hooks/query";
import { type NoteSchemaType } from "~/types/notes";

import {
  copyNoteLink,
  downloadNote,
  getPrettyDate,
  openNoteInNewTab,
} from "../utils";
import { NoteEditTitleForm } from "./NoteEditTitleForm";

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

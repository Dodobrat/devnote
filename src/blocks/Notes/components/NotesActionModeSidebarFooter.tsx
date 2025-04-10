import { useState } from "react";
import { FileUpIcon, ListRestartIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { ResponsiveConfirmation } from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import { SidebarFooter } from "~/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useBulkDeleteNotes, useExportNotes } from "~/hooks/query";
import {
  useBulkDeleteNotesAtom,
  useBulkDeleteNotesModeEnabledAtom,
  useExportNotesModeEnabledAtom,
  useToExportNotesAtom,
} from "~/hooks/store";

export function NotesActionModeSidebarFooter() {
  const [isDeleteMode] = useBulkDeleteNotesModeEnabledAtom();
  const [isExportMode] = useExportNotesModeEnabledAtom();

  if (isDeleteMode) {
    return <NoteBulkDeleteMode />;
  }

  if (isExportMode) {
    return <NoteExportMode />;
  }

  return null;
}

function NoteBulkDeleteMode() {
  const [, setIsDeleteMode] = useBulkDeleteNotesModeEnabledAtom();
  const [notesToDelete, setNotesToDelete] = useBulkDeleteNotesAtom();

  const [bulkDeleteConfirmDialog, setBulkDeleteConfirmDialog] = useState(false);
  const bulkDeleteMutation = useBulkDeleteNotes();

  const resetBulkDeleteQueue = () => {
    setIsDeleteMode(false);
    setNotesToDelete(new Set<string>());
  };

  const queueSize = notesToDelete.size;

  return (
    <SidebarFooter>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="grid gap-1">
          <small className="text-muted-foreground text-xs leading-tight">
            Bulk Delete
          </small>
          <p className="leading-tight font-bold">{queueSize} Selected</p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                onClick={resetBulkDeleteQueue}
              >
                <ListRestartIcon />
                <span className="sr-only">Disable bulk delete mode</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Disable bulk delete mode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!queueSize}
                onClick={() => setBulkDeleteConfirmDialog(true)}
              >
                <Trash2Icon />
                <span className="sr-only">Delete selected notes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected notes</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <ResponsiveConfirmation
          open={bulkDeleteConfirmDialog}
          onOpenChange={setBulkDeleteConfirmDialog}
          onContinue={() =>
            bulkDeleteMutation.mutate(Array.from(notesToDelete.values()), {
              onSuccess: resetBulkDeleteQueue,
            })
          }
          labels={{
            title: "Are you absolutely sure?",
            desc: "This action cannot be undone. This will permanently delete your notes.",
            cancel: "Cancel",
            continue: "Continue",
          }}
        />
      </div>
    </SidebarFooter>
  );
}

function NoteExportMode() {
  const [, setIsExportMode] = useExportNotesModeEnabledAtom();
  const [notesToExport, setNotesToExport] = useToExportNotesAtom();

  const [exportConfirmDialog, setExportConfirmDialog] = useState(false);
  const exportNotesMutation = useExportNotes();

  const resetExportQueue = () => {
    setIsExportMode(false);
    setNotesToExport({});
  };

  const queueSize = Object.keys(notesToExport).length;

  return (
    <SidebarFooter>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="grid gap-1">
          <small className="text-muted-foreground text-xs leading-tight">
            Export notes
          </small>
          <p className="leading-tight font-bold">{queueSize} Selected</p>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={resetExportQueue}>
                <ListRestartIcon />
                <span className="sr-only">Disable export mode</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Disable export mode</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                disabled={!queueSize}
                onClick={() => setExportConfirmDialog(true)}
              >
                <FileUpIcon />
                <span className="sr-only">Export selected notes</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export selected notes</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <ResponsiveConfirmation
          open={exportConfirmDialog}
          onOpenChange={setExportConfirmDialog}
          onContinue={() => {
            exportNotesMutation.mutate(notesToExport, {
              onSuccess: (res) => {
                if (!res) {
                  toast.error("Unable to create archive");
                  return;
                }

                // Create a temporary URL for the Blob
                const url = window.URL.createObjectURL(res);
                // Create an anchor element and trigger a download
                const a = document.createElement("a");
                a.href = url;
                a.download = "notes.zip";
                a.click();
                // Clean up the object URL
                window.URL.revokeObjectURL(url);

                resetExportQueue();
              },
            });
          }}
          labels={{
            title: "Are you absolutely sure?",
            desc: "This will create and download a .zip file with yor notes.",
            cancel: "Cancel",
            continue: "Continue",
          }}
        />
      </div>
    </SidebarFooter>
  );
}

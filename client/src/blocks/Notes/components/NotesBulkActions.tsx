import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import JSZip from "jszip";
import {
  DownloadIcon,
  EllipsisVerticalIcon,
  StickyNoteIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

import { ResponsiveDialog } from "~/components/ResponsiveDialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useIsMobile } from "~/hooks";
import { notesQueryKeys, useCreateNote } from "~/hooks/query";
import {
  useBulkDeleteNotesModeEnabledAtom,
  useExportNotesModeEnabledAtom,
} from "~/hooks/store";
import { cn } from "~/lib/utils";

export function NotesBulkActions() {
  const isMobile = useIsMobile();

  const [showImportNotes, setShowImportNotes] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useBulkDeleteNotesModeEnabledAtom();
  const [isExportMode, setIsExportMode] = useExportNotesModeEnabledAtom();

  const closeAction = () => setShowImportNotes(false);

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline">
                <EllipsisVerticalIcon />
                <span className="sr-only">Notes actions</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notes actions</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          side={isMobile ? "bottom" : "right"}
          align={isMobile ? "end" : "start"}
          className="min-w-56"
        >
          <DropdownMenuItem onClick={() => setShowImportNotes(true)}>
            <DownloadIcon />
            <span>Import</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isDeleteMode || isExportMode}
            onClick={() => setIsExportMode(true)}
          >
            <UploadIcon />
            <span>Export</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isDeleteMode || isExportMode}
            onClick={() => setIsDeleteMode(true)}
          >
            <Trash2Icon className="text-destructive" />
            <span>Bulk Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotesImport open={showImportNotes} onOpenChange={closeAction} />
    </>
  );
}

type ImportedNote = {
  filename: string;
  note: string;
};

type NotesActionsProps = {
  open: boolean;
  onOpenChange: () => void;
};

function NotesImport({ open, onOpenChange }: NotesActionsProps) {
  const queryClient = useQueryClient();
  const createNoteMutation = useCreateNote();

  const [fileUploadStack, setFileUploadStack] = useState<ImportedNote[]>([]);

  const addToStack = (importedNote: ImportedNote) => {
    const note = `<!-- ${importedNote.filename} -->

  ${importedNote.note}`;

    setFileUploadStack((prev) => {
      const matchingFilename = prev.find(
        (n) => n.filename === importedNote.filename,
      );

      if (matchingFilename) {
        toast.warning(`File ${matchingFilename.filename} is duplicated`);
        return prev;
      }

      return [...prev, { ...importedNote, note }];
    });
  };

  const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files?.length) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        addToStack({
          filename: file.name,
          note: String(event.target?.result),
        });
      };

      reader.readAsText(file);
    });
  };

  const onZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files?.length) return;

    const zip = new JSZip();

    zip
      .loadAsync(files[0])
      .then((zipContent) => {
        Object.keys(zipContent.files).forEach(async (filename) => {
          // Process only .md files
          if (
            filename.toLowerCase().endsWith(".md") &&
            !filename.includes("/.") // MACOS adds hidden files __MACOSX/._file.md
          ) {
            const fileContent =
              await zipContent.files[filename].async("string");
            addToStack({
              filename,
              note: fileContent,
            });
          }
        });
      })
      .catch((error) => {
        toast.error(`Failed to read zip: ${error?.message}`);
      });
  };

  const createUploadedNotes = () => {
    const promises = fileUploadStack.map((x) =>
      createNoteMutation.mutateAsync({ note: x.note }),
    );

    Promise.allSettled(promises)
      .then((results) => {
        const failed = results.filter((p) => p.status === "rejected");
        if (failed.length) {
          toast.error(`${failed.length} notes failed to upload`);
        }

        const success = results.filter((p) => p.status === "fulfilled");
        if (success.length) {
          toast.success(`${success.length} notes uploaded`);
        }
      })
      .finally(() => {
        queryClient.refetchQueries({
          queryKey: notesQueryKeys.unpinnedList(),
        });

        setFileUploadStack([]);

        onOpenChange();
      });
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={() => {
        onOpenChange();
        setFileUploadStack([]);
      }}
      labels={{
        cancel: "Cancel",
        title: "Import notes",
        desc: "Import .md files or a .zip archive",
      }}
    >
      <div className={cn("flex flex-col gap-4", "px-4 md:px-0")}>
        <Tabs defaultValue="files" className="grow">
          <TabsList className="w-full">
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="zip">Zip</TabsTrigger>
          </TabsList>
          <TabsContent value="files">
            <Input
              type="file"
              accept=".md"
              value=""
              multiple
              onChange={onFilesChange}
            />
          </TabsContent>
          <TabsContent value="zip">
            <Input type="file" accept=".zip" value="" onChange={onZipChange} />
          </TabsContent>
        </Tabs>

        {Boolean(fileUploadStack.length) && (
          <div className="grid divide-y overflow-hidden rounded-md border">
            {fileUploadStack.map((x, index) => (
              <div
                key={index + x.filename}
                className="flex items-center gap-2 overflow-hidden p-2"
              >
                <Button size="icon" variant="ghost" disabled aria-hidden>
                  <StickyNoteIcon />
                </Button>
                <p title={x.filename} className="grow leading-tight">
                  {x.filename}
                </p>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => {
                    setFileUploadStack((prev) =>
                      prev.filter((n) => n.filename !== x.filename),
                    );
                  }}
                >
                  <XIcon />
                  <span className="sr-only">Remove from list</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          className="md:self-end"
          disabled={!fileUploadStack.length}
          onClick={createUploadedNotes}
        >
          Import
        </Button>
      </div>
    </ResponsiveDialog>
  );
}

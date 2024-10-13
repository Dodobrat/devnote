import { LockOpenIcon } from "lucide-react";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { NoteSchemaType } from "~/types/notes";

export function NoteProtect({ note }: { note: NoteSchemaType }) {
  console.log(note);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost">
          {/* <LockIcon className="size-5"/> */}
          <LockOpenIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Protect with a password</p>
      </TooltipContent>
    </Tooltip>
  );
}

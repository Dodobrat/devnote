import { PinOffIcon } from "lucide-react";

import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { NoteSchemaType } from "~/types";

export function NotePin({ note }: { note: NoteSchemaType }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button size="icon" variant="ghost">
          {/* <PinIcon className="size-5"/> */}
          <PinOffIcon className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Pin note</p>
      </TooltipContent>
    </Tooltip>
  );
}

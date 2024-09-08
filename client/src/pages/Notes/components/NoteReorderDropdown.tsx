import {
  ArrowDownToLineIcon,
  ArrowUpToLineIcon,
  EllipsisIcon,
  MoveDownIcon,
  MoveUpIcon,
} from "lucide-react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { NoteSchemaType } from "~/types";

export function NoteReorderDropdown({ note }: { note: NoteSchemaType }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0">
              <EllipsisIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Reorder actions</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" side="left">
        <DropdownMenuItem>
          <ArrowUpToLineIcon className="mr-2 size-4" />
          <span>Move to top</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MoveUpIcon className="mr-2 size-4" />
          <span>Move up</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <MoveDownIcon className="mr-2 size-4" />
          <span>Move down</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowDownToLineIcon className="mr-2 size-4" />
          <span>Move to bottom</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

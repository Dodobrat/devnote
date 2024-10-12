import { useState } from "react";
import { GripVerticalIcon } from "lucide-react";

import {
  Button,
  ButtonProps,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui";
import { cn } from "~/lib/utils";

export function NoteDragHandle(props: ButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          {...props}
          className={cn(
            "order-0 h-full w-10 shrink-0 cursor-grab touch-none p-0 active:cursor-grabbing",
            props.className,
          )}
          onPointerDown={(e) => {
            setOpen(false);
            props.onPointerDown?.(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
              setOpen(false);
            }
            props.onKeyDown?.(e);
          }}
        >
          <GripVerticalIcon className="size-5" aria-hidden />
          <span className="sr-only">Drag to reorder</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">
        <p>Drag to reorder</p>
      </TooltipContent>
    </Tooltip>
  );
}

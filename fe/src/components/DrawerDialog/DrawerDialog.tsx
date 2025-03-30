import { useState } from "react";

import { useMediaQuery } from "~/hooks";
import { cn, getCssVar } from "~/lib/utils";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export type DialogDrawerProps = React.PropsWithChildren<{
  trigger?: React.JSX.Element;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  title?: React.ReactNode;
  description?: React.ReactNode;
  showDrawerCancel?: boolean;
  tooltip?: React.ReactNode;
  contentClassName?: string;
}>;

export function DrawerDialog({
  children,
  trigger,
  open,
  setOpen,
  title,
  description,
  showDrawerCancel,
  tooltip,
  contentClassName,
}: DialogDrawerProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const isLargerThanMd = useMediaQuery(
    `(min-width:${getCssVar("--breakpoint-md")})`,
  );

  console.log(isLargerThanMd);

  const resolvedOpen = open ?? localOpen;
  const setResolvedOpen = setOpen ?? setLocalOpen;

  if (isLargerThanMd) {
    return (
      <Dialog open={resolvedOpen} onOpenChange={setResolvedOpen}>
        {Boolean(trigger) && (
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>{trigger}</DialogTrigger>
            </TooltipTrigger>
            {Boolean(tooltip) && <TooltipContent>{tooltip}</TooltipContent>}
          </Tooltip>
        )}
        <DialogContent
          className={cn("pb-0 md:max-w-screen-sm", contentClassName)}
        >
          <DialogHeader>
            <DialogTitle className={cn(!title && "sr-only")}>
              {title}
            </DialogTitle>
            <DialogDescription className={cn(!description && "sr-only")}>
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-6 overflow-auto px-6">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={resolvedOpen} onOpenChange={setResolvedOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        </TooltipTrigger>
        {Boolean(tooltip) && <TooltipContent>{tooltip}</TooltipContent>}
      </Tooltip>
      <DrawerContent className={contentClassName}>
        <DrawerHeader className="text-left">
          <DrawerTitle className={cn(!title && "sr-only")}>{title}</DrawerTitle>
          <DrawerDescription className={cn(!description && "sr-only")}>
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-auto pb-2">{children}</div>
        {showDrawerCancel && (
          <DrawerFooter className="pt-0">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

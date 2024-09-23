import { useMediaQuery } from "~/hooks";
import { getCssVar } from "~/lib/utils";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui";

type ResponsiveDialogProps = React.PropsWithChildren<{
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  labels: {
    title: string;
    desc: string;
    cancel: string;
  };
}>;

export function ResponsiveDialog({
  children,
  open,
  onOpenChange,
  labels,
}: ResponsiveDialogProps) {
  const isLargerThanMd = useMediaQuery(getCssVar("--screen-md"));

  if (isLargerThanMd) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{labels.title}</DialogTitle>
            <DialogDescription>{labels.desc}</DialogDescription>
          </DialogHeader>

          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{labels.title}</DrawerTitle>
          <DrawerDescription>{labels.desc}</DrawerDescription>
        </DrawerHeader>

        {children}

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="ghost">{labels.cancel}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

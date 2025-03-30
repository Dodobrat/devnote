import { useIsMobile } from "~/hooks";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";

type ResponsiveConfirmationProps = {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  onContinue: () => void;
  onCancel?: () => void;
  labels: {
    title: string;
    desc: string;
    cancel: string;
    continue: string;
  };
};

export function ResponsiveConfirmation({
  open,
  onOpenChange,
  onContinue,
  onCancel,
  labels,
}: ResponsiveConfirmationProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.title}</AlertDialogTitle>
            <AlertDialogDescription>{labels.desc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>
              {labels.cancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onContinue}>
              {labels.continue}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{labels.title}</DrawerTitle>
          <DrawerDescription>{labels.desc}</DrawerDescription>
        </DrawerHeader>

        <DrawerFooter className="pt-2">
          <Button onClick={onContinue}>{labels.continue}</Button>
          <DrawerClose asChild>
            <Button variant="ghost" onClick={onCancel}>
              {labels.cancel}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

import { useIsMobile } from "~/hooks";

import { AlertDialog, Button, Dialog, Drawer } from "../ui";

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
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{labels.title}</AlertDialog.Title>
            <AlertDialog.Description>{labels.desc}</AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel onClick={onCancel}>
              {labels.cancel}
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={onContinue}>
              {labels.continue}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header className="text-left">
          <Drawer.Title>{labels.title}</Drawer.Title>
          <Drawer.Description>{labels.desc}</Drawer.Description>
        </Drawer.Header>

        <Drawer.Footer className="pt-2">
          <Button onClick={onContinue}>{labels.continue}</Button>
          <Drawer.Close asChild>
            <Button variant="ghost" onClick={onCancel}>
              {labels.cancel}
            </Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

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
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>{labels.title}</Dialog.Title>
            <Dialog.Description>{labels.desc}</Dialog.Description>
          </Dialog.Header>
          <div className="-mx-6 -mb-6 max-h-[50vh] overflow-auto px-6 pb-6">
            {children}
          </div>
        </Dialog.Content>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header className="text-left">
          <Drawer.Title>{labels.title}</Drawer.Title>
          <Drawer.Description>{labels.desc}</Drawer.Description>
        </Drawer.Header>

        {children}

        <Drawer.Footer className="pt-2">
          <Drawer.Close asChild>
            <Button variant="ghost">{labels.cancel}</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}

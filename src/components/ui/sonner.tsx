import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useTheme } from "~/context";
import { useIsMobile } from "~/hooks";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      gap={8}
      toastOptions={{
        className: isMobile
          ? "top-safe-offset-0!"
          : "bottom-safe-offset-0! right-safe-offset-0!",
      }}
      {...props}
    />
  );
};

export { Toaster };

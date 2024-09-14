import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

import { cn } from "~/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:border group-[.toaster]:shadow-lg",
            "group-[&_[data-close-button]]:right-0 group-[&_[data-close-button]]:left-auto group-[&_[data-close-button]]:top-3.5 group-[&_[data-close-button]]:rounded",
            "group-[&_[data-close-button]]:border",
            "group-[&_[data-icon]]:w-6",
          ),
          success: cn(
            "group-[.toaster]:bg-green-600 group-[.toaster]:text-white group-[.toaster]:border-green-700",
            "group-[&_[data-close-button]]:bg-green-600 group-[&_[data-close-button]]:border-white",
          ),
          info: cn(
            "group-[.toaster]:bg-sky-600 group-[.toaster]:text-white group-[.toaster]:border-sky-700",
            "group-[&_[data-close-button]]:bg-sky-600 group-[&_[data-close-button]]:border-white",
          ),
          warning: cn(
            "group-[.toaster]:!bg-amber-500 group-[.toaster]:text-black group-[.toaster]:border-amber-700",
            "group-[&_[data-close-button]]:bg-amber-500 group-[&_[data-close-button]]:border-black group-[&_[data-close-button]]:text-black",
            "group-[&_[data-icon]]:text-black group-[&_[data-content]]:text-black",
          ),
          error: cn(
            "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-red-700",
            "group-[&_[data-close-button]]:bg-red-600 group-[&_[data-close-button]]:border-white",
          ),
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

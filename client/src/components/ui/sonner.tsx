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
        closeButton: true,
        unstyled: true,
        classNames: {
          toast: cn(
            "group-[&_[data-close-button]]:bg-background",
            "bg-background text-foreground border rounded-lg shadow-lg overflow-hidden",
            "flex items-start gap-2 p-4 w-full pr-9",
          ),
          content: "leading-tight text-base pr-4 w-full",
          icon: "h-6 w-auto mx-0 *:mx-0",
          closeButton: "border right-0 top-3.5 left-auto rounded",
          actionButton: cn(
            "action-btn",
            "whitespace-nowrap rounded px-2 py-1 font-semibold text-sm",
          ),
          success: cn(
            "bg-green-600 text-green-50 group-[&_[data-close-button]]:!bg-green-600",
            "dark:bg-green-700 dark:group-[&_[data-close-button]]:!bg-green-700",
            "[&_.action-btn]:bg-green-50 [&_.action-btn]:text-green-600 dark:[&_.action-btn]:text-green-700 hover:[&_.action-btn]:bg-green-50/90",
          ),
          error: cn(
            "bg-red-600 text-red-50 group-[&_[data-close-button]]:!bg-red-600",
            "dark:bg-red-700 dark:group-[&_[data-close-button]]:!bg-red-700",
            "[&_.action-btn]:bg-red-50 [&_.action-btn]:text-red-600 dark:[&_.action-btn]:text-red-700 hover:[&_.action-btn]:bg-red-50/90",
          ),
          info: cn(
            "bg-sky-600 text-sky-50 group-[&_[data-close-button]]:!bg-sky-600",
            "dark:bg-sky-700 dark:group-[&_[data-close-button]]:!bg-sky-700",
            "[&_.action-btn]:bg-sky-50 [&_.action-btn]:text-sky-600 dark:[&_.action-btn]:text-sky-700 hover:[&_.action-btn]:bg-sky-50/90",
          ),
          warning: cn(
            "!bg-amber-600 !text-amber-50 group-[&_[data-close-button]]:!bg-amber-600",
            "dark:!bg-amber-700 dark:group-[&_[data-close-button]]:!bg-amber-700",
            "[&_.action-btn]:bg-amber-50 [&_.action-btn]:text-amber-600 dark:[&_.action-btn]:text-amber-700 hover:[&_.action-btn]:bg-amber-50/90",
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

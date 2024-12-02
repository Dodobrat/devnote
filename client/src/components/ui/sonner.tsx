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
            "flex items-start gap-2 p-4 w-full",
          ),
          content: "leading-tight text-base pr-4 w-full",
          icon: "h-6 w-auto mx-0 *:mx-0",
          closeButton: "border right-0 top-3.5 left-auto rounded",
          success: cn(
            "bg-green-600 text-green-50 group-[&_[data-close-button]]:!bg-green-600",
            "dark:bg-green-700 dark:group-[&_[data-close-button]]:!bg-green-700",
          ),
          error: cn(
            "bg-red-600 text-red-50 group-[&_[data-close-button]]:!bg-red-600",
            "dark:bg-red-700 dark:group-[&_[data-close-button]]:!bg-red-700",
          ),
          info: cn(
            "bg-sky-600 text-sky-50 group-[&_[data-close-button]]:!bg-sky-600",
            "dark:bg-sky-700 dark:group-[&_[data-close-button]]:!bg-sky-700",
          ),
          warning: cn(
            "bg-amber-600 text-amber-50 group-[&_[data-close-button]]:!bg-amber-600",
            "dark:bg-amber-700 dark:group-[&_[data-close-button]]:!bg-amber-700",
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

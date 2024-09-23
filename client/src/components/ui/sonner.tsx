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
      closeButton
      expand={false}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "toast isolate",
            "grid grid-cols-[auto,1fr,auto] gap-2 items-start",
            "w-full p-4 leading-tight",
            "rounded-lg shadow-lg",
          ),

          icon: "m-0 mt-0.5 grid place-content-center [&>svg]:m-0",
          title: "leading-tight",

          warning: cn(
            "bg-yellow-500 text-black border-yellow-800 [&>[data-action]]:text-white [&>[data-action]]:bg-black",
          ),
          error: cn(
            "bg-red-600 text-white border-red-800 [&>[data-action]]:text-black [&>[data-action]]:bg-white",
          ),
          success: cn(
            "bg-green-600 text-white border-green-800 [&>[data-action]]:text-black [&>[data-action]]:bg-white",
          ),
          info: cn(
            "bg-blue-500 text-white border-blue-800 [&>[data-action]]:text-black [&>[data-action]]:bg-white",
          ),

          closeButton: cn(
            "relative size-6 top-0 left-0 rounded-sm transform-none",
            "col-start-3 col-span-1 row-start-1 row-span-1",
            "bg-inherit hover:bg-black/10",
            "border border-[currentColor] hover:border-[currentColor]",
          ),
          actionButton: cn("w-full rounded-sm p-2 col-span-full"),
          cancelButton: cn("w-full rounded-sm p-2 col-span-full order-1"),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

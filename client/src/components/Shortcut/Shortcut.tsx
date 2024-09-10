import { CommandIcon } from "lucide-react";

import { cn } from "~/lib/utils";

export function ModKey(
  props:
    | React.HTMLAttributes<HTMLSpanElement>
    | React.HTMLAttributes<SVGSVGElement>,
) {
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  if (isMac) {
    return <CmdKey {...(props as React.HTMLAttributes<SVGSVGElement>)} />;
  }

  return (
    <>
      <Key {...(props as React.HTMLAttributes<HTMLSpanElement>)}>Ctrl</Key>
      <Key {...(props as React.HTMLAttributes<HTMLSpanElement>)}>+</Key>
    </>
  );
}

export function Key(props: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cn("leading-none", props.className)} />;
}

export function CmdKey(props: React.HTMLAttributes<SVGSVGElement>) {
  return (
    <CommandIcon
      {...props}
      className={cn("size-3 scale-125 [&>path]:stroke-[2px]", props.className)}
    />
  );
}

export function Shortcut(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      {...props}
      className={cn(
        "inline-flex h-[1.375em] items-center gap-1.5 rounded bg-muted px-1.5 font-mono text-base leading-tight text-muted-foreground",
        props.className,
      )}
    />
  );
}

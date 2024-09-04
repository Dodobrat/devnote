import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import githubLightTheme from "highlight.js/styles/github.min.css?inline";
import githubDarkTheme from "highlight.js/styles/github-dark.min.css?inline";
import Markdown from "markdown-to-jsx";

import { ThemeMode, useTheme } from "~/context";
import { cn } from "~/lib/utils";

export function EditorOutput({ value = "" }: { value: string }) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="prose prose-zinc h-full max-w-none overflow-auto hyphens-auto break-all border-l px-4 dark:prose-invert">
      <style>
        {resolvedTheme === ThemeMode.Dark ? githubDarkTheme : githubLightTheme}
      </style>
      <Markdown
        options={{
          wrapper: "article",
          overrides: {
            hr: Hr,
            code: Code,
            pre: Pre,
          },
        }}
      >
        {value}
      </Markdown>
    </div>
  );
}

function Hr(props: React.ComponentPropsWithoutRef<"hr">) {
  const ref = useRef<HTMLHRElement>(null);

  return <hr {...props} ref={ref} />;
}

function Pre(props: React.ComponentPropsWithoutRef<"pre">) {
  const ref = useRef<HTMLPreElement>(null);

  return (
    <pre
      {...props}
      className={cn(props.className, "border bg-transparent p-0")}
      ref={ref}
    />
  );
}

function Code(props: React.ComponentPropsWithoutRef<"code">) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!props.className?.includes("lang-")) return;
    if (!hljs) return;

    hljs.highlightElement(ref.current);
    // hljs won't reprocess the element unless this attribute is removed
    ref.current.removeAttribute("data-highlighted");
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

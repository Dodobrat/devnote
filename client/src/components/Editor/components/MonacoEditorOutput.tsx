import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import githubLightTheme from "highlight.js/styles/github.min.css?inline";
import githubDarkTheme from "highlight.js/styles/github-dark.min.css?inline";
import Markdown from "markdown-to-jsx";
import { toast } from "sonner";

import { Button } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";
import { storeKeys, useQueryStore } from "~/hooks/store";
import { cn } from "~/lib/utils";

export function EditorOutput() {
  const { resolvedTheme } = useTheme();

  const [note] = useQueryStore(storeKeys.rawNote, "");

  return (
    <div className="h-full w-full overflow-auto p-8">
      <div className="prose mx-auto hyphens-auto break-all dark:prose-invert">
        <style>
          {resolvedTheme === ThemeMode.Dark
            ? githubDarkTheme
            : githubLightTheme}
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
          {note}
        </Markdown>
      </div>
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
    <>
      <div className="relative bottom-3 -mb-5 flex h-0 justify-end px-4">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            const codeEl =
              e.currentTarget.parentElement?.nextSibling?.firstChild;

            const copyToClipboard = () => {
              const codeContent = (codeEl as HTMLElement).innerText;
              navigator.clipboard
                .writeText(codeContent)
                .then(() => toast.success("Copied to clipboard"))
                .catch(() => toast.error("Failed to copy text"));
            };

            copyToClipboard();
          }}
        >
          Copy
        </Button>
      </div>
      <pre
        {...props}
        className={cn(props.className, "border bg-transparent p-0")}
        ref={ref}
      />
    </>
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

  return (
    <code
      {...props}
      className={cn(props.className, "!block !overflow-x-auto !p-4")}
      ref={ref}
    />
  );
}

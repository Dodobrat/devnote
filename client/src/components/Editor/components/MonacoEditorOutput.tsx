import { useEffect, useRef, useState } from "react";
import githubLightTheme from "highlight.js/styles/github.min.css?inline";
import githubDarkTheme from "highlight.js/styles/github-dark.min.css?inline";
import Markdown from "markdown-to-jsx";
import { toast } from "sonner";

import { Button } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";
import { useEditorNote } from "~/hooks/store/editor";
import { cn } from "~/lib/utils";

export function EditorOutput() {
  const { resolvedTheme } = useTheme();

  const { note } = useEditorNote();

  return (
    <div className="h-full w-full overflow-auto scroll-smooth px-8 py-10">
      <div className="prose mx-auto hyphens-auto text-pretty break-words dark:prose-invert">
        <style>
          {resolvedTheme === ThemeMode.Dark
            ? githubDarkTheme
            : githubLightTheme}
        </style>
        <Markdown
          options={{
            enforceAtxHeadings: true,
            wrapper: "output",
            overrides: {
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
      <pre {...props} className={cn(props.className, "border p-0")} ref={ref} />
    </>
  );
}

type HLJS = Awaited<typeof import("highlight.js")>["default"];

function Code(props: React.ComponentPropsWithoutRef<"code">) {
  const ref = useRef<HTMLElement>(null);
  const hljsRef = useRef<HLJS | null>(null);
  const [isHljsLoaded, setIsHljsLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    if (!props.className?.includes("lang-")) return;

    const highlightCode = () => {
      if (hljsRef.current && ref.current) {
        hljsRef.current.highlightElement(ref.current);
        // hljs won't reprocess the element unless this attribute is removed
        ref.current.removeAttribute("data-highlighted");
      }
    };

    if (hljsRef.current) {
      highlightCode();
    } else {
      // Dynamically import highlight.js
      import("highlight.js").then((module) => {
        hljsRef.current = module.default;
        highlightCode();
        setIsHljsLoaded(true); // Update state to trigger re-render if necessary
      });
    }
  }, [props.className, props.children, isHljsLoaded]);

  const isParentPre = ref.current?.parentElement?.tagName === "PRE";

  return (
    <code
      {...props}
      className={cn(
        props.className,
        isParentPre && "!block !overflow-x-auto !p-4",
      )}
      ref={ref}
    />
  );
}

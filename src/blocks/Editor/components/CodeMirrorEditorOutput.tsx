import { useEffect, useRef, useState } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Link } from "@tanstack/react-router";
import githubLightTheme from "highlight.js/styles/github.min.css?inline";
import githubDarkTheme from "highlight.js/styles/github-dark.min.css?inline";
import Markdown from "markdown-to-jsx";
import { toast } from "sonner";

import { Button } from "~/components/ui";
import { ThemeMode, useTheme } from "~/context";
import { useEditorContainedWidthAtom, useEditorNoteAtom } from "~/hooks/store";
import { cn } from "~/lib/utils";

const knownErrors: Record<string, string> = {
  "Cannot read properties of undefined (reading 'type')":
    "We cannot render an empty <script> or <style> tag. Please provide some content inside",
};

function fallbackRender({ error }: FallbackProps) {
  console.log("FALLBACK ERROR", error);
  // TODO: log error

  const errorMessage = knownErrors[error?.message] || "Something went boom";

  return (
    <div role="alert" className="grid gap-4">
      <p className="text-lg font-bold">Something went wrong!</p>
      <p className="text-destructive">{errorMessage}</p>
    </div>
  );
}

export function EditorOutput({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  const [note] = useEditorNoteAtom();

  return (
    <div
      className="h-full w-full overflow-auto overscroll-contain scroll-smooth p-4"
      ref={ref}
    >
      <ErrorBoundary fallbackRender={fallbackRender} resetKeys={[note]}>
        <MarkdownContent />
      </ErrorBoundary>
    </div>
  );
}

function MarkdownContent() {
  const { resolvedTheme } = useTheme();

  const [note] = useEditorNoteAtom();

  const [isContainedWidth] = useEditorContainedWidthAtom();

  return (
    <div
      className={cn(
        "devnote-markdown-output",
        "prose dark:prose-invert text-pretty break-words hyphens-auto",
        "transition-[max-width]",
        isContainedWidth ? "mx-auto" : "max-w-full",
      )}
    >
      <style>
        {resolvedTheme === ThemeMode.Dark ? githubDarkTheme : githubLightTheme}
      </style>
      <Markdown
        options={{
          enforceAtxHeadings: true,
          wrapper: "output",
          overrides: {
            code: Code,
            pre: Pre,
            a: A,
            style: ScopedStyle,
            // script: Blank,
          },
        }}
      >
        {note}
      </Markdown>
    </div>
  );
}

// function Blank() {
//   return null;
// }

function A({ href, ...rest }: React.ComponentProps<"a">) {
  if (href?.startsWith("/")) {
    return <Link to={href} {...rest} />;
  }

  if (href?.startsWith("#")) {
    return <a href={href} {...rest} />;
  }

  return <a href={href} target="_blank" {...rest} />;
}

function ScopedStyle({ children, ...rest }: React.ComponentProps<"style">) {
  return <style {...rest}>{`.devnote-markdown-output { ${children} }`}</style>;
}

function Pre(props: React.ComponentProps<"pre">) {
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
      <pre {...props} className={cn(props.className, "grid border p-0")} />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type HLJS = Awaited<typeof import("highlight.js")>["default"];

function Code(props: React.ComponentProps<"code">) {
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
        isParentPre && "block! overflow-x-auto! p-4!",
      )}
      ref={ref}
    />
  );
}

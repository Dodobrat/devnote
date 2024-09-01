import Markdown from "markdown-to-jsx";

export function EditorOutput({ value = "" }: { value: string }) {
  return (
    <div className="prose dark:prose-invert prose-zinc">
      <Markdown>{value}</Markdown>
    </div>
  );
}

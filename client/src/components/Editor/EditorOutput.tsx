import Markdown from "markdown-to-jsx";

export function EditorOutput({ value = "" }: { value: string }) {
  return (
    <div className="prose prose-zinc dark:prose-invert">
      <Markdown>{value}</Markdown>
    </div>
  );
}

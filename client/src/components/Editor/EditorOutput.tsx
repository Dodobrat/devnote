import Markdown from "markdown-to-jsx";

export function EditorOutput({ value = "" }: { value: string }) {
  return (
    <div className="prose prose-zinc overflow-auto hyphens-auto break-all border-l px-4 dark:prose-invert">
      <Markdown options={{}}>{value}</Markdown>
    </div>
  );
}

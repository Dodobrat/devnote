import {
  autocompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  snippet,
} from "@codemirror/autocomplete";
import { type Extension } from "@uiw/react-codemirror";

export function createMarkdownCompletions(context: CompletionContext) {
  const line = context.state.doc.lineAt(context.pos);
  const lineText = line.text;
  const lineStart = context.pos - line.from;

  // Find the word being typed
  const wordMatch = lineText.slice(0, lineStart).match(/(\S*)$/);
  const word = wordMatch ? wordMatch[1] : "";

  // Always provide all completions - let CodeMirror filter them
  const completions: Completion[] = [
    // Headings
    {
      label: "# Heading 1",
      apply: snippet("# #{heading}"),
      detail: "Heading level 1",
      section: "1. Headings",
    },
    {
      label: "## Heading 2",
      apply: snippet("## #{heading}"),
      detail: "Heading level 2",
      section: "1. Headings",
    },
    {
      label: "### Heading 3",
      apply: snippet("### #{heading}"),
      detail: "Heading level 3",
      section: "1. Headings",
    },
    {
      label: "#### Heading 4",
      apply: snippet("#### #{heading}"),
      detail: "Heading level 4",
      section: "1. Headings",
    },
    {
      label: "##### Heading 5",
      apply: snippet("##### #{heading}"),
      detail: "Heading level 5",
      section: "1. Headings",
    },
    {
      label: "###### Heading 6",
      apply: snippet("###### #{heading}"),
      detail: "Heading level 6",
      section: "1. Headings",
    },

    // Lists
    {
      label: "- Unordered list",
      apply: snippet("- #{item}"),
      detail: "Bullet list item",
      section: "2. Lists",
    },
    {
      label: "* Unordered list",
      apply: snippet("* #{item}"),
      detail: "Bullet list item",
      section: "2. Lists",
    },
    {
      label: "1. Ordered list",
      apply: snippet("1. #{item}"),
      detail: "Numbered list item",
      section: "2. Lists",
    },
    {
      label: "- [ ] Task list",
      apply: snippet("- [ ] #{task}"),
      detail: "Task list item (unchecked)",
      section: "2. Lists",
    },
    {
      label: "- [x] Task list checked",
      apply: snippet("- [x] #{task}"),
      detail: "Task list item (checked)",
      section: "2. Lists",
    },

    // Text formatting
    {
      label: "**Bold text**",
      apply: snippet("**#{bold}**"),
      detail: "Bold formatting",
      section: "3. Text Formatting",
    },
    {
      label: "*Italic text*",
      apply: snippet("*#{italic}*"),
      detail: "Italic formatting",
      section: "3. Text Formatting",
    },
    {
      label: "~~Strikethrough~~",
      apply: snippet("~~#{strikethrough}~~"),
      detail: "Strikethrough formatting",
      section: "3. Text Formatting",
    },
    {
      label: "`Inline code`",
      apply: snippet("`#{code}`"),
      detail: "Inline code",
      section: "3. Text Formatting",
    },

    // Code blocks
    {
      label: "``` Code block",
      apply: snippet("```\n#{code}\n```"),
      detail: "Code block",
      section: "4. Code Blocks",
    },
    {
      label: "```js JavaScript",
      apply: snippet("```js\n#{code}\n```"),
      detail: "JavaScript code block",
      section: "4. Code Blocks",
    },
    {
      label: "```ts TypeScript",
      apply: snippet("```ts\n#{code}\n```"),
      detail: "TypeScript code block",
      section: "4. Code Blocks",
    },
    {
      label: "```json JSON",
      apply: snippet("```json\n#{code}\n```"),
      detail: "JSON code block",
      section: "4. Code Blocks",
    },
    {
      label: "```yaml YAML",
      apply: snippet("```yaml\n#{code}\n```"),
      detail: "YAML code block",
      section: "4. Code Blocks",
    },
    {
      label: "```sql SQL",
      apply: snippet("```sql\n#{code}\n```"),
      detail: "SQL code block",
      section: "4. Code Blocks",
    },
    {
      label: "```bash Bash",
      apply: snippet("```bash\n#{code}\n```"),
      detail: "Bash code block",
      section: "4. Code Blocks",
    },

    // Links and media
    {
      label: "[Link](url)",
      apply: snippet("[#{link text}](#{url})"),
      detail: "Link",
      section: "5. Links and Media",
    },
    {
      label: "![Image](url)",
      apply: snippet("![#{alt text}](#{url})"),
      detail: "Image",
      section: "5. Links and Media",
    },

    // Other elements
    {
      label: "> Blockquote",
      apply: snippet("> #{text}"),
      detail: "Blockquote",
      section: "6. Other Elements",
    },
    {
      label: "--- Horizontal rule",
      apply: "---",
      detail: "Horizontal rule",
      section: "6. Other Elements",
    },
    {
      label: "| Table",
      apply: snippet(
        "| #{Header 1} | #{Header 2} |\n|-|-|\n| #{Cell 1} | #{Cell 2} |",
      ),
      detail: "Table",
      section: "6. Other Elements",
    },
  ];

  const from = context.pos - word.length;
  const to = context.pos;

  return {
    from,
    to,
    options: completions,
  } satisfies CompletionResult;
}

export function createMarkdownAutocompletionExtension(): Extension {
  return autocompletion({
    override: [createMarkdownCompletions],
    activateOnTyping: true,
    filterStrict: true,
    icons: false,
  });
}

import { useMemo, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { selectLine, selectLineDown } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { TagStyle } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { selectSelectionMatches } from "@codemirror/search";
import { Command, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import {
  hyperLinkExtension,
  hyperLinkStyle,
} from "@uiw/codemirror-extensions-hyper-link";
import { vscodeDarkInit, vscodeLightInit } from "@uiw/codemirror-theme-vscode";
import CodeMirror, { Extension } from "@uiw/react-codemirror";
import { EditorView } from "codemirror";

import { getIsSaveCurrentNoteKeyCombo } from "~/constants/shortcuts";
import { ThemeMode, useCodeMirrorInstance, useTheme } from "~/context";
import { useKeyDownEvent } from "~/hooks";
import { useSaveNote } from "~/hooks/query";
import { useEditorAutosave, useEditorNote } from "~/hooks/store/editor";
import { cn } from "~/lib/utils";

const elementStyles: TagStyle[] = [
  {
    tag: tags.heading1,
    fontWeight: "bold",
    fontSize: "3rem",
    lineHeight: 1,
  },
  {
    tag: tags.heading2,
    fontWeight: "bold",
    fontSize: "2.25rem",
    lineHeight: 1.1,
  },
  {
    tag: tags.heading3,
    fontWeight: "bold",
    fontSize: "1.875rem",
    lineHeight: 1.2,
  },
  {
    tag: tags.heading4,
    fontWeight: "bold",
    fontSize: "1.5rem",
    lineHeight: 1.3,
  },
  {
    tag: tags.heading5,
    fontWeight: "bold",
    fontSize: "1.25rem",
    lineHeight: 1.4,
  },
  {
    tag: tags.heading6,
    fontWeight: "bold",
    fontSize: "1.125rem",
    lineHeight: 1.55,
  },
  { tag: tags.link, textDecoration: "underline" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  { tag: tags.strikethrough, class: "line-through" },
  // { tag: tags.meta, class: "text-muted-foreground" },
];

function createAddCursor(direction: "up" | "down"): Command {
  return (view) => {
    const forward = direction === "down";
    let selection = view.state.selection;
    for (const r of selection.ranges) {
      selection = selection.addRange(view.moveVertically(r, forward));
    }
    view.dispatch({ selection });
    return true;
  };
}

const addCursorUp = createAddCursor("up");
const addCursorDown = createAddCursor("down");

function keepSelectingLines(view: EditorView) {
  const state = view.state;
  const selection = state.selection;
  // If no selection, select the current line
  if (selection.ranges.length === 1 && selection.ranges[0].empty) {
    return selectLine(view);
  }
  // Get the current selection
  const currentRange = selection.ranges[0];
  const doc = state.doc;
  // Determine if we're already on a full line selection
  const startLine = doc.lineAt(currentRange.from);
  const endLine = doc.lineAt(currentRange.to);
  // If not already selecting full lines, select full lines of current selection
  if (currentRange.from !== startLine.from || currentRange.to !== endLine.to) {
    return selectLineDown(view);
  }
  // If already selecting full lines, extend selection to more lines
  const newFrom = currentRange.from;
  const lastSelectedLine = doc.lineAt(currentRange.to);
  // Try to select additional lines downward
  const nextLineEnd = doc.line(
    Math.min(lastSelectedLine.number + 1, doc.lines),
  ).to;
  view.dispatch({
    selection: { anchor: newFrom, head: nextLineEnd },
  });
  return true;
}

function createCustomHyperLinkExtension(): Extension {
  return [
    hyperLinkExtension({
      regexp: /(?:https?:\/\/[^\s]+|(?<!<)\/[^\s]+)/gi,
      handle: (value) => {
        const cleanedValue = value.trim().replace(/[.,;!?)'"\]]$/, "");
        return cleanedValue;
      },
    }),
    hyperLinkStyle,
  ];
}

export function CodeMirrorEditor({
  enableSaveNote = true,
  autoFocus = true,
}: {
  enableSaveNote?: boolean;
  autoFocus?: boolean;
}) {
  const { codeMirrorInstance, setCodeMirrorInstance } = useCodeMirrorInstance();
  const { resolvedTheme } = useTheme();

  const location = useLocation();

  const params = useParams<{ id: string }>();
  const id = params.id!;

  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();
  const { note, setNote } = useEditorNote();

  const saveNote = useSaveNote();

  useKeyDownEvent((e) => {
    if (enableSaveNote && getIsSaveCurrentNoteKeyCombo(e)) {
      e.preventDefault();
      saveNote(codeMirrorInstance);
    }
  });

  const [isAutosaving] = useEditorAutosave();

  const theme = useMemo(() => {
    return resolvedTheme === ThemeMode.Dark
      ? vscodeDarkInit({
          theme: "dark",
          styles: elementStyles,
          settings: { foreground: "hsl(var(--foreground))" },
        })
      : vscodeLightInit({
          theme: "light",
          styles: elementStyles,
          settings: { foreground: "hsl(var(--foreground))" },
        });
  }, [resolvedTheme]);

  return (
    <CodeMirror
      value={note}
      onChange={(value) => {
        setNote(value);

        if (enableSaveNote && id && isAutosaving) {
          clearTimeout(autoSaveRef.current);
          autoSaveRef.current = setTimeout(
            () => saveNote(codeMirrorInstance),
            500,
          );
        }
      }}
      theme={theme}
      height="100%"
      basicSetup={{
        lineNumbers: false,
        foldKeymap: false,
        foldGutter: false,
        autocompletion: false,
        completionKeymap: false,
      }}
      className={cn(
        "h-full text-base selection:text-inherit",
        "[&_.cm-editor]:h-full",
        "[&_.cm-editor]:outline-none",
        "[&_.cm-editor]:bg-transparent",
        // "[&_.cm-scroller>*]:max-w-screen-sm",
        // "[&_.cm-scroller>*]:mx-auto",
        "[&_.cm-scroller]:!font-mono",
        "[&_.cm-scroller]:overscroll-contain",
        "[&_.cm-scroller]:p-4",
        "[&_.cm-scroller]:pb-16",
        "md:[&_.cm-scroller]:p-6",
        "lg:[&_.cm-scroller]:p-8",
      )}
      onCreateEditor={(editor) => {
        setCodeMirrorInstance(editor);

        // After creation of a new note and redirect to edit page,
        // return the cursor to the last known location
        if (location.state) {
          const cursorPosition = location.state.cursorPosition;
          if (typeof cursorPosition === "number") {
            setCurrentCursorPosition(editor, cursorPosition);
            editor.focus();

            // clear after navigate
            window.history.replaceState(null, "");
            location.state = null;
          }
        } else {
          if (autoFocus) {
            setCurrentCursorPosition(editor, 0);
            editor.focus();
          }
        }
      }}
      extensions={[
        EditorView.lineWrapping,
        createCustomHyperLinkExtension(),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        keymap.of([
          {
            key: "Shift-Mod-l",
            run: selectSelectionMatches,
          },
          {
            key: "Mod-Alt-ArrowUp",
            linux: "Shift-Alt-ArrowUp",
            run: addCursorUp,
            preventDefault: true,
          },
          {
            key: "Mod-Alt-ArrowDown",
            linux: "Shift-Alt-ArrowDown",
            run: addCursorDown,
            preventDefault: true,
          },
          {
            key: "Mod-l",
            run: keepSelectingLines,
            preventDefault: true,
          },
          {
            key: "Mod-s",
            run: (view) => {
              if (enableSaveNote) {
                saveNote(view);
              }
              return true;
            },
            preventDefault: true,
          },
        ]),
      ]}
    />
  );
}

export function getCurrentCursorPosition(instance: EditorView) {
  return Math.max(instance?.state?.selection?.ranges?.[0]?.from, 0);
}

export function setCurrentCursorPosition(
  instance: EditorView,
  position: number,
) {
  if (!instance) return;
  instance.dispatch({
    selection: { anchor: position, head: position },
    scrollIntoView: true,
  });
}

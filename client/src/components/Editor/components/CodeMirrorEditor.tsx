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
import {
  useEditorAutosave,
  useEditorContainedWidth,
  useEditorNote,
} from "~/hooks/store/editor";
import { cn } from "~/lib/utils";

const AUTOSAVE_DELAY = 500;

const bold = { fontWeight: "bold" };
const normal = { fontWeight: "normal" };

const elementStyles: TagStyle[] = [
  { tag: tags.heading1, fontSize: "2.25em", lineHeight: 1.1, ...bold },
  { tag: tags.heading2, fontSize: "1.5em", lineHeight: 1.3, ...bold },
  { tag: tags.heading3, fontSize: "1.25em", lineHeight: 1.6, ...bold },
  { tag: tags.heading4, fontSize: "1em", lineHeight: 1.5, ...bold },
  { tag: tags.heading5, fontSize: "1em", lineHeight: 1.5, ...normal },
  { tag: tags.heading6, fontSize: "1em", lineHeight: 1.5, ...normal },
  { tag: tags.strikethrough, class: "line-through" },
  { tag: tags.link, textDecoration: "underline" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, ...bold },
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
  const selection = view.state.selection;
  const doc = view.state.doc;
  // If no selection, select current line
  if (selection.main.empty) {
    return selectLine(view);
  }
  const range = selection.main;
  const startLine = doc.lineAt(range.from);
  const endLine = doc.lineAt(range.to);
  // If selection is not full lines, expand to full lines
  if (range.from !== startLine.from || range.to !== endLine.to) {
    return selectLineDown(view);
  }
  // Extend selection by one more line
  const nextLine = doc.line(Math.min(endLine.number + 1, doc.lines));
  view.dispatch({ selection: { anchor: range.from, head: nextLine.to } });
  return true;
}

function createCustomHyperLinkExtension(): Extension {
  return [
    hyperLinkExtension({
      regexp: /(?:https?:\/\/[^\s]+|(?<!<)(?!\/[/*])\/[^\s]+)/gi,
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

  const [isContainedWidth] = useEditorContainedWidth();

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
            AUTOSAVE_DELAY,
          );
        }
      }}
      theme={theme}
      basicSetup={{
        lineNumbers: false,
        foldKeymap: false,
        foldGutter: false,
        autocompletion: false,
        completionKeymap: false,
        lintKeymap: false,
      }}
      className={cn(
        "h-full text-base selection:text-inherit",
        "[&_.cm-editor]:h-full",
        "[&_.cm-editor]:outline-none",
        "[&_.cm-editor]:bg-transparent",
        "[&_.cm-scroller]:!font-mono",
        "[&_.cm-scroller]:overscroll-contain",
        "[&_.cm-scroller]:p-4",
        "[&_.cm-scroller]:pb-16",
        "[&_.cm-content]:py-0",
        "[&_.cm-line]:px-0",
        isContainedWidth &&
          "[&_.cm-scroller>*]:mx-auto [&_.cm-scroller>*]:max-w-[calc(65ch_+_1.85rem)]",
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

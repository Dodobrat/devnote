import { useMemo, useRef } from "react";
import { selectLine, selectLineDown } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { type TagStyle } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { selectSelectionMatches } from "@codemirror/search";
import { type Command, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useRouterState } from "@tanstack/react-router";
import {
  hyperLinkExtension,
  hyperLinkStyle,
} from "@uiw/codemirror-extensions-hyper-link";
import { vscodeDarkInit, vscodeLightInit } from "@uiw/codemirror-theme-vscode";
import CodeMirror, { type Extension, Prec } from "@uiw/react-codemirror";
import { EditorView } from "codemirror";

import { getIsSaveCurrentNoteKeyCombo } from "~/constants/shortcuts";
import { ThemeMode, useTheme } from "~/context";
import { useKeyDownEvent } from "~/hooks";
import {
  useEditorAutosaveAtom,
  useEditorContainedWidthAtom,
  useEditorNoteAtom,
} from "~/hooks/store";
import { cn } from "~/lib/utils";

import { useCodeMirrorInstance } from "../context";

const AUTOSAVE_DELAY = 500;

const bold = { fontWeight: "bold" };
const normal = { fontWeight: "normal" };

const elementStyles: TagStyle[] = [
  { tag: tags.heading1, fontSize: "2.25em", lineHeight: 1.17, ...bold }, // 1.1 initial line-height
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
      regexp:
        /(?:https?:\/\/[^\s]+|\/(?:note\/(?:new|welcome|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})|app\/(?:help|changelog|settings)))/gi,
      handle: (value) => {
        const cleanedValue = value.trim().replace(/[.,;!?)'"\]]$/, "");
        return cleanedValue;
      },
    }),
    hyperLinkStyle,
  ];
}

export function CodeMirrorEditor({
  saveNote,
}: {
  saveNote: (editor: EditorView | undefined) => void;
}) {
  const { codeMirrorInstance, setCodeMirrorInstance } = useCodeMirrorInstance();
  const { resolvedTheme } = useTheme();

  const routerState = useRouterState();
  const matches = routerState.matches;
  const editNoteRouteMatch = matches.find((m) => m.routeId === "/note/$noteId");
  const isEditing = Boolean(editNoteRouteMatch?.params?.noteId);

  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const { note, setNote } = useEditorNoteAtom();

  const [isContainedWidth] = useEditorContainedWidthAtom();

  useKeyDownEvent((e) => {
    if (getIsSaveCurrentNoteKeyCombo(e)) {
      e.preventDefault();
      saveNote(codeMirrorInstance);
    }
  });

  const [shouldAutoSave] = useEditorAutosaveAtom();

  const theme = useMemo(() => {
    return resolvedTheme === ThemeMode.Dark
      ? vscodeDarkInit({
          theme: "dark",
          styles: elementStyles,
          settings: { foreground: "var(--foreground)" },
        })
      : vscodeLightInit({
          theme: "light",
          styles: elementStyles,
          settings: { foreground: "var(--foreground)" },
        });
  }, [resolvedTheme]);

  return (
    <CodeMirror
      value={note}
      onChange={(value) => {
        setNote(value);

        if (isEditing && shouldAutoSave) {
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
        "isolate h-full text-base",
        //
        "**:[.cm-editor]:h-full",
        "**:[.cm-editor]:outline-none!",
        "**:[.cm-editor]:bg-transparent!",
        //
        "**:[.cm-scroller]:font-mono!",
        "**:[.cm-scroller]:p-4!",
        //
        "**:[.cm-content]:py-0!",
        //
        "**:[.cm-line]:px-0!",
        //
        "**:[.cm-activeLine]:bg-foreground/10!",
        //
        "**:[.cm-cursor]:border-l-2!",
        "**:[.cm-cursor]:-ml-px!",
        "**:[.cm-cursor]:border-foreground!",
        //
        "**:[.cm-selectionLayer]:**:[.cm-selectionBackground]:bg-muted!",
        "**:[.cm-focused_.cm-selectionLayer]:**:[.cm-selectionBackground]:bg-foreground!",
        //
        "**:[.cm-selectionMatch:has(*)]:bg-transparent!",
        "**:[.cm-selectionMatch:has(*)]:**:bg-foreground/30!",
        "**:[.cm-selectionMatch:not(:has(*))]:bg-foreground/30!",
        //
        isContainedWidth && "**:[.cm-scroller]:*:mx-auto!",
        isContainedWidth && "**:[.cm-scroller]:*:max-w-[calc(65ch_+_1.85rem)]",
      )}
      onCreateEditor={(editor) => {
        setCodeMirrorInstance(editor);

        // After creation of a new note and redirect to edit page,
        // return the cursor to the last known location
        if (routerState.location.state?.cursorPosition) {
          const cursorPosition = routerState.location.state.cursorPosition;
          if (typeof cursorPosition === "number") {
            setCurrentCursorPosition(editor, cursorPosition);
            editor.focus();

            // clear after navigate
            window.history.replaceState(null, "");
          }
        } else {
          setCurrentCursorPosition(editor, 0);
          editor.focus();
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
        // Forces the key-combo to execute before adding a new line with Enter
        Prec.high(
          keymap.of([
            {
              key: "Mod-Enter",
              run: () => true,
              preventDefault: true,
            },
          ]),
        ),
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

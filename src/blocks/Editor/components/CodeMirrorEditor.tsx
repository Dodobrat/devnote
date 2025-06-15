import { useMemo, useRef } from "react";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { type TagStyle } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { useRouterState } from "@tanstack/react-router";
import { githubDarkInit, githubLightInit } from "@uiw/codemirror-theme-github";
import CodeMirror, { Prec } from "@uiw/react-codemirror";
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
import { createCustomHyperLinkExtension } from "../utils/hyperlinkExtension";
import {
  addCursorDownKeyBinding,
  addCursorUpKeyBinding,
  keepSelectingLinesKeyBinding,
} from "../utils/keyBindings";
import { createMarkdownAutocompletionExtension } from "../utils/markdownCompletionsExtension";
import {
  createSearchPanel,
  escSearchPanel,
  selectAllMatches,
} from "./SearchPanel";

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

type ScrollInfo = {
  top: number;
  left: number;
  height: number;
  scrollHeight: number;
  scrolledPercentage: number;
};

type CodeMirrorEditorProps = {
  saveNote: (editor: EditorView | undefined) => void;
  onWheel?: (info: ScrollInfo) => void;
};

export function CodeMirrorEditor({ saveNote, onWheel }: CodeMirrorEditorProps) {
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
      ? githubDarkInit({
          theme: "dark",
          styles: elementStyles,
          settings: { foreground: "var(--foreground)" },
        })
      : githubLightInit({
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
        "**:[.cm-scroller]:selection:text-foreground!",
        //
        "**:[.cm-content]:py-0!",
        //
        "**:[.cm-tooltip-autocomplete]:rounded-md!",
        "**:[.cm-tooltip-autocomplete]:border!",
        "**:[.cm-tooltip-autocomplete]:bg-popover!",
        "**:[.cm-tooltip-autocomplete]:text-popover-foreground!",
        "**:[.cm-tooltip-autocomplete]:overflow-hidden!",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:bg-muted",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:text-muted-foreground",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:text-base",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:mb-2",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:mt-4",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:first-of-type:mt-0",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:font-bold",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:p-2!",
        "**:[.cm-tooltip-autocomplete]:**:[completion-section]:border-border!",
        "**:[.cm-tooltip-autocomplete]:**:[ul]:pb-2!",
        "**:[.cm-tooltip-autocomplete]:**:[li]:px-2!",
        "**:[.cm-tooltip-autocomplete]:**:[li]:py-1!",
        "**:[.cm-tooltip-autocomplete]:**:[li[aria-selected='true']]:bg-chart-2/25!",
        "**:[.cm-tooltip-autocomplete]:**:[.cm-completionLabel]:font-semibold!",
        // "**:[.cm-tooltip-autocomplete]:**:[.cm-completionMatchedText]:font-bold!",
        "**:[.cm-tooltip-autocomplete]:**:[.cm-completionDetail]:text-muted-foreground!",
        "**:[.cm-tooltip-autocomplete]:**:[.cm-completionDetail]:text-sm!",
        //
        "**:[.cm-line]:px-0!",
        // "**:[.cm-line]:**:inline-block!",
        //
        "**:[.cm-activeLine]:bg-foreground/10!",
        //
        "**:[.cm-cursor]:border-l-2!",
        "**:[.cm-cursor]:-ml-px!",
        "**:[.cm-cursor]:border-foreground!",
        //
        "**:[.cm-selectionLayer]:**:[.cm-selectionBackground]:bg-muted!",
        "**:[.cm-focused_.cm-selectionLayer]:**:[.cm-selectionBackground]:bg-chart-2/75!",
        "**:[.cm-selectionMatch]:bg-chart-2/50!",
        "**:[.cm-searchMatch]:bg-chart-4/50!",
        "**:[.cm-searchMatch-selected]:bg-chart-4/75!",
        //
        "**:[.cm-scroller]:*:transition-[max-width]",
        "**:[.cm-scroller]:*:max-w-full",
        isContainedWidth && "**:[.cm-scroller]:*:mx-auto!",
        isContainedWidth && "**:[.cm-scroller]:*:max-w-[calc(65ch_+_1.85rem)]",
      )}
      onCreateEditor={(editor) => {
        // TODO: set initial value from note

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
        createMarkdownAutocompletionExtension(),
        createScrollTrackingExtension(onWheel),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        createSearchPanel(),
        keymap.of([
          selectAllMatches,
          addCursorUpKeyBinding,
          addCursorDownKeyBinding,
          keepSelectingLinesKeyBinding,
          escSearchPanel,
          // Disable "go to line" panel
          {
            key: "Mod-Alt-g",
            run: () => true,
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

function setCurrentCursorPosition(instance: EditorView, position: number) {
  if (!instance) return;
  instance.dispatch({
    selection: { anchor: position, head: position },
    scrollIntoView: true,
  });
}

function createScrollTrackingExtension(onWheel?: (info: ScrollInfo) => void) {
  if (!onWheel) return [];

  return EditorView.domEventHandlers({
    wheel(_event, view) {
      const scroller = view.scrollDOM;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;

      onWheel({
        top: scroller.scrollTop,
        left: scroller.scrollLeft,
        height: scroller.clientHeight,
        scrollHeight: scroller.scrollHeight,
        scrolledPercentage:
          maxScroll <= 0 ? 0 : (scroller.scrollTop / maxScroll) * 100,
      });
    },
  });
}

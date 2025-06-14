import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { selectLine, selectLineDown } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { type TagStyle } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  replaceAll,
  replaceNext,
  search,
  SearchQuery,
  selectSelectionMatches,
  setSearchQuery,
} from "@codemirror/search";
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
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaseSensitiveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  RegexIcon,
  ReplaceAllIcon,
  ReplaceIcon,
  X,
} from "lucide-react";

import { Button, Input } from "~/components/ui";
import {
  getIsSaveCurrentNoteKeyCombo,
  getIsTogglingSearchKeyCombo,
} from "~/constants/shortcuts";
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
        "**:[.cm-searchMatch:has(*)]:bg-transparent!",
        "**:[.cm-searchMatch:has(*)]:**:bg-foreground/30!",
        "**:[.cm-searchMatch:not(:has(*))]:bg-foreground/30!",
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
        search({
          createPanel(view) {
            const div = document.createElement("div");
            const root = ReactDOM.createRoot(div);

            // Get selected text to pre-fill search field
            const selection = view.state.selection.main;
            const selectedText = selection.empty
              ? ""
              : view.state.doc.sliceString(selection.from, selection.to);

            root.render(
              <CustomSearchPanel view={view} initialSearch={selectedText} />,
            );

            return { dom: div, top: true };
          },
        }),
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
            key: "Escape",
            run: (view) => {
              // Close search panel if it's open
              closeSearchPanel(view);
              return true;
            },
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

type CustomSearchPanelProps = {
  view: EditorView;
  initialSearch?: string;
};

function CustomSearchPanel({
  view,
  initialSearch = "",
}: CustomSearchPanelProps) {
  const [showReplace, setShowReplace] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState({
    search: initialSearch,
    replace: "",
    caseSensitive: false,
    regexp: false,
  });

  const updateState = (newState: Partial<typeof state>) => {
    setState((prev) => ({ ...prev, ...newState }));
  };

  useEffect(() => {
    const query = new SearchQuery(state);
    view.dispatch({ effects: setSearchQuery.of(query) });
  }, [state, view]);

  useKeyDownEvent((e) => {
    if (e.code === "Escape") {
      e.preventDefault();
      closeSearchPanel(view);
    }
  });

  useKeyDownEvent((e) => {
    if (getIsTogglingSearchKeyCombo(e)) {
      // do not prevent default so that the native browser search can still work
      searchInputRef.current?.focus();
    }
  });

  return (
    <div
      data-search-panel
      className="bg-background border-border flex w-full justify-end gap-2 border-y p-2"
    >
      <Button
        size="icon"
        variant="ghost"
        onClick={() => setShowReplace(!showReplace)}
        title="Toggle Replace"
        className="h-auto w-8"
      >
        {showReplace ? <ChevronDownIcon /> : <ChevronRightIcon />}
      </Button>

      <div className="grid gap-2">
        <div className="flex items-center gap-1">
          <div className="relative flex items-center gap-1">
            <Input
              placeholder="Search..."
              title="Search text"
              className="w-full max-w-60 pr-20"
              autoFocus
              value={state.search}
              onChange={(e) => updateState({ search: e.target.value })}
              ref={searchInputRef}
            />
            <div className="absolute right-1.25 flex items-center gap-1">
              <Button
                size="icon"
                variant={state.caseSensitive ? "default" : "ghost"}
                onClick={() =>
                  updateState({ caseSensitive: !state.caseSensitive })
                }
                title="Toggle Case Sensitive"
                className="size-8"
              >
                <CaseSensitiveIcon />
              </Button>
              <Button
                size="icon"
                variant={state.regexp ? "default" : "ghost"}
                onClick={() => {
                  updateState({ regexp: !state.regexp });
                }}
                title="Toggle Regex"
                className="size-8"
              >
                <RegexIcon />
              </Button>
            </div>
          </div>
          {/* <p>TODO: Number of matches</p> */}
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => findPrevious(view)}
              disabled={!search}
              title="Find Previous"
            >
              <ArrowUpIcon />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => findNext(view)}
              disabled={!search}
              title="Find Next"
            >
              <ArrowDownIcon />
            </Button>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => closeSearchPanel(view)}
            title="Close Search"
          >
            <X />
          </Button>
        </div>

        {showReplace && (
          <div className="flex items-center gap-1">
            <div className="relative flex items-center gap-1">
              <Input
                placeholder="Replace..."
                value={state.replace}
                onChange={(e) => updateState({ replace: e.target.value })}
                className="w-full max-w-60 pr-20"
                title="Replace text"
              />
              <div className="absolute right-1.25 flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => replaceNext(view)}
                  disabled={!search || !state.replace}
                  title="Replace"
                  className="size-8"
                >
                  <ReplaceIcon />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => replaceAll(view)}
                  disabled={!search || !state.replace}
                  title="Replace All"
                  className="size-8"
                >
                  <ReplaceAllIcon />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

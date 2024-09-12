import { useCallback, useEffect, useState } from "react";
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import MonacoEditorBase, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import { toast } from "sonner";

import { ThemeMode, useTheme } from "~/context";
import { useCreateNote, useUpdateNote } from "~/hooks/query";
import { useEditorNote } from "~/hooks/store/editor";
import { getIsMac, remToPx } from "~/lib/utils";
import { AppRoutes } from "~/routes";

self.MonacoEnvironment = {
  getWorker() {
    return new editorWorker();
  },
};

loader.config({ monaco });

monaco.editor.defineTheme("devnote-light", {
  base: "vs",
  inherit: true,
  rules: [],
  colors: {
    // foreground: "",
    // errorForeground: "",
    // descriptionForeground: "",
    // focusBorder: "",
    // contrastBorder: "",
    // contrastActiveBorder: "",
    // "selection.background": "",
    // "textSeparator.foreground": "",
    // "textLink.foreground": "",
    // "textLink.activeForeground": "",
    // "textPreformat.foreground": "",
    // "textBlockQuote.background": "",
    // "textBlockQuote.border": "",
    // "textCodeBlock.background": "",
    // "widget.shadow": "",
    // "input.background": "",
    // "input.foreground": "",
    // "input.border": "",
    // "inputOption.activeBorder": "",
    // "input.placeholderForeground": "",
    // "inputValidation.infoBackground": "",
    // "inputValidation.infoBorder": "",
    // "inputValidation.warningBackground": "",
    // "inputValidation.warningBorder": "",
    // "inputValidation.errorBackground": "",
    // "inputValidation.errorBorder": "",
    // "dropdown.background": "",
    // "dropdown.foreground": "",
    // "dropdown.border": "",
    // "list.focusBackground": "",
    // "list.focusForeground": "",
    // "list.activeSelectionBackground": "",
    // "list.activeSelectionForeground": "",
    // "list.inactiveSelectionBackground": "",
    // "list.inactiveSelectionForeground": "",
    // "list.hoverBackground": "",
    // "list.hoverForeground": "",
    // "list.dropBackground": "",
    // "list.highlightForeground": "",
    // "pickerGroup.foreground": "",
    // "pickerGroup.border": "",
    // "button.foreground": "",
    // "button.background": "",
    // "button.hoverBackground": "",
    // "badge.background": "",
    // "badge.foreground": "",
    // "scrollbar.shadow": "",
    // "scrollbarSlider.background": "",
    // "scrollbarSlider.hoverBackground": "",
    // "scrollbarSlider.activeBackground": "",
    // "progressBar.background": "",
    "editor.background": "#ffffff",
    "editor.foreground": "#090909",
    // "editorWidget.background": "",
    // "editorWidget.border": "",
    // "editor.selectionBackground": "",
    // "editor.selectionForeground": "",
    // "editor.inactiveSelectionBackground": "",
    // "editor.selectionHighlightBackground": "",
    // "editor.findMatchBackground": "",
    // "editor.findMatchHighlightBackground": "",
    // "editor.findRangeHighlightBackground": "",
    // "editor.hoverHighlightBackground": "",
    // "editorHoverWidget.background": "",
    // "editorHoverWidget.border": "",
    // "editorLink.activeForeground": "",
    // "diffEditor.insertedTextBackground": "",
    // "diffEditor.removedTextBackground": "",
    // "diffEditor.insertedTextBorder": "",
    // "diffEditor.removedTextBorder": "",
    // "editorOverviewRuler.currentContentForeground": "",
    // "editorOverviewRuler.incomingContentForeground": "",
    // "editorOverviewRuler.commonContentForeground": "",
    // "editor.lineHighlightBackground": "",
    // "editor.lineHighlightBorder": "",
    // "editor.rangeHighlightBackground": "",
    // "editorCursor.foreground": "",
    // "editorWhitespace.foreground": "",
    // "editorIndentGuide.background": "",
    // "editorLineNumber.foreground": "",
    // "editorLineNumber.activeForeground": "",
    // "editorRuler.foreground": "",
    // "editorCodeLens.foreground": "",
    // "editorInlayHint.foreground": "",
    // "editorInlayHint.background": "",
    // "editorBracketMatch.background": "",
    // "editorBracketMatch.border": "",
    // "editorOverviewRuler.border": "",
    // "editorGutter.background": "",
    // "editorError.foreground": "",
    // "editorError.border": "",
    // "editorWarning.foreground": "",
    // "editorWarning.border": "",
    // "editorMarkerNavigationError.background": "",
    // "editorMarkerNavigationWarning.background": "",
    // "editorMarkerNavigation.background": "",
    // "editorSuggestWidget.background": "",
    // "editorSuggestWidget.border": "",
    // "editorSuggestWidget.foreground": "",
    // "editorSuggestWidget.selectedBackground": "",
    // "editorSuggestWidget.highlightForeground": "",
    // "editor.wordHighlightBackground": "",
    // "editor.wordHighlightStrongBackground": "",
    // "peekViewTitle.background": "",
    // "peekViewTitleLabel.foreground": "",
    // "peekViewTitleDescription.foreground": "",
    // "peekView.border": "",
    // "peekViewResult.background": "",
    // "peekViewResult.lineForeground": "",
    // "peekViewResult.fileForeground": "",
    // "peekViewResult.selectionBackground": "",
    // "peekViewResult.selectionForeground": "",
    // "peekViewEditor.background": "",
    // "peekViewEditorGutter.background": "",
    // "peekViewResult.matchHighlightBackground": "",
    // "peekViewEditor.matchHighlightBackground": "",
  },
});

monaco.editor.defineTheme("devnote-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#18181b",
    "editor.foreground": "#fafafa",
  },
});

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  acceptSuggestionOnEnter: "off",
  automaticLayout: true,
  contextmenu: false,
  cursorBlinking: "solid",
  cursorSmoothCaretAnimation: "on",
  cursorWidth: 2,
  disableLayerHinting: true,
  dragAndDrop: false,
  fontSize: remToPx(1),
  hover: { enabled: false },
  inlayHints: { enabled: "off" },
  inlineSuggest: { enabled: false },
  largeFileOptimizations: false,
  lightbulb: { enabled: monaco.editor.ShowLightbulbIconMode.Off },
  lineDecorationsWidth: 16,
  lineNumbers: "off",
  linkedEditing: true,
  matchBrackets: "near",
  minimap: { enabled: false },
  overviewRulerBorder: false,
  padding: { top: 32, bottom: 32 },
  parameterHints: { enabled: false },
  quickSuggestions: false,
  renderLineHighlight: "all",
  renderLineHighlightOnlyWhenFocus: true,
  renderWhitespace: "all",
  scrollbar: { vertical: "visible" },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  snippetSuggestions: "none",
  stickyScroll: { enabled: true, maxLineCount: 5 },
  suggest: { showWords: false },
  suggestOnTriggerCharacters: false,
  tabCompletion: "off",
  wordBasedSuggestions: "off",
  wordWrap: "on",
};

type MonacoEditor = monaco.editor.IStandaloneCodeEditor | null;

export function MonacoEditor() {
  const { resolvedTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  const updateMutation = useUpdateNote();
  const createMutation = useCreateNote();

  const params = useParams<{ id: string }>();
  const id = parseInt(params.id!);

  const { note, setNote } = useEditorNote();

  const [editorInstance, setEditorInstance] = useState<MonacoEditor>(null);

  const saveNote = useCallback(
    (editor: MonacoEditor) => {
      const cursorPosition = editor?.getPosition();

      if (id) return updateMutation.mutate({ id, note: editor?.getValue() });

      return createMutation.mutate(
        { note: editor?.getValue() || "" },
        {
          onSuccess: (res) => {
            toast.success(`${res.previewTitle} was created`);

            navigate(generatePath(AppRoutes.NoteById, { id: String(res.id) }), {
              state: cursorPosition,
            });
          },
        },
      );
    },
    [createMutation, id, navigate, updateMutation],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = getIsMac();

      // if key combination is ctrl / cmd + s
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveNote(editorInstance);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editorInstance, saveNote]);

  return (
    <MonacoEditorBase
      language="markdown"
      theme={
        resolvedTheme === ThemeMode.Dark ? "devnote-dark" : "devnote-light"
      }
      options={editorOptions}
      value={note}
      onChange={setNote}
      className="[&_.slider]:!rounded-lg [&_.slider]:!shadow-[inset_0_0_0_0.2rem_hsl(var(--card))]"
      onMount={(editor) => {
        setEditorInstance(editor);
        // After creation of a new note and redirect to edit page,
        // return the cursor to the last known location
        if (location.state) {
          const isValidLineNumber = Number.isInteger(
            parseInt(location.state.lineNumber),
          );
          const isValidColumn = Number.isInteger(
            parseInt(location.state.column),
          );
          const isValidPosition = isValidLineNumber && isValidColumn;

          if (isValidPosition) {
            editor.setPosition(location.state);
            editor.revealPosition(location.state);
            editor.focus();

            // clear after navigate
            window.history.replaceState(null, "");
            location.state = null;
          }
        } else {
          editor.setPosition({ lineNumber: 1, column: 1 });
          editor.focus();
        }

        // Disable manual toggle for suggestions
        editor.addCommand(
          monaco.KeyMod.WinCtrl | monaco.KeyCode.Space,
          () => undefined,
        );

        // Override CMD + S
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          saveNote(editor);
        });
      }}
    />
  );
}

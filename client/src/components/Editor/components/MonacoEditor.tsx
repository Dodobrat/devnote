import { useEffect } from "react";
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import MonacoEditorBase, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { toast } from "sonner";

import { ThemeMode, useTheme } from "~/context";
import { useCreateNote, useNote, useUpdateNote } from "~/hooks/query";
import { storeKeys, useQueryStore } from "~/hooks/store";
import { remToPx } from "~/lib/utils";
import { AppRoutes } from "~/routes";

loader.config({ monaco });

// :root {
//   --background: #ffffff;
//   --foreground: #090909;
//   --card: #ffffff;
//   --card-foreground: #090909;
//   --popover: #ffffff;
//   --popover-foreground: #090909;
//   --primary: #0a0a0a;
//   --primary-foreground: #fafafa;
//   --secondary: #f2f2f2;
//   --secondary-foreground: #0a0a0a;
//   --muted: #f2f2f2;
//   --muted-foreground: #777777;
//   --accent: #f2f2f2;
//   --accent-foreground: #0a0a0a;
//   --destructive: #e60000;
//   --destructive-foreground: #fafafa;
//   --border: #e5e5e5;
//   --input: #e5e5e5;
//   --ring: #0a0a0a;
// }

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

// .dark {
//   --background: #090909;
//   --foreground: #fafafa;
//   --card: #090909;
//   --card-foreground: #fafafa;
//   --popover: #090909;
//   --popover-foreground: #fafafa;
//   --primary: #fafafa;
//   --primary-foreground: #0a0a0a;
//   --secondary: #2d2d2d;
//   --secondary-foreground: #fafafa;
//   --muted: #2d2d2d;
//   --muted-foreground: #a3a3a3;
//   --accent: #2d2d2d;
//   --accent-foreground: #fafafa;
//   --destructive: #7a0000;
//   --destructive-foreground: #fafafa;
//   --border: #2d2d2d;
//   --input: #2d2d2d;
//   --ring: #d9d9d9;
// }

monaco.editor.defineTheme("devnote-dark", {
  base: "vs-dark",
  inherit: true,
  rules: [],
  colors: {
    "editor.background": "#090909",
    "editor.foreground": "#fafafa",
  },
});

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  acceptSuggestionOnEnter: "off",
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
  renderWhitespace: "all",
  scrollBeyondLastLine: false,
  snippetSuggestions: "none",
  stickyScroll: { enabled: true, maxLineCount: 5 },
  suggest: { showWords: false },
  suggestOnTriggerCharacters: false,
  tabCompletion: "off",
  wordBasedSuggestions: "off",
  wordWrap: "on",
};

export function MonacoEditor() {
  const { resolvedTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  const updateMutation = useUpdateNote();
  const createMutation = useCreateNote();

  const params = useParams<{ id: string }>();
  const id = parseInt(params.id!);
  const { data } = useNote(id);

  const [note, setNote] = useQueryStore(storeKeys.rawNote, "");

  useEffect(() => {
    if (!data?.data) return;
    setNote((v) => v || data.data.note);
  }, [data?.data, setNote]);

  return (
    <MonacoEditorBase
      key={id}
      theme={
        resolvedTheme === ThemeMode.Dark ? "devnote-dark" : "devnote-light"
      }
      defaultLanguage="markdown"
      options={editorOptions}
      onMount={(editor) => {
        if (location.state) {
          console.log("MOUNT", location.state);

          editor.setPosition(location.state);
          editor.focus();
          // clear after navigate
          window.history.replaceState(null, "");
          location.state = null;
        }

        editor.addCommand(
          monaco.KeyMod.WinCtrl | monaco.KeyCode.Space,
          () => undefined,
        );

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
          const cursorPosition = editor.getPosition();

          if (id) return updateMutation.mutate({ id, note: editor.getValue() });

          return createMutation.mutate(
            { note: editor.getValue() },
            {
              onSuccess: (res) => {
                toast.success(`${res.data.previewTitle} was created!`);

                navigate(
                  {
                    pathname: generatePath(AppRoutes.NoteById, {
                      id: String(res.data.id),
                    }),
                  },
                  { state: cursorPosition },
                );
              },
            },
          );
        });
      }}
      value={note}
      onChange={(noteValue) => setNote(noteValue || "")}
    />
  );
}

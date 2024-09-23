import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MonacoEditorBase, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

import {
  getIsSaveCurrentNoteKeyCombo,
  monacoCollapseEditorPanelShortcut,
  monacoCollapsePreviewPanelShortcut,
  monacoCreateNewNoteShortcut,
  monacoOpenCommandPaletteBrowserShortcut,
  monacoResetEditorPanelSizesShortcut,
  monacoSaveCurrentNoteShortcut,
} from "~/constants/shortcuts";
import { ThemeMode, useMonacoInstance, useTheme } from "~/context";
import { useActions, useKeyDownEvent } from "~/hooks";
import { useSaveNote } from "~/hooks/query";
import { useEditorAutosave, useEditorNote } from "~/hooks/store/editor";
import { useCommandPaletteOpenStore } from "~/hooks/store/layout";
import { remToPx } from "~/lib/utils";
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
    "editor.background": "#ffffff",
    "editor.foreground": "#090909",
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
  padding: { top: 40, bottom: 40 },
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

export function MonacoEditor({
  enableSaveNote = true,
  autoFocus = true,
}: {
  enableSaveNote?: boolean;
  autoFocus?: boolean;
}) {
  const { resolvedTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  const params = useParams<{ id: string }>();
  const id = params.id!;

  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();
  const { note, setNote } = useEditorNote();

  const { monacoInstance, setMonacoInstance } = useMonacoInstance();

  const saveNote = useSaveNote();

  useKeyDownEvent((e) => {
    if (enableSaveNote && getIsSaveCurrentNoteKeyCombo(e)) {
      e.preventDefault();
      saveNote(monacoInstance);
    }
  });

  const { collapseEditorPanel, collapsePreviewPanel, resetPanelSizes } =
    useActions();

  useEffect(() => {
    if (!monacoInstance) return;
    monacoInstance.addCommand(
      monacoCollapseEditorPanelShortcut,
      collapseEditorPanel,
    );

    monacoInstance.addCommand(
      monacoCollapsePreviewPanelShortcut,
      collapsePreviewPanel,
    );

    monacoInstance.addCommand(
      monacoResetEditorPanelSizesShortcut,
      resetPanelSizes,
    );
  }, [
    collapseEditorPanel,
    collapsePreviewPanel,
    monacoInstance,
    resetPanelSizes,
  ]);

  useEffect(() => {
    if (!monacoInstance) return;

    monacoInstance.addCommand(monacoCreateNewNoteShortcut, () =>
      navigate(AppRoutes.Root),
    );
  }, [monacoInstance, navigate]);

  const [isAutosaving] = useEditorAutosave();
  const [, setOpenCommandPalette] = useCommandPaletteOpenStore();

  return (
    <MonacoEditorBase
      language="markdown"
      theme={
        resolvedTheme === ThemeMode.Dark ? "devnote-dark" : "devnote-light"
      }
      options={editorOptions}
      value={note}
      onChange={(value) => {
        setNote(value);

        if (enableSaveNote && id && isAutosaving) {
          clearTimeout(autoSaveRef.current);
          autoSaveRef.current = setTimeout(() => saveNote(monacoInstance), 500);
        }
      }}
      className="[&_.slider]:!rounded-lg [&_.slider]:!shadow-[inset_0_0_0_0.2rem_hsl(var(--card))]"
      onMount={(editor) => {
        setMonacoInstance(editor);
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
          if (autoFocus) {
            editor.setPosition({ lineNumber: 1, column: 1 });
            editor.focus();
          }
        }

        // Disable manual toggle for suggestions
        editor.addCommand(
          monaco.KeyMod.WinCtrl | monaco.KeyCode.Space,
          () => undefined,
        );

        // Override CMD + S
        editor.addCommand(monacoSaveCurrentNoteShortcut, () => {
          if (enableSaveNote) {
            saveNote(editor);
          }
        });

        // Override CMD + K
        editor.addCommand(monacoOpenCommandPaletteBrowserShortcut, () => {
          setOpenCommandPalette(true);
        });
      }}
    />
  );
}

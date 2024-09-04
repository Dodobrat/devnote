import { useEffect, useRef, useState } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useParams } from "react-router-dom";
import MonacoEditor, { loader } from "@monaco-editor/react";
import {
  ArrowDownFromLineIcon,
  ArrowLeftFromLineIcon,
  ArrowRightFromLineIcon,
  ArrowUpFromLineIcon,
  RotateCcwIcon,
  SquareSplitHorizontalIcon,
  SquareSplitVerticalIcon,
} from "lucide-react";
import * as monaco from "monaco-editor";

import { RESIZE_STORAGE_KEY } from "~/constants";
import { ThemeMode, useTheme } from "~/context";
import { useNote, useUpdateNote } from "~/hooks/query";
import { cn, getCssVarValue, getIsInRange, remToPx } from "~/lib/utils";

import {
  Button,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  ResizablePanelGroupProps,
} from "../ui";
import { EditorOutput } from "./EditorOutput";

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
    "editor.background": "#090909",
    "editor.foreground": "#fafafa",
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

const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  acceptSuggestionOnEnter: "off",
  contextmenu: false,
  disableLayerHinting: true,
  fontFamily: getCssVarValue("font-family"),
  fontSize: remToPx(1),
  hover: { enabled: false },
  inlayHints: { enabled: "off" },
  inlineSuggest: { enabled: false },
  lineDecorationsWidth: 0,
  lineNumbers: "off",
  minimap: { enabled: false },
  parameterHints: { enabled: false },
  quickSuggestions: false,
  scrollBeyondLastLine: false,
  snippetSuggestions: "none",
  suggest: { showWords: false },
  suggestOnTriggerCharacters: false,
  tabCompletion: "off",
  wordBasedSuggestions: "off",
  wordWrap: "on",
};

export function Editor() {
  const { resolvedTheme } = useTheme();

  const [v, setV] = useState("");
  const [resizableState, setResizableState] = useState<{
    direction: ResizablePanelGroupProps["direction"];
    leftCollapsed: boolean;
    rightCollapsed: boolean;
    isReset: boolean;
  }>({
    direction: "horizontal",
    leftCollapsed: false,
    rightCollapsed: false,
    isReset: true,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  const params = useParams<{ id: string }>();
  const { data } = useNote(parseInt(params.id!));

  useEffect(() => {
    if (!data?.data) return;
    setV(data.data.note);
  }, [data?.data]);

  const updateMutation = useUpdateNote();

  return (
    <div className="grow overflow-hidden p-4">
      <ResizablePanelGroup
        direction={resizableState.direction}
        className="max-w-full rounded-lg border"
        autoSaveId={RESIZE_STORAGE_KEY}
      >
        <ResizablePanel
          collapsible
          collapsedSize={0}
          defaultSize={50}
          minSize={25}
          onCollapse={() =>
            setResizableState((v) => ({ ...v, leftCollapsed: true }))
          }
          onExpand={() =>
            setResizableState((v) => ({ ...v, leftCollapsed: false }))
          }
          onResize={(v) => {
            const isReset = getIsInRange({
              targetValue: 50,
              diff: 1.5,
              value: v,
            });
            if (!resizableState.isReset && isReset) {
              setResizableState((v) => ({
                ...v,
                isReset,
              }));
            }
            if (resizableState.isReset && !isReset) {
              setResizableState((v) => ({
                ...v,
                isReset: false,
              }));
            }
          }}
          ref={leftPanelRef}
        >
          <MonacoEditor
            theme={
              resolvedTheme === ThemeMode.Dark
                ? "devnote-dark"
                : "devnote-light"
            }
            defaultLanguage="markdown"
            options={editorOptions}
            onMount={(editor) => {
              editor.addCommand(
                monaco.KeyMod.WinCtrl | monaco.KeyCode.Space,
                () => undefined,
              );
              editor.addCommand(
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
                () => undefined,
              );
            }}
            value={v}
            onChange={(noteValue) => {
              clearTimeout(timeoutRef.current);
              setV(noteValue || "");
              timeoutRef.current = setTimeout(() => {
                if (!data?.data) return;
                updateMutation.mutate({ ...data?.data, note: noteValue || "" });
              }, 500);
            }}
          />
        </ResizablePanel>
        <ResizableHandle>
          <div
            className={cn(
              "z-50 flex gap-2 rounded-lg bg-border p-2",
              resizableState.leftCollapsed &&
                resizableState.direction === "vertical" &&
                "translate-y-1/2 rounded-t-none",
              resizableState.rightCollapsed &&
                resizableState.direction === "vertical" &&
                "-translate-y-1/2 rounded-b-none",
              resizableState.leftCollapsed &&
                resizableState.direction === "horizontal" &&
                "translate-x-1/2 rounded-l-none",
              resizableState.rightCollapsed &&
                resizableState.direction === "horizontal" &&
                "-translate-x-1/2 rounded-r-none",
              resizableState.direction === "horizontal"
                ? "flex-col"
                : "flex-row",
            )}
          >
            <Button
              size="icon"
              disabled={resizableState.leftCollapsed}
              onClick={() => leftPanelRef.current?.collapse()}
            >
              {resizableState.direction === "horizontal" ? (
                <ArrowLeftFromLineIcon />
              ) : (
                <ArrowUpFromLineIcon />
              )}
            </Button>
            <Button
              size="icon"
              onClick={() =>
                setResizableState((v) => ({
                  ...v,
                  direction:
                    v.direction === "horizontal" ? "vertical" : "horizontal",
                }))
              }
            >
              {resizableState.direction === "horizontal" ? (
                <SquareSplitHorizontalIcon />
              ) : (
                <SquareSplitVerticalIcon />
              )}
            </Button>
            <Button
              size="icon"
              disabled={resizableState.isReset}
              onClick={() => leftPanelRef.current?.resize(50)}
            >
              <RotateCcwIcon />
            </Button>
            <Button
              size="icon"
              disabled={resizableState.rightCollapsed}
              onClick={() => rightPanelRef.current?.collapse()}
            >
              {resizableState.direction === "horizontal" ? (
                <ArrowRightFromLineIcon />
              ) : (
                <ArrowDownFromLineIcon />
              )}
            </Button>
          </div>
        </ResizableHandle>
        <ResizablePanel
          collapsible
          collapsedSize={0}
          defaultSize={50}
          minSize={25}
          onCollapse={() =>
            setResizableState((v) => ({ ...v, rightCollapsed: true }))
          }
          onExpand={() =>
            setResizableState((v) => ({ ...v, rightCollapsed: false }))
          }
          ref={rightPanelRef}
        >
          <EditorOutput value={v} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  closeSearchPanel,
  findNext,
  findPrevious,
  getSearchQuery,
  replaceAll,
  replaceNext,
  search,
  SearchQuery,
  selectSelectionMatches,
  setSearchQuery,
} from "@codemirror/search";
import { type KeyBinding } from "@uiw/react-codemirror";
import { type EditorView } from "codemirror";
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
import { getIsTogglingSearchKeyCombo } from "~/constants/shortcuts";
import { useKeyDownEvent } from "~/hooks";

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

  const [searchStats, setSearchStats] = useState({ current: 0, total: 0 });
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

    // Update search statistics
    setTimeout(() => setSearchStats(getSearchStats(view)));
  }, [state, view]);

  const handleFindNext = () => {
    findNext(view);
    setTimeout(() => setSearchStats(getSearchStats(view)));
  };

  const handleFindPrevious = () => {
    findPrevious(view);
    setTimeout(() => setSearchStats(getSearchStats(view)));
  };

  useKeyDownEvent((e) => {
    if (e.code === "Escape") {
      e.preventDefault();
      closeSearchPanel(view);
    }
  });

  useKeyDownEvent((e) => {
    if (getIsTogglingSearchKeyCombo(e)) {
      // do not prevent default so that the native browser search can still work
      const selectedText = getSelectedText(view);
      if (selectedText && selectedText !== state.search) {
        updateState({ search: selectedText });
      }

      searchInputRef.current?.focus();
    }
  });

  return (
    <div
      data-search-panel
      className="bg-background flex w-full justify-end gap-2 p-2"
    >
      <Button
        size="icon"
        variant="outline"
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
              onKeyDown={(e) => {
                if (e.code === "Enter") {
                  e.preventDefault();
                  handleFindNext();
                }
                if (e.code === "ArrowDown") {
                  e.preventDefault();
                  // Focus the editor at the current cursor position (current match)
                  view.focus();
                }
              }}
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
          <div className="flex min-w-24 items-center px-1 text-sm">
            {Boolean(state.search) && searchStats.total > 0 && (
              <span className="text-muted-foreground">
                {searchStats.current} of {searchStats.total}
              </span>
            )}
            {Boolean(state.search) && !searchStats.total && (
              <span className="text-destructive">No results</span>
            )}
          </div>
          <div className="flex items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleFindPrevious}
              disabled={!state.search}
              title="Find Previous"
            >
              <ArrowUpIcon />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleFindNext}
              disabled={!state.search}
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
                  onClick={() => {
                    replaceNext(view);
                    setTimeout(() => setSearchStats(getSearchStats(view)));
                  }}
                  disabled={
                    !searchStats.total || !state.search || !state.replace
                  }
                  title="Replace"
                  className="size-8"
                >
                  <ReplaceIcon />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    replaceAll(view);
                    setTimeout(() => setSearchStats(getSearchStats(view)));
                  }}
                  disabled={
                    !searchStats.total || !state.search || !state.replace
                  }
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

export const escSearchPanel: KeyBinding = {
  key: "Escape",
  run: (view) => {
    // Close search panel if it's open
    closeSearchPanel(view);
    return true;
  },
  preventDefault: true,
};

export const selectAllMatches: KeyBinding = {
  key: "Shift-Mod-l",
  run: selectSelectionMatches,
};

export function createSearchPanel() {
  return search({
    createPanel(view) {
      const div = document.createElement("div");
      const root = ReactDOM.createRoot(div);

      const selectedText = getSelectedText(view);

      root.render(
        <CustomSearchPanel view={view} initialSearch={selectedText} />,
      );

      return { dom: div, top: true };
    },
  });
}

function getSelectedText(view: EditorView) {
  const selection = view.state.selection.main;
  if (selection.empty) return "";
  return view.state.doc.sliceString(selection.from, selection.to);
}

function getSearchStats(view: EditorView) {
  const query = getSearchQuery(view.state);
  if (!query || !query.search) {
    return { current: 0, total: 0 };
  }

  const doc = view.state.doc;
  const cursor = query.getCursor(doc);
  const matches: { from: number; to: number }[] = [];

  // Find all matches
  let result = cursor.next();
  while (!result.done) {
    matches.push({ from: result.value.from, to: result.value.to });
    result = cursor.next();
  }

  if (matches.length === 0) {
    return { current: 0, total: 0 };
  }

  // Find current match based on cursor position
  const cursorPos = view.state.selection.main.from;
  let currentMatch = 1;

  for (let i = 0; i < matches.length; i++) {
    if (matches[i].from >= cursorPos) {
      currentMatch = i + 1;
      break;
    }
    if (i === matches.length - 1) {
      currentMatch = matches.length;
    }
  }

  return { current: currentMatch, total: matches.length };
}

import { selectLine, selectLineDown } from "@codemirror/commands";
import {
  type Command,
  type EditorView,
  type KeyBinding,
} from "@uiw/react-codemirror";

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

export const addCursorUpKeyBinding: KeyBinding = {
  key: "Mod-Alt-ArrowUp",
  linux: "Shift-Alt-ArrowUp",
  run: addCursorUp,
  preventDefault: true,
};

export const addCursorDownKeyBinding: KeyBinding = {
  key: "Mod-Alt-ArrowDown",
  linux: "Shift-Alt-ArrowDown",
  run: addCursorDown,
  preventDefault: true,
};

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

export const keepSelectingLinesKeyBinding: KeyBinding = {
  key: "Mod-l",
  run: keepSelectingLines,
  preventDefault: true,
};

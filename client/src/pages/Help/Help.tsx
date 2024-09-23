import { Page } from "~/components/Layout";
import { CommandShortcutSnippet } from "~/components/ui";
import {
  collapseEditorPanelShortcut,
  collapsePreviewPanelShortcut,
  createNewNoteShortcut,
  openCommandPaletteBrowserShortcut,
  openCommandPaletteVSCodeShortcut,
  resetEditorPanelSizesShortcut,
  saveCurrentNoteShortcut,
  toggleSidebarShortcut,
  toggleSplitViewModeShortcut,
} from "~/constants/shortcuts";
import { useDocumentTitle } from "~/hooks";

export function Help() {
  useDocumentTitle("DevNote | Help");

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Help</Page.Title>

        <div className="grid gap-10">
          <Page.Section
            title="About"
            description="Learn more about the project and its goals"
          >
            <p>
              The aim of this project is to provide a simple and intuitive
              interface with a focus on writing and productivity achieved with a
              variety of shortcuts and carefully thought out default settings.
            </p>
            <p>Hope you enjoy using it :)</p>
          </Page.Section>

          <Page.Section
            title="Shortcuts"
            description="Increase your speed and productivity with keyboard shortcuts"
          >
            <div className="grid w-full divide-y">
              <ShortcutSnippet shortcut={createNewNoteShortcut}>
                Create a new note
              </ShortcutSnippet>
              <ShortcutSnippet shortcut={saveCurrentNoteShortcut}>
                Save your current note
              </ShortcutSnippet>
              <ShortcutSnippet shortcut={collapseEditorPanelShortcut}>
                Collapse the editor panel
              </ShortcutSnippet>
              <ShortcutSnippet shortcut={collapsePreviewPanelShortcut}>
                Collapse the preview panel
              </ShortcutSnippet>
              <ShortcutSnippet shortcut={toggleSplitViewModeShortcut}>
                Toggle split view direction ( vertical / horizontal )
              </ShortcutSnippet>
              <ShortcutSnippet shortcut={resetEditorPanelSizesShortcut}>
                Reset editor panel sizes to default
              </ShortcutSnippet>
              <ShortcutSnippet shortcut={toggleSidebarShortcut}>
                Toggle the sidebar state
              </ShortcutSnippet>
              <ShortcutSnippet
                shortcut={[
                  openCommandPaletteBrowserShortcut,
                  openCommandPaletteVSCodeShortcut,
                ]}
              >
                Open the command palette
              </ShortcutSnippet>
              <ShortcutSnippet shortcut="F1">
                Show Editor shortcuts ( available only when focused on the
                editor )
              </ShortcutSnippet>
            </div>
          </Page.Section>

          <Page.Section title="FAQ" description="Frequently asked questions">
            <FAQItem question="Where did my notes go?">
              DevNote uses IndexedDB to save your notes. If you delete the local
              database, your notes will be lost.
            </FAQItem>
            <FAQItem question="Can I restore a note?">
              No, once a note is deleted it cannot be restored. Please be
              careful when deleting notes.
            </FAQItem>
            <FAQItem question="Can I customize shortcuts?">
              Not yet, but it is planned for a future update.
            </FAQItem>
            <FAQItem question="Can I use it without internet?">
              Yes. Once you open the app for the first time, it is cached and
              can be installed on your device.
              <br />
              NOTE: For new versions, you will see a pop-up, which will refresh
              the page and update the app.
            </FAQItem>
            {/* <FAQItem question="Can I request a new feature?">
              Yes, please create an issue on the project's GitHub repository.
            </FAQItem> */}
          </Page.Section>
        </div>
      </Page.Content>
    </Page.Card>
  );
}

function ShortcutSnippet({
  children,
  shortcut,
}: React.PropsWithChildren<{ shortcut: string | string[] }>) {
  return (
    <div className="flex flex-col gap-1 py-3 md:flex-row">
      <p className="flex w-48 shrink-0 flex-col items-start gap-1">
        {Array.isArray(shortcut) ? (
          shortcut.map((s) => (
            <CommandShortcutSnippet key={s} className="ml-0">
              {s}
            </CommandShortcutSnippet>
          ))
        ) : (
          <CommandShortcutSnippet className="ml-0">
            {shortcut}
          </CommandShortcutSnippet>
        )}
      </p>
      <p>{children}</p>
    </div>
  );
}

function FAQItem({
  question,
  children,
}: React.PropsWithChildren<{ question: string }>) {
  return (
    <div className="flex flex-col gap-1 py-3">
      <div className="flex gap-2 font-bold">
        <span className="w-6 shrink-0 text-muted-foreground">Q:</span>{" "}
        <p>{question}</p>
      </div>
      <div className="flex gap-2">
        <span className="w-6 shrink-0 font-bold text-muted-foreground">A:</span>{" "}
        <p>{children}</p>
      </div>
    </div>
  );
}

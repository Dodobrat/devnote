import { createFileRoute } from "@tanstack/react-router";
import Markdown from "markdown-to-jsx";

import { Page } from "~/components/Page";

export const Route = createFileRoute("/app/changelog")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Page.Header title="Changelog" />
      <Page>
        <div className="prose dark:prose-invert max-w-none text-pretty break-words hyphens-auto **:first-of-type:[h2]:mt-0!">
          <Markdown options={{ enforceAtxHeadings: true }}>
            {CHANGELOG}
          </Markdown>
        </div>
      </Page>
    </>
  );
}

const CHANGELOG = `
## 13 Apr 2025

### Added

- Tags functionality.
- Notes can now be grouped by tag, filtered with the prefix \`tag:\` or select a tag from the filter menu.

### Refactor

- Restyled the minimal sidebar variant to be more similar to the default one to prevent design inconsistencies.

---

## 12 Apr 2025

### Added

- Minimal sidebar variant for better usability on small screens and more focused writing experience.

### Miscellaneous

- Improved performance by adding react-compiler.

---

## 9 Apr 2025

### Fixes

- Installed app safe area padding in drawers + sidebar bottom cropping on short pages.

### Added

- Splash screen for less layout shift on initial page load.

---

## 7 Apr 2025

### Fixes

- Dialog content wasn't scrollable and could go out of screen.
- Importing notes had a couple white spaces after the filename comment.
- While editing a note if you tried to create a new note with the Ctrl / Cmd + Enter key combo, a new line appeared triggering the dirty note navigation blocker.
- Due to excessive refetching, performance while typing and autosaving could sometimes cause the cursor to move to the beginning of the note.

### Miscellaneous

- Improved performance by implementing optimistic updates in a couple places.

---

## 6 Apr 2025

### Refactor

- **CORE**: Upgraded to React 19.
- **CORE**: Migrated to Tanstack Router.
- **CORE**: Upgraded to Tailwindcss 4 with all shadcn components.
- **CORE**: Moved all notes functionality to the sidebar.

### Added

- **CORE**: Import notes ( .md files or .zip archive ).
- **CORE**: Export notes ( .zip archive ).
- **CORE**: Download single note ( .md file ).
- **CORE**: Bulk Delete notes.
- **CORE**: Note preview side by side with resize and reset.

_Overall complete re-write of the app with backwards compatible api for the data layer_

---

## 5 Dec 2024

### Added

- **Editor**: Open the last edited note when the app is opened.

### Refactor

- **Navigation**: New note path is now \`/new\` instead of \`/\`.

### Fixes

- Derived title from the first line of the note content breaks create request when it is invalid.
- When switching between Editor and Preview modes, the editor history and focus were not preserved.

---

## 2 Dec 2024

### Refactor

- **Editor**: Migrated internal library for editor to CodeMirror 6 allowing for better styling and reduced bundle size.
- **Editor**: Removed resizable panels in favour of a 'Editor / Preview' toggle due to feedback from users.
- **Settings**: Changing the welcome message now redirects to a new page for the full experience while editing.

### Fixes

- Fixed wrong colors for toast close button.

---

## 12 Oct 2024

### Added

- **Notes**: Automatically create Note title from the first line of the note content.

### Miscellaneous

- Improved accessibility with more screen reader labels.

---

## 29 Sep 2024

### Fixed

- Fixed incorrect editor content when loading a note by id.

### Added

- **Error Handling**: Added Error boundaries on multiple levels in order to catch errors and still have a usable UI.
- **Customization**: When adding html to a note, \`<style>\` elements are now scoped to the markdown preview panel only.

---

## 29 Sep 2024

### Fixed

- Fixed server 404 page when hard refreshing with cleared cache.
- Fixed blank editor but populated preview when loading a note by id.

---

## 28 Sep 2024

### Fixed

- Saving dismissed mobile optimization notice for mobile devices.
- Disabled page transitions for mobile touch devices due to animation replay when swiping between pages.

### Added

- **Settings**: New setting to toggle between contained width for the editor preview for easier readability ( disabled by default ).
- **Editor**: Changing color of the resize handle while resizing.
- **Editor**: Animating the resize handle toolbar on collapsing panels.
- **Editor**: Bold headings in the editor.

---

## 24 Sep 2024

### Fixed

- Incorrect Meta key shortcut for Apple platform on mobile devices.

### Added

- **PWA**: Progressive Web App promotion install button added to the main navigation sidebar.
- **Mobile**: Show a lack of mobile optimization info toast in order to manage expectations :)
- **Selection**: Style the text selection for more unique feel and look.

---

## 23 Sep 2024

### Added

- **Monaco Editor Integration**: Enjoy a powerful and versatile editing experience.
- **Installable PWA**: Install the app on your device for quick access and offline use.
- **Light and Dark Modes**: Switch between themes to suit your preference.
- **Offline Support**: Access and edit your notes without an internet connection.
- **Note Management**:
  - Create and organize notes efficiently.
  - **Pin/Unpin Notes**: Keep important notes at the top.
  - **Drag to Reorder**: Easily rearrange your notes.
  - **Edit Note Titles**: Customize titles for better organization.
  - **Delete Notes**: Remove notes you no longer need.
- **Keyboard Shortcuts**: Boost productivity with documented shortcuts in [Help](/help) page.
- **Settings**:
  - **Note Autosave**: Toggle automatic saving of your notes.
  - **Welcome Message Customization**: Personalize your greeting message.
- **Command Palette**: Access features quickly using the command palette.`;

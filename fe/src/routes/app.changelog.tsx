import { createFileRoute } from "@tanstack/react-router";
import Markdown from "markdown-to-jsx";

import { Page } from "~/components";

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
## v0.1.1 ( 5 Dec 2024 )

### Added

- **Editor**: Open the last edited note when the app is opened.

### Refactor

- **Navigation**: New note path is now \`/new\` instead of \`/\`.

### Fixes

- Derived title from the first line of the note content breaks create request when it is invalid.
- When switching between Editor and Preview modes, the editor history and focus were not preserved.

## v0.1.0 ( 2 Dec 2024 )

### Refactor

- **Editor**: Migrated internal library for editor to CodeMirror 6 allowing for better styling and reduced bundle size.
- **Editor**: Removed resizable panels in favour of a 'Editor / Preview' toggle due to feedback from users.
- **Settings**: Changing the welcome message now redirects to a new page for the full experience while editing.

### Fixes

- Fixed wrong colors for toast close button.


## v0.0.6 ( 12 Oct 2024 )

### Added

- **Notes**: Automatically create Note title from the first line of the note content.

### Miscellaneous

- Improved accessibility with more screen reader labels.


## v0.0.5 ( 29 Sep 2024 )

### Fixed

- Fixed incorrect editor content when loading a note by id.

### Added

- **Error Handling**: Added Error boundaries on multiple levels in order to catch errors and still have a usable UI.
- **Customization**: When adding html to a note, \`<style>\` elements are now scoped to the markdown preview panel only.


## v0.0.4 ( 29 Sep 2024 )

### Fixed

- Fixed server 404 page when hard refreshing with cleared cache.
- Fixed blank editor but populated preview when loading a note by id.


## v0.0.3 ( 28 Sep 2024 )

### Fixed

- Saving dismissed mobile optimization notice for mobile devices.
- Disabled page transitions for mobile touch devices due to animation replay when swiping between pages.

### Added

- **Settings**: New setting to toggle between contained width for the editor preview for easier readability ( disabled by default ).
- **Editor**: Changing color of the resize handle while resizing.
- **Editor**: Animating the resize handle toolbar on collapsing panels.
- **Editor**: Bold headings in the editor.


## v0.0.2 ( 24 Sep 2024 )

### Fixed

- Incorrect Meta key shortcut for Apple platform on mobile devices.

### Added

- **PWA**: Progressive Web App promotion install button added to the main navigation sidebar.
- **Mobile**: Show a lack of mobile optimization info toast in order to manage expectations :)
- **Selection**: Style the text selection for more unique feel and look.


## v0.0.1 ( 23 Sep 2024 )

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

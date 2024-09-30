import Markdown from "markdown-to-jsx";

import { Page } from "~/components/Layout";
import { useDocumentTitle } from "~/hooks";

export function Changelog() {
  useDocumentTitle("DevNote | Changelog");

  return (
    <Page.Card>
      <Page.Content>
        <Page.Title>Changelog</Page.Title>

        <div className="prose max-w-none hyphens-auto text-pretty break-words dark:prose-invert">
          <Markdown options={{ enforceAtxHeadings: true }}>
            {CHANGELOG}
          </Markdown>
        </div>
      </Page.Content>
    </Page.Card>
  );
}

const CHANGELOG = `
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

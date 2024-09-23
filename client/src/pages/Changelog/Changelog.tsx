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
## 0.0.1 ( 23 Sep 2024 )

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

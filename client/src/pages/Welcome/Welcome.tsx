import { useEffect, useRef } from "react";

import { Editor } from "~/components/Editor";
import { useEditorNote } from "~/hooks/store/editor";

const WELCOME_TEXT = String(`# Welcome to DevNote

The aim of this project is to provide a simple and intuitive interface with a focus on writing and productivity achieved with a variety of shortcuts and carefully thought out default settings.

Hope you enjoy using it :)

## Features

- **Markdown Preview**: Real-time markdown preview with syntax highlighting

\`\`\`javascript
const example = "Hello, World!";
\`\`\`

\`\`\`json
{
  "firstName": "John",
  "lastName": "Smith",
  "age": 25
}
\`\`\`

- **Keyboard Shortcuts**: Increase your productivity with a variety of shortcuts
- **Split View**: Split the editor and preview vertically or horizontally

> Press \`Cmd + Shift + M\` to toggle between horizontal and vertical split screen mode

- **Customizable Theme**: Choose a theme that suits your preference
- **Autosave**: Automatically save your work as you type

> Press \`Cmd + Shift + P\` to open the command palette, Type in \`>theme\` or \`>auto\` and configure the settings by your preference.

- **Responsive Design**: Works on all devices
- **Offline Support**: Use the app without an internet connection

...and more coming soon

## Getting Started

1. Create a new note by saving the current note. 
2. ...that's it!

## Shortcuts

Refer to the [Help](/help) page for a list of available shortcuts.

## Settings

Customize your experience on the [Settings](/settings) page.

## Futher reading

For further reading on Markdown syntax, please refer to <a href="https://www.markdownguide.org/basic-syntax/" target="_blank">basic syntax</a> and <a href="https://www.markdownguide.org/basic-syntax/" target="_blank">extended syntax</a> [^(1)].

[^1]: Not all featues are supported in markdown, so you can use html instead to achieve the same result.`);

export function Welcome() {
  const { setNote } = useEditorNote();
  const setNoteInitialRef = useRef(setNote);

  useEffect(() => {
    setNoteInitialRef.current(WELCOME_TEXT);
  }, []);

  return <Editor />;
}

import { useState } from "react";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
} from "lucide-react";

import { useKeyDownEvent } from "~/hooks";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  DialogDescription,
  DialogTitle,
} from "../ui";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");

  useKeyDownEvent((e, isMac) => {
    // if key combination is ctrl / cmd + k
    // or
    // if key combination is ctrl / cmd + Shift + p
    if (
      ((isMac ? e.metaKey : e.ctrlKey) && e.key === "k") ||
      ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key === "p")
    ) {
      e.preventDefault();
      setOpen(true);
    }
  });

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Command prompt</DialogTitle>
      <DialogDescription className="sr-only">
        Execute actions or navigate to pages
      </DialogDescription>
      <CommandInput
        placeholder="Type a command or search..."
        value={prompt}
        onValueChange={setPrompt}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <Smile className="mr-2 h-4 w-4" />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem disabled>
            <Calculator className="mr-2 h-4 w-4" />
            <span>Calculator</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

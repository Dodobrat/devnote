import { generatePath, NavLink } from "react-router-dom";

import { cn } from "~/lib/utils";
import { AppRoutes } from "~/routes";
import { NoteSchemaType } from "~/types";

export function NoteLink({ note }: { note: NoteSchemaType }) {
  return (
    <NavLink
      to={generatePath(AppRoutes.NoteById, { id: String(note.id) })}
      className={cn([
        "col-span-full md:order-2 md:col-span-1",
        "truncate text-lg font-semibold leading-tight",
        "grow rounded-lg px-4 py-2 md:h-full",
        "focus:outline-none focus-visible:ring",
        "hover:bg-muted",
      ])}
    >
      {note.previewTitle}
    </NavLink>
  );
}

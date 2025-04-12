import { toast } from "sonner";

import { type NoteSchemaType } from "~/types/notes";

export function copyNoteLink(note: NoteSchemaType) {
  return () => {
    const fullNoteUrl = new URL(
      `/note/${note.id}`,
      window.location.origin,
    ).toString();

    window.navigator.clipboard
      .writeText(fullNoteUrl)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };
}

export function openNoteInNewTab(note: NoteSchemaType) {
  return () => {
    window.open(new URL(`/note/${note.id}`, window.location.origin), "_blank");
  };
}

export function downloadNote(note: NoteSchemaType) {
  return () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(note.note),
    );
    element.setAttribute("download", `${note.id}.md`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  };
}

const formatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function getPrettyDate(date: Date) {
  const parts = formatter.formatToParts(date);

  const getPartValue = (type: string) => {
    return parts.find((part) => part.type === type)?.value || "";
  };

  const day = getPartValue("day");
  const month = getPartValue("month");
  const year = getPartValue("year");
  const hour = getPartValue("hour");
  const minute = getPartValue("minute");
  const second = getPartValue("second");

  // "12 Mar 2025, 23:59:59"
  return `${day} ${month} ${year}, ${hour}:${minute}:${second}`;
}

import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import { Editor } from "~/components/Editor";
import { useDocumentTitle } from "~/hooks";
import { useNote, useSaveNote } from "~/hooks/query";
import { useEditorNote } from "~/hooks/store/editor";
import { AppRoutes } from "~/routes";

export function Note() {
  const params = useParams<{ id: string }>();
  const id = params.id!;

  const { data } = useNote(id);

  useDocumentTitle(`DevNote | ${data?.title || "My Note"}`);

  const { setNote } = useEditorNote();

  const saveNote = useSaveNote();

  useEffect(() => {
    if (!data) return;
    setNote(data.note);
  }, [data, setNote]);

  if (data === null) {
    return <Navigate to={AppRoutes.NotFound} />;
  }

  return <Editor saveNote={saveNote} />;
}

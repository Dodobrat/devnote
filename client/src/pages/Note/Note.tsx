import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Editor } from "~/components/Editor";
import { useNote } from "~/hooks/query";
import { useEditorNote } from "~/hooks/store/editor";

export function Note() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id!);
  const { data } = useNote(id);

  const { setNote } = useEditorNote();

  useEffect(() => {
    if (!data) return;
    setNote(data.note);
  }, [data, setNote]);

  return <Editor />;
}

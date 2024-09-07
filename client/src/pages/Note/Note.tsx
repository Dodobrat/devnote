import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { Editor } from "~/components/Editor";
import { useNote } from "~/hooks/query";
import { storeKeys, useQueryStore } from "~/hooks/store";

export function Note() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id!);
  const { data } = useNote(id);

  const [, setNote] = useQueryStore(storeKeys.rawNote, "");

  useEffect(() => {
    if (!data?.data) return;
    setNote(data.data.note);
  }, [data?.data, setNote]);

  return <Editor />;
}

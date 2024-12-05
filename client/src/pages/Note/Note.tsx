import { useEffect } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Editor } from "~/components/Editor";
import { LAST_VISITED_ROUTE_STATE_KEY } from "~/constants";
import { useDocumentTitle } from "~/hooks";
import { useNote, useSaveNote } from "~/hooks/query";
import { useEditorNote, useLastOpenedNote } from "~/hooks/store/editor";
import { AppRoutes } from "~/routes";

export function Note() {
  const location = useLocation();
  const params = useParams<{ id: string }>();
  const id = params.id!;

  const { data } = useNote(id);

  useDocumentTitle(`DevNote | ${data?.title || "My Note"}`);

  const [, setLastOpenedNote] = useLastOpenedNote();
  const { setNote } = useEditorNote();
  const saveNote = useSaveNote();

  useEffect(() => {
    if (!location.state?.from) return;
    if (location.state.from === LAST_VISITED_ROUTE_STATE_KEY) {
      toast("Navigated to last opened note", {
        id: LAST_VISITED_ROUTE_STATE_KEY,
      });
    }
  }, [location.state]);

  useEffect(() => {
    setLastOpenedNote(id);
  }, [id, setLastOpenedNote]);

  useEffect(() => {
    if (!data) return;
    setNote(data.note);
  }, [data, setNote]);

  if (data === null) {
    return <Navigate to={AppRoutes.NotFound} />;
  }

  return <Editor saveNote={saveNote} />;
}

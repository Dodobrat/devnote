import { generatePath, Navigate } from "react-router-dom";

import { LAST_VISITED_ROUTE_STATE_KEY } from "~/constants";
import { useLastOpenedNote } from "~/hooks/store/editor";
import { AppRoutes } from "~/routes";

export function LastVisitedNavigator() {
  const [lastOpenedNote] = useLastOpenedNote();

  if (!lastOpenedNote) return <Navigate to={AppRoutes.New} />;

  return (
    <Navigate
      replace
      state={{ from: LAST_VISITED_ROUTE_STATE_KEY }}
      to={generatePath(AppRoutes.NoteById, { id: lastOpenedNote })}
    />
  );
}

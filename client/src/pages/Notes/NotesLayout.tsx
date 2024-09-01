import { Outlet } from "react-router-dom";

import { Sidebar } from "./components";

export function NotesLayout() {
  return (
    <main className="gap flex h-screen overflow-hidden p-4">
      <Sidebar />
      <Outlet />
    </main>
  );
}

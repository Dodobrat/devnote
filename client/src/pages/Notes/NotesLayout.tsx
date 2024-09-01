import { Outlet } from "react-router-dom";

import { Sidebar } from "./components";

export function NotesLayout() {
  return (
    <main className="flex h-screen overflow-auto">
      <Sidebar />
      <Outlet />
    </main>
  );
}

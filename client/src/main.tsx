import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "./components/ui";
import { ThemeProvider } from "./context";
import { Note, NotesLayout, NotesWelcome, NotFound, Settings } from "./pages";
import { AppRoutes } from "./routes";

import "./index.css";

async function enableMocking() {
  // when or if using real BE, return before import

  const { worker } = await import("./mocks/browser");

  return worker.start();
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 } },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={AppRoutes.Root}>
      <Route index element={<Navigate to={AppRoutes.Notes} />} />
      <Route path={AppRoutes.Notes} element={<NotesLayout />}>
        <Route index element={<NotesWelcome />} />
        <Route path={AppRoutes.NoteById} element={<Note />} />
        <Route path={AppRoutes.NoteNotFound} element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path={AppRoutes.Settings} element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </StrictMode>,
  );
});

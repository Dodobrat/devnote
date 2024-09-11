import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Layout } from "./components/Layout";
import { Toaster, TooltipProvider } from "./components/ui";
import { ThemeProvider } from "./context";
import {
  Changelog,
  Help,
  Note,
  Notes,
  NotFound,
  Settings,
  Welcome,
} from "./pages";
import { AppRoutes } from "./routes";

import "./index.css";

async function enableMocking() {
  // when or if using real BE, return before import

  const { worker } = await import("./mocks/browser");

  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 } },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path={AppRoutes.Root} element={<Layout />}>
      <Route index element={<Welcome />} />
      <Route path={AppRoutes.Notes} element={<Notes />} />
      <Route path={AppRoutes.NoteById} element={<Note />} />

      <Route path={AppRoutes.Help} element={<Help />} />
      <Route path={AppRoutes.Changelog} element={<Changelog />} />
      <Route path={AppRoutes.Settings} element={<Settings />} />
      {/* NAV:
            -TOP START--------------------------
            - Go Premium - Coming soon
            - Account - Coming Soon
            - Templates - Coming Soon
            - Search - Coming Soon
              -- ( PREMIUM - Coming Soon ) Search by word in content or title ( show like VSCode search view ) ( https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string )

            - New note
              -- If creating a new note, ask for confirmation to clear the current one
              -- Navigate to root page with an empty editor and the quick start hints

            - Notes
              -- perform actions per note
                --- TAG note

            -TOP END--------------------------

            -BOTTOM START--------------------------
            - "Help"
              -- Page with FAQ, List of shortcuts, etc.

            - "Changelog"
              -- Page with info about new releases.

            - "Settings"
              -- theme
              -- locale - Coming soon

            - Feedback - Coming Soon
            -BOTTOM END--------------------------
      */}

      {/* Command Pallette
        Start with "/" to navigate
        Start with ">" to perform an action for the current note
      */}
      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <RouterProvider router={router} />
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </StrictMode>,
  );
});

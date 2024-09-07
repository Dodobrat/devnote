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

import { Editor } from "./components/Editor";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui";
import { ThemeProvider } from "./context";
import { Note, NotFound } from "./pages";
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
    <Route path={AppRoutes.Root} element={<Layout />}>
      {/* Layout should mimic VSCode with the vertical tabs ( ability to change position left or right ( default left ) ) */}
      {/* Tabs:
            -TOP START--------------------------
            - (Logo) - Same as create new
            - "Go Premium" - Coming soon

            - "Account" - Coming Soon

            - "New note"
              -- If creating a new note, ask for confirmation to clear the current one
              -- Navigate to root page with an empty editor and the quick start hints

            - "Notes"
              -- List all notes in sidebar
              -- Search by title ( https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string )
              -- drag and drop to reorder if not searching ( toggle reorder mode )
              -- bulk delete via bulk delete mode with confirmation
              -- perform actions per note
                --- ( PREMIUM - Coming Soon ) pin / unpin note
                --- lock / unlock note
                --- TAG note
                --- reorder actions...
                --- delete note with confirmation

            - Search - Coming Soon
              -- ( PREMIUM - Coming Soon ) Search by word in content or title ( show like VSCode search view ) ( https://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string )

            - "Templates" - Coming Soon
            -TOP END--------------------------

            -BOTTOM START--------------------------
            - "Help"
              -- Page with FAQ, List of shortcuts, etc.
            - "Changelog"
              -- Page with info about new releases.
            - "Settings"
              -- theme
              -- sidebar position
              -- locale - Coming soon
            - "Feedback" - Coming Soon

            - BTN "Toggle Sidebar"
            -BOTTOM END--------------------------
      */}

      {/* Command Pallette
        Start with "/" to navigate
        Start with ">" to perform an action for the current note
      */}

      {/* Initial page should be a new note with some instructions on how to get started  */}
      {/* Cmd + S -> create a new note and redirect to it to continue editing */}

      <Route index element={<Editor />} />
      <Route path={AppRoutes.NoteById} element={<Note />} />
      {/* <Route path={AppRoutes.Settings} element={<Settings />} /> */}
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

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

import { ErrorBoundary, PageErrorBoundary } from "./components/ErrorBoundary";
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
import { SettingsWelcomeMessage } from "./pages/SettingsWelcomeMessage";
import { AppRoutes } from "./routes";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 0 } },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path={AppRoutes.Root}
      element={<Layout />}
      errorElement={<ErrorBoundary />}
    >
      <Route index element={<Welcome />} errorElement={<PageErrorBoundary />} />
      <Route
        path={AppRoutes.Notes}
        element={<Notes />}
        errorElement={<PageErrorBoundary />}
      />
      <Route
        path={AppRoutes.NoteById}
        element={<Note />}
        errorElement={<PageErrorBoundary />}
      />

      <Route
        path={AppRoutes.Help}
        element={<Help />}
        errorElement={<PageErrorBoundary />}
      />
      <Route
        path={AppRoutes.Changelog}
        element={<Changelog />}
        errorElement={<PageErrorBoundary />}
      />
      <Route
        path={AppRoutes.Settings}
        element={<Settings />}
        errorElement={<PageErrorBoundary />}
      />
      <Route
        path={AppRoutes.SettingsWelcomeMessage}
        element={<SettingsWelcomeMessage />}
        errorElement={<PageErrorBoundary />}
      />

      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);

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

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

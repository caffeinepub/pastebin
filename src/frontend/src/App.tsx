import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./context/ThemeContext";
import { CreatePastePage } from "./pages/CreatePastePage";
import { HomePage } from "./pages/HomePage";
import { ImportArchivePage } from "./pages/ImportArchivePage";
import { PasteDetailPage } from "./pages/PasteDetailPage";

const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreatePastePage,
});

const pasteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/paste/$id",
  component: PasteDetailPage,
});

const importRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/import",
  component: ImportArchivePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createRoute_,
  pasteRoute,
  importRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster position="bottom-right" />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

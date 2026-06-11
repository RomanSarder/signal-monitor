import { createRouter, createRoute, createRootRoute, redirect } from "@tanstack/react-router";
import SignIn from "./auth/sign-in";
import SignUp from "./auth/sign-up";
import Dashboard from "./dashboard/index";
import Monitors from "./monitors/index";
import { apiFetch, ApiError } from "./api";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/sign-in" });
  },
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-in",
  component: SignIn,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  component: SignUp,
});

async function requireAuth() {
  try {
    await apiFetch("/auth/me");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      throw redirect({ to: "/sign-in" });
    }
    throw e;
  }
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: requireAuth,
  component: Dashboard,
});

const monitorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/monitors",
  beforeLoad: requireAuth,
  component: Monitors,
});

const routeTree = rootRoute.addChildren([indexRoute, signInRoute, signUpRoute, dashboardRoute, monitorsRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import LoginPage from '@/pages/Login/LoginPage';

const rootRoute = createRootRoute({
  component: () => <Outlet />
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
});

const routeTree = rootRoute.addChildren([loginRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

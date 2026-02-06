import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useAuthorization } from './hooks/useAuthorization';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AccountsPage from './pages/AccountsPage';
import AssetsPage from './pages/AssetsPage';
import DocumentsPage from './pages/DocumentsPage';
import SettingsPage from './pages/SettingsPage';
import AccessDeniedScreen from './components/auth/AccessDeniedScreen';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import { Loader2 } from 'lucide-react';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isAuthorized, isLoading: authLoading, userProfile, isFetched } = useAuthorization();

  const isAuthenticated = !!identity;

  // Show loading while initializing auth
  if (isInitializing || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied if authenticated but not authorized
  if (isAuthenticated && !authLoading && !isAuthorized) {
    return <AccessDeniedScreen />;
  }

  // Show profile setup if authorized but no profile
  const showProfileSetup = isAuthenticated && isAuthorized && !authLoading && isFetched && userProfile === null;

  return (
    <>
      {showProfileSetup && <ProfileSetupDialog />}
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: ClientsPage,
});

const clientDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients/$clientId',
  component: ClientDetailPage,
});

const accountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts',
  component: AccountsPage,
});

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assets',
  component: AssetsPage,
});

const documentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/documents',
  component: DocumentsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  clientsRoute,
  clientDetailRoute,
  accountsRoute,
  assetsRoute,
  documentsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

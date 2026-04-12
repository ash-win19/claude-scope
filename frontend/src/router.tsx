import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { CSSkeleton } from '@/components/ui/CSSkeleton';

// Lazy-loaded pages
const Landing = lazy(() => import('@/pages/Landing'));
const Auth = lazy(() => import('@/pages/Auth'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Sessions = lazy(() => import('@/pages/Sessions'));
const SessionDetail = lazy(() => import('@/pages/SessionDetail'));
const Settings = lazy(() => import('@/pages/Settings'));
const RecordNew = lazy(() => import('@/pages/RecordNew'));
const Processing = lazy(() => import('@/pages/Processing'));
const FrameReview = lazy(() => import('@/pages/FrameReview'));
const Output = lazy(() => import('@/pages/Output'));
const Integrations = lazy(() => import('@/pages/Integrations'));
const ModelAccess = lazy(() => import('@/pages/ModelAccess'));
const Docs = lazy(() => import('@/pages/Docs'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const PageSkeleton: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8" style={{ backgroundColor: 'var(--cs-bg-base)' }}>
    <CSSkeleton width={200} height={24} />
    <CSSkeleton width={400} height={16} />
    <CSSkeleton width={300} height={16} />
  </div>
);

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  if (isLoading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const wrap = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<PageSkeleton />}>
    <Component />
  </Suspense>
);

const wrapAuth = (Component: React.LazyExoticComponent<React.FC>) => (
  <AuthGuard>
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  </AuthGuard>
);

export const router = createBrowserRouter([
  { path: '/', element: wrap(Landing) },
  { path: '/auth', element: wrap(Auth) },

  // Workspace routes (authenticated)
  { path: '/workspace', element: wrapAuth(Dashboard) },
  { path: '/workspace/sessions', element: wrapAuth(Sessions) },
  { path: '/workspace/sessions/:id', element: wrapAuth(SessionDetail) },
  { path: '/workspace/settings', element: wrapAuth(Settings) },
  { path: '/workspace/record/new', element: wrapAuth(RecordNew) },
  { path: '/workspace/record/:id/processing', element: wrapAuth(Processing) },
  { path: '/workspace/record/:id/review', element: wrapAuth(FrameReview) },
  { path: '/workspace/record/:id/output', element: wrapAuth(Output) },
  { path: '/workspace/integrations', element: wrapAuth(Integrations) },
  { path: '/workspace/model-access', element: wrapAuth(ModelAccess) },
  { path: '/workspace/docs', element: wrapAuth(Docs) },

  // Legacy /app redirects
  { path: '/app', element: <Navigate to="/workspace" replace /> },
  { path: '/app/*', element: <Navigate to="/workspace" replace /> },

  { path: '*', element: wrap(NotFound) },
]);

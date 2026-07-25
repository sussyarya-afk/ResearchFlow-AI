import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { WorkspaceLayout } from '@/layouts/WorkspaceLayout';

import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { WorkspacePage } from '@/pages/WorkspacePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  /* ── Public ─────────────────────────────────────────────── */
  {
    path: '/',
    element: <HomePage />,
  },

  /* ── Auth ───────────────────────────────────────────────── */
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  /* ── Dashboard (protected area) ─────────────────────────── */
  {
    element: <DashboardLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },

  /* ── Workspace ──────────────────────────────────────────── */
  {
    path: '/workspace/:projectId',
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <WorkspacePage /> },
    ],
  },

  /* ── Catch-all ──────────────────────────────────────────── */
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

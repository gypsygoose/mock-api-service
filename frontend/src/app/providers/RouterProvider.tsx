import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { authLib } from '../../shared/lib/auth';

const LoginPage = lazy(() => import('../../pages/login/ui/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/register/ui/RegisterPage'));
const ProjectsPage = lazy(() => import('../../pages/projects/ui/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('../../pages/project-detail/ui/ProjectDetailPage'));
const ApiDetailPage = lazy(() => import('../../pages/api-detail/ui/ApiDetailPage'));

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authLib.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const RouterProvider: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={null}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <Guard>
              <ProjectsPage />
            </Guard>
          }
        />
        <Route
          path="/projects/:name"
          element={
            <Guard>
              <ProjectDetailPage />
            </Guard>
          }
        />
        <Route
          path="/projects/:name/endpoints/:id"
          element={
            <Guard>
              <ApiDetailPage />
            </Guard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

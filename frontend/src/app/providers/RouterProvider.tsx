import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { authLib } from '../../shared/lib/auth';
import LoginPage from '../../pages/login/ui/LoginPage';
import RegisterPage from '../../pages/register/ui/RegisterPage';
import ProjectsPage from '../../pages/projects/ui/ProjectsPage';
import ProjectDetailPage from '../../pages/project-detail/ui/ProjectDetailPage';
import ApiDetailPage from '../../pages/api-detail/ui/ApiDetailPage';

const Guard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!authLib.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const RouterProvider: React.FC = () => (
  <BrowserRouter>
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
  </BrowserRouter>
);

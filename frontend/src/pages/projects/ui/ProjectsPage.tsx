import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../../app/layouts/AppLayout';
import { ProjectList } from '../../../features/project/list/ui/ProjectList';
import { projectApi } from '../../../entities/project/api/projectApi';
import { Project } from '../../../entities/project/model/types';
import styles from './ProjectsPage.module.css';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.list().then(({ data }) => setProjects(data ?? [])).finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <main className={styles.page}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>My Projects</h1>
        </div>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : projects.length === 0 ? (
          <div className={styles.empty}>
            <p>No projects yet. Use the + button in the sidebar to create one.</p>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </main>
    </AppLayout>
  );
};

export default ProjectsPage;

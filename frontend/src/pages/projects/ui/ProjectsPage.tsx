import React, { useEffect, useState } from 'react';
import { AppLayout } from '../../../app/layouts/AppLayout';
import { ProjectList } from '../../../features/project/list/ui/ProjectList';
import { projectApi } from '../../../entities/project/api/projectApi';
import { mockApiApi } from '../../../entities/mock-api/api/mockApiApi';
import { Project } from '../../../entities/project/model/types';
import styles from './ProjectsPage.module.css';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.list().then(({ data }) => {
      const ps = data ?? [];
      setProjects(ps);
      Promise.all(
        ps.map(p =>
          mockApiApi.list(p.name)
            .then(r => [p.name, (r.data ?? []).length] as [string, number])
            .catch(() => [p.name, 0] as [string, number])
        )
      ).then(entries => setCounts(Object.fromEntries(entries)));
    }).finally(() => setLoading(false));
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
          <ProjectList projects={projects} counts={counts} />
        )}
      </main>
    </AppLayout>
  );
};

export default ProjectsPage;

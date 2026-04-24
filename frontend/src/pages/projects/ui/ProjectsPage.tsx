import React, { useEffect, useState } from 'react';
import { Header } from '../../../widgets/header/ui/Header';
import { ProjectList } from '../../../features/project/list/ui/ProjectList';
import { CreateProjectModal } from '../../../features/project/create/ui/CreateProjectModal';
import { Button } from '../../../shared/ui/Button/Button';
import { projectApi } from '../../../entities/project/api/projectApi';
import { Project } from '../../../entities/project/model/types';
import styles from './ProjectsPage.module.css';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    projectApi.list().then(({ data }) => setProjects(data ?? [])).finally(() => setLoading(false));
  }, []);

  const onCreated = (project: Project) => setProjects((prev) => [project, ...prev]);

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.topbar}>
          <h1 className={styles.title}>My Projects</h1>
          <Button onClick={() => setShowModal(true)}>+ New Project</Button>
        </div>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <ProjectList projects={projects} />
        )}
      </main>
      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={onCreated} />
      )}
    </>
  );
};

export default ProjectsPage;

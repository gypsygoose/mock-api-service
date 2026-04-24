import React from 'react';
import { Card } from '../../../../shared/ui/Card/Card';
import { Project } from '../../../../entities/project/model/types';
import styles from './ProjectList.module.css';

interface Props {
  projects: Project[];
}

export const ProjectList: React.FC<Props> = ({ projects }) => {
  if (projects.length === 0) {
    return <p className={styles.empty}>No projects yet. Create your first one!</p>;
  }

  return (
    <div className={styles.grid}>
      {projects.map((p) => (
        <Card key={p.id} to={`/projects/${p.name}`}>
          <p className={styles.name}>{p.name}</p>
          <span className={styles.date}>{new Date(p.created_at).toLocaleDateString()}</span>
        </Card>
      ))}
    </div>
  );
};

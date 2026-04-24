import React from 'react';
import { Card } from '../../../../shared/ui/Card/Card';
import { Project } from '../../../../entities/project/model/types';
import styles from './ProjectList.module.css';

interface Props {
  projects: Project[];
  counts?: Record<string, number>;
}

export const ProjectList: React.FC<Props> = ({ projects, counts = {} }) => {
  if (projects.length === 0) {
    return <p className={styles.empty}>No projects yet. Create your first one!</p>;
  }

  return (
    <div className={styles.grid}>
      {projects.map((p) => {
        const n = counts[p.name];
        const label = n === undefined ? '' : n === 1 ? '1 endpoint' : `${n} endpoints`;
        return (
          <Card key={p.id} to={`/projects/${p.name}`}>
            <p className={styles.name}>{p.name}</p>
            <span className={styles.count}>{label}</span>
          </Card>
        );
      })}
    </div>
  );
};

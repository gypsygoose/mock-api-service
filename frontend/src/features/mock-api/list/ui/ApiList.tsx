import React from 'react';
import { Link } from 'react-router-dom';
import { MockEndpoint } from '../../../../entities/mock-api/model/types';
import { MethodBadge } from '../../../../shared/ui/Badge/Badge';
import styles from './ApiList.module.css';

interface Props {
  endpoints: MockEndpoint[];
  projectName: string;
}

export const ApiList: React.FC<Props> = ({ endpoints, projectName }) => {
  if (endpoints.length === 0) {
    return <p className={styles.empty}>No endpoints yet. Create your first mock!</p>;
  }

  return (
    <div className={styles.list}>
      {endpoints.map((e) => (
        <Link
          key={e.id}
          to={`/projects/${projectName}/endpoints/${e.id}`}
          className={styles.item}
        >
          <MethodBadge method={e.method} />
          <span className={styles.path}>{e.path}</span>
          <span className={styles.status}>{e.status_code}</span>
        </Link>
      ))}
    </div>
  );
};

import React from 'react';
import { Sidebar } from '../../widgets/sidebar/ui/Sidebar';
import styles from './AppLayout.module.css';

interface Props {
  children: React.ReactNode;
  activeProjectName?: string;
}

export const AppLayout: React.FC<Props> = ({ children, activeProjectName }) => (
  <div className={styles.layout}>
    <Sidebar activeProjectName={activeProjectName} />
    <div className={styles.content}>
      {children}
    </div>
  </div>
);

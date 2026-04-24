import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectApi } from '../../../entities/project/api/projectApi';
import { Project } from '../../../entities/project/model/types';
import { authLib } from '../../../shared/lib/auth';
import { CreateProjectModal } from '../../../features/project/create/ui/CreateProjectModal';
import styles from './Sidebar.module.css';

interface Props {
  activeProjectName?: string;
}

export const Sidebar: React.FC<Props> = ({ activeProjectName }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  const email = authLib.getEmail();
  const initials = email ? email.slice(0, 2).toUpperCase() : 'U';
  const displayName = email ?? 'User';

  const load = () => {
    projectApi.list().then(({ data }) => setProjects(data ?? []));
  };

  useEffect(() => {
    load();
  }, []);

  const logout = () => {
    authLib.removeToken();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <div className={styles.logoRow}>
          <svg className={styles.logoIcon} width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="#030213"/>
            <path d="M8 11h16M8 16h11M8 21h13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className={styles.logoText}>API Mocker</span>
        </div>
        <p className={styles.logoSubtitle}>Mock REST APIs instantly</p>
      </div>

      <div className={styles.navSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Projects</span>
          <button
            className={styles.addBtn}
            onClick={() => setShowCreate(true)}
            aria-label="New project"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3.33V12.67M3.33 8h9.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <nav className={styles.projectList}>
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.name}`}
              className={`${styles.projectItem} ${p.name === activeProjectName ? styles.active : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.projectIcon}>
                <path d="M2 5.33a1.33 1.33 0 011.33-1.33h2.94l1.33 1.33h5.07A1.33 1.33 0 0114 6.67v6A1.33 1.33 0 0112.67 14H3.33A1.33 1.33 0 012 12.67V5.33z" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              <span className={styles.projectName}>{p.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.userSection}>
        <button className={styles.userMenu} onClick={logout} title="Click to sign out">
          <div className={styles.avatar}>{initials}</div>
          <span className={styles.userName}>{displayName}</span>
        </button>
      </div>

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={(p) => {
            setShowCreate(false);
            load();
            navigate(`/projects/${p.name}`);
          }}
        />
      )}
    </aside>
  );
};

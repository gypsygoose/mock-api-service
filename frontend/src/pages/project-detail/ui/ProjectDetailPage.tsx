import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../../../app/layouts/AppLayout';
import { ApiList } from '../../../features/mock-api/list/ui/ApiList';
import { CreateApiModal } from '../../../features/mock-api/create/ui/CreateApiModal';
import { mockApiApi } from '../../../entities/mock-api/api/mockApiApi';
import { MockEndpoint } from '../../../entities/mock-api/model/types';
import styles from './ProjectDetailPage.module.css';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const ProjectDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [methodFilter, setMethodFilter] = useState('');
  const [pathFilter, setPathFilter] = useState('');

  useEffect(() => {
    if (!name) return;
    const delay = pathFilter ? 300 : 0;
    const timerId = setTimeout(() => {
      setLoading(true);
      mockApiApi
        .list(name, { method: methodFilter || undefined, path: pathFilter || undefined })
        .then(({ data }) => setEndpoints(data ?? []))
        .finally(() => setLoading(false));
    }, delay);
    return () => clearTimeout(timerId);
  }, [name, methodFilter, pathFilter]);

  const onCreated = (endpoint: MockEndpoint) => {
    setMethodFilter('');
    setPathFilter('');
    setEndpoints((prev) => [endpoint, ...prev]);
  };
  const onDeleted = (id: string) => setEndpoints((prev) => prev.filter((e) => e.id !== id));

  if (!name) return null;

  return (
    <AppLayout activeProjectName={name}>
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>{name}</h1>
          <span className={styles.subtitle}>
            {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button className={styles.newBtn} onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3.33V12.67M3.33 8h9.34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          New Endpoint
        </button>
      </div>

      <div className={styles.filterBar}>
        <select
          className={styles.methodSelect}
          value={methodFilter}
          onChange={e => setMethodFilter(e.target.value)}
        >
          <option value="">All methods</option>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          className={styles.pathInput}
          type="text"
          placeholder="Filter by path…"
          value={pathFilter}
          onChange={e => setPathFilter(e.target.value)}
        />
        {(methodFilter || pathFilter) && (
          <button
            className={styles.clearBtn}
            onClick={() => { setMethodFilter(''); setPathFilter(''); }}
          >
            Clear
          </button>
        )}
      </div>

      <main className={styles.content}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <ApiList endpoints={endpoints} projectName={name} onDelete={onDeleted} />
        )}
      </main>

      {showModal && (
        <CreateApiModal
          projectName={name}
          onClose={() => setShowModal(false)}
          onCreated={onCreated}
        />
      )}
    </AppLayout>
  );
};

export default ProjectDetailPage;

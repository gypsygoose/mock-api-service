import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../../../widgets/header/ui/Header';
import { ApiList } from '../../../features/mock-api/list/ui/ApiList';
import { CreateApiModal } from '../../../features/mock-api/create/ui/CreateApiModal';
import { Button } from '../../../shared/ui/Button/Button';
import { mockApiApi } from '../../../entities/mock-api/api/mockApiApi';
import { MockEndpoint } from '../../../entities/mock-api/model/types';
import styles from './ProjectDetailPage.module.css';

const ProjectDetailPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!name) return;
    mockApiApi.list(name).then(({ data }) => setEndpoints(data ?? [])).finally(() => setLoading(false));
  }, [name]);

  const onCreated = (endpoint: MockEndpoint) => setEndpoints((prev) => [endpoint, ...prev]);

  if (!name) return null;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Link to="/" className={styles.back}>← All Projects</Link>
        <div className={styles.topbar}>
          <h1 className={styles.title}>{name}</h1>
          <Button onClick={() => setShowModal(true)}>+ New Endpoint</Button>
        </div>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <ApiList endpoints={endpoints} projectName={name} />
        )}
      </main>
      {showModal && (
        <CreateApiModal
          projectName={name}
          onClose={() => setShowModal(false)}
          onCreated={onCreated}
        />
      )}
    </>
  );
};

export default ProjectDetailPage;

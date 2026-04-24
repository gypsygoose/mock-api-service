import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../../../widgets/header/ui/Header';
import { MethodBadge } from '../../../shared/ui/Badge/Badge';
import { mockApiApi } from '../../../entities/mock-api/api/mockApiApi';
import { MockEndpoint } from '../../../entities/mock-api/model/types';
import { API_BASE_URL } from '../../../shared/config';
import styles from './ApiDetailPage.module.css';

const ApiDetailPage: React.FC = () => {
  const { name, id } = useParams<{ name: string; id: string }>();
  const [endpoint, setEndpoint] = useState<MockEndpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!name || !id) return;
    mockApiApi.get(name, id).then(({ data }) => setEndpoint(data)).finally(() => setLoading(false));
  }, [name, id]);

  if (!name || !id) return null;

  const mockUrl = endpoint
    ? `${API_BASE_URL}/mock/${name}${endpoint.path}`
    : '';

  const copyUrl = () => {
    navigator.clipboard.writeText(mockUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <Header />
      <main className={styles.page}>
        <Link to={`/projects/${name}`} className={styles.back}>
          ← {name}
        </Link>

        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : endpoint ? (
          <>
            <div className={styles.header}>
              <MethodBadge method={endpoint.method} />
              <h1 className={styles.path}>{endpoint.path}</h1>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Full Mock URL</p>
              <div className={styles.urlBox}>
                <span className={styles.url}>{mockUrl}</span>
                <button className={styles.copyBtn} onClick={copyUrl}>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Method</p>
                  <p className={styles.metaValue}>{endpoint.method}</p>
                </div>
                <div className={styles.metaItem}>
                  <p className={styles.metaLabel}>Status Code</p>
                  <p className={styles.metaValue}>{endpoint.status_code}</p>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Response Body</p>
              <pre className={styles.code}>
                {JSON.stringify(endpoint.response_data, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <p className={styles.loading}>Endpoint not found</p>
        )}
      </main>
    </>
  );
};

export default ApiDetailPage;

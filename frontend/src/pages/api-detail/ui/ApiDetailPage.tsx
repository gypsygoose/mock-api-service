import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppLayout } from '../../../app/layouts/AppLayout';
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

  const mockUrl = endpoint ? `${API_BASE_URL}/mock/${name}${endpoint.path}` : '';

  const copyUrl = () => {
    navigator.clipboard.writeText(mockUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <AppLayout activeProjectName={name}>
      <div className={styles.pageHeader}>
        <Link to={`/projects/${name}`} className={styles.back}>
          ← {name}
        </Link>
      </div>

      <main className={styles.content}>
        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : endpoint ? (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.methodPath}>
                <MethodBadge method={endpoint.method} />
                <span className={styles.path}>{endpoint.path}</span>
              </div>
            </div>

            <div className={styles.urlRow}>
              <span className={styles.label}>Public URL:</span>
              <div className={styles.urlBox}>
                <span className={styles.urlCode}>{mockUrl}</span>
                <button className={styles.copyBtn} onClick={copyUrl} aria-label="Copy URL">
                  {copied ? (
                    <span className={styles.copiedText}>Copied!</span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M3 9H2a1 1 0 01-1-1V2a1 1 0 011-1h6a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.responseSection}>
              <div className={styles.responseHeader}>
                <span className={styles.label}>Response:</span>
                <span className={styles.statusBadge}>{endpoint.status_code}</span>
              </div>
              <pre className={styles.codeBlock}>
                {JSON.stringify(endpoint.response_data, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className={styles.loading}>Endpoint not found</p>
        )}
      </main>
    </AppLayout>
  );
};

export default ApiDetailPage;

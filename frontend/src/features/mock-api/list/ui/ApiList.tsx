import React, { useState } from 'react';
import { MockEndpoint } from '../../../../entities/mock-api/model/types';
import { mockApiApi } from '../../../../entities/mock-api/api/mockApiApi';
import { MethodBadge } from '../../../../shared/ui/Badge/Badge';
import { API_BASE_URL } from '../../../../shared/config';
import styles from './ApiList.module.css';

interface Props {
  endpoints: MockEndpoint[];
  projectName: string;
  onDelete?: (id: string) => void;
}

const EndpointCard: React.FC<{
  endpoint: MockEndpoint;
  projectName: string;
  onDelete?: (id: string) => void;
}> = ({ endpoint, projectName, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mockUrl = `${API_BASE_URL}/mock/${projectName}${endpoint.path}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(mockUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    setDeleting(true);
    mockApiApi
      .delete(projectName, endpoint.id)
      .then(() => onDelete(endpoint.id))
      .catch(() => setDeleting(false));
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.methodPath}>
          <MethodBadge method={endpoint.method} />
          <span className={styles.path}>{endpoint.path}</span>
        </div>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete endpoint"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5.33 4V2.67h5.34V4M6.67 7.33v4.67M9.33 7.33v4.67M3.33 4l.67 9.33h8L12.67 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
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
  );
};

export const ApiList: React.FC<Props> = ({ endpoints, projectName, onDelete }) => {
  if (endpoints.length === 0) {
    return <p className={styles.empty}>No endpoints yet. Create your first mock!</p>;
  }

  return (
    <div className={styles.list}>
      {endpoints.map((e) => (
        <EndpointCard key={e.id} endpoint={e} projectName={projectName} onDelete={onDelete} />
      ))}
    </div>
  );
};

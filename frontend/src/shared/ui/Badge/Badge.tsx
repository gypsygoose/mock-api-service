import React from 'react';
import styles from './Badge.module.css';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface BadgeProps {
  method: HttpMethod | string;
}

export const MethodBadge: React.FC<BadgeProps> = ({ method }) => {
  const upper = method.toUpperCase() as HttpMethod;
  const cls = styles[upper] ?? '';

  return <span className={`${styles.badge} ${cls}`}>{upper}</span>;
};

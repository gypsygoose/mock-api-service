import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  to?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, to, className }) => {
  const classes = [styles.card, to ? styles.clickable : '', className ?? ''].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return <div className={classes}>{children}</div>;
};

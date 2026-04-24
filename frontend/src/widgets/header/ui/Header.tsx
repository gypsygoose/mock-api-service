import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authLib } from '../../../shared/lib/auth';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  const logout = () => {
    authLib.removeToken();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        MockAPI
      </Link>
      <div className={styles.spacer} />
      <button className={styles.logout} onClick={logout}>
        Sign out
      </button>
    </header>
  );
};

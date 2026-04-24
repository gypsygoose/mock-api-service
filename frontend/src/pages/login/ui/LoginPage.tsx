import React from 'react';
import { Link } from 'react-router-dom';
import { LoginForm } from '../../../features/auth/login/ui/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.box}>
      <Link to="/" className={styles.logoRow}>
        <img src="/logo.svg" width="32" height="32" alt="logo" />
        <span className={styles.title}>API Mocker</span>
      </Link>
      <p className={styles.subtitle}>Sign in to manage your mock APIs</p>
      <LoginForm />
    </div>
  </div>
);

export default LoginPage;

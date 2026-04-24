import React from 'react';
import { LoginForm } from '../../../features/auth/login/ui/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.box}>
      <div className={styles.logoRow}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#030213"/>
          <path d="M8 11h16M8 16h11M8 21h13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <span className={styles.title}>API Mocker</span>
      </div>
      <p className={styles.subtitle}>Sign in to manage your mock APIs</p>
      <LoginForm />
    </div>
  </div>
);

export default LoginPage;

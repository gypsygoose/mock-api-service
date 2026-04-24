import React from 'react';
import { LoginForm } from '../../../features/auth/login/ui/LoginForm';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.box}>
      <h1 className={styles.title}>MockAPI</h1>
      <p className={styles.subtitle}>Sign in to manage your mock APIs</p>
      <LoginForm />
    </div>
  </div>
);

export default LoginPage;

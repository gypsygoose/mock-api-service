import React from 'react';
import { Link } from 'react-router-dom';
import { RegisterForm } from '../../../features/auth/register/ui/RegisterForm';
import styles from '../../login/ui/LoginPage.module.css';

const RegisterPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.box}>
      <Link to="/" className={styles.logoRow}>
        <img src="/logo.svg" width="32" height="32" alt="logo" />
        <span className={styles.title}>API Mocker</span>
      </Link>
      <p className={styles.subtitle}>Create your account to get started</p>
      <RegisterForm />
    </div>
  </div>
);

export default RegisterPage;

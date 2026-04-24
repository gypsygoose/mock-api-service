import React from 'react';
import { RegisterForm } from '../../../features/auth/register/ui/RegisterForm';
import styles from '../../login/ui/LoginPage.module.css';

const RegisterPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.box}>
      <h1 className={styles.title}>MockAPI</h1>
      <p className={styles.subtitle}>Create your account to get started</p>
      <RegisterForm />
    </div>
  </div>
);

export default RegisterPage;

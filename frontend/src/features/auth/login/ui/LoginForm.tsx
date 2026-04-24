import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import { useLogin } from '../model/useLogin';
import styles from './LoginForm.module.css';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useLogin();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error && <div className={styles.error}>{error}</div>}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      <Button type="submit" fullWidth loading={loading}>
        Sign In
      </Button>
      <p className={styles.footer}>
        No account?{' '}
        <Link to="/register" className={styles.link}>
          Create one
        </Link>
      </p>
    </form>
  );
};

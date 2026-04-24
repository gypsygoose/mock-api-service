import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../../shared/ui/Input/Input';
import { Button } from '../../../../shared/ui/Button/Button';
import { useRegister } from '../model/useRegister';
import styles from '../../../auth/login/ui/LoginForm.module.css';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loading, error } = useRegister();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register(email, password);
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
        placeholder="At least 6 characters"
        minLength={6}
        required
      />
      <Button type="submit" fullWidth loading={loading}>
        Create Account
      </Button>
      <p className={styles.footer}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </form>
  );
};

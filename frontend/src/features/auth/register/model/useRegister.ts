import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../../entities/user/api/userApi';
import { authLib } from '../../../../shared/lib/auth';

export const useRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await userApi.register(email, password);
      // Auto-login after registration
      const { data } = await userApi.login(email, password);
      authLib.setToken(data.token);
      navigate('/');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError('Email already in use');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return { register, loading, error };
};

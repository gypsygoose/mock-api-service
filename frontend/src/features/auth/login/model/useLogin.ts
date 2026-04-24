import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../../entities/user/api/userApi';
import { authLib } from '../../../../shared/lib/auth';

export const useLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await userApi.login(email, password);
      authLib.setToken(data.token);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

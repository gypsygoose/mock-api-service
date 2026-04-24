import { apiInstance } from '../../../shared/api/instance';
import { AuthResponse, User } from '../model/types';

export const userApi = {
  register: (email: string, password: string) =>
    apiInstance.post<User>('/api/auth/register', { email, password }),

  login: (email: string, password: string) =>
    apiInstance.post<AuthResponse>('/api/auth/login', { email, password }),
};

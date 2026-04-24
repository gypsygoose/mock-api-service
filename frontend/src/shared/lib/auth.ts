const TOKEN_KEY = 'mock_api_token';

export const authLib = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),
};

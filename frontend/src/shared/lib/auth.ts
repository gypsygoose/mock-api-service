const TOKEN_KEY = 'mock_api_token';

const parseTokenPayload = (token: string): Record<string, unknown> | null => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const authLib = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  removeToken: (): void => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: (): boolean => !!localStorage.getItem(TOKEN_KEY),
  getEmail: (): string | null => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    const payload = parseTokenPayload(token);
    return (payload?.email as string) ?? null;
  },
};

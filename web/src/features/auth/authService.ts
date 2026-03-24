import { api, getStoredToken, initApiClient, removeToken, setToken } from '../../api/api.ts';
import { useUserStore } from './useUserStore.ts';
import { useEffect } from 'react';
import type { LoginRequest } from '../../api/gen';

class AuthService {
  private async initUserWithToken(token: string) {
    initApiClient(token);
    const user = await api.user.getUsersMe();
    if (!user) return null;
    return { user, token };
  }

  async login(emailOrUsername: string, password: string) {
    const isEmail = emailOrUsername.includes('@');
    const body: LoginRequest = isEmail
      ? { email: emailOrUsername, password }
      : { username: emailOrUsername, password };
    const tokenData = await api.auth.postUsersLogin(body);
    if (!tokenData.token) return null;
    return this.initUserWithToken(tokenData.token);
  }

  async register(email: string, password: string) {
    const tokenData = await api.auth.postUsersRegister({ email, password });
    if (!tokenData.token) return null;
    return this.initUserWithToken(tokenData.token);
  }
}

const authService = new AuthService();

export const useUser = () => {
  const visibleUsername = useUserStore((store) => store.currentUser?.visible_username);
  const avatarUrl = useUserStore((store) => store.currentUser?.avatar_url);

  const setAvatarUrl = useUserStore((store) => store.setAvatarUrl);
  const setVisibleUsername = useUserStore((store) => store.setVisibleUsername);

  const setIsInitialized = useUserStore((store) => store.setIsInitialized);
  const isInitialized = useUserStore((store) => store.isInitialized);

  const setCurrentUser = useUserStore((store) => store.setUserData);
  const setCurrentToken = useUserStore((store) => store.setToken);
  const clearCurrentUser = useUserStore((store) => store.clearUserData);

  const isAuthenticated = useUserStore((store) => store.isAuthenticated);
  const setIsAuthenticated = useUserStore((store) => store.setIsAuthenticated);

  useEffect(() => {
    // Guard against multiple component mounts triggering simultaneous inits
    if (useUserStore.getState().isInitialized) return;

    const init = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        try {
          setToken(storedToken);
          const userInfo = await api.user.getUsersMe();
          setCurrentUser(userInfo);
          setCurrentToken(storedToken);
          setIsAuthenticated(true);
        } catch {
          // Access token expired/invalid — attempt silent refresh via httpOnly cookie
          removeToken();
          try {
            const { accessToken } = await api.auth.postUsersRefreshToken();
            if (accessToken?.token) {
              initApiClient(accessToken.token);
              const userInfo = await api.user.getUsersMe();
              setCurrentUser(userInfo);
              setCurrentToken(accessToken.token);
              setIsAuthenticated(true);
            }
          } catch {
            // Refresh also failed — user must log in again
          }
        }
      }
      setIsInitialized(true);
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (emailOrUsername: string, password: string) => {
    const result = await authService.login(emailOrUsername, password);
    if (!result) return;
    setCurrentUser(result.user);
    setCurrentToken(result.token);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    const result = await authService.register(email, password);
    if (!result) return;
    setCurrentUser(result.user);
    setCurrentToken(result.token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.auth.postUsersLogout();
    } catch {
      // Ignore errors — clear local state regardless
    }
    removeToken();
    clearCurrentUser();
    setIsAuthenticated(false);
  };

  return {
    visibleUsername,
    avatarUrl,
    setAvatarUrl,
    setVisibleUsername,
    isInitialized,
    isAuthenticated,
    login,
    register,
    logout,
  };
};

import { api, getStoredToken, initApiClient, removeToken, setToken } from '../../api/api.ts';
import { useUserStore } from './useUserStore.ts';
import { Token } from '../../api/gen';
import { useEffect } from 'react';

class AuthService {
  private async initUserWithToken(tokenData: Token) {
    if (!tokenData.token) return;
    initApiClient(tokenData.token);
    const user = await api.user.getUsersMe();
    if (!user) return;
    return {
      user,
      token: tokenData.token,
    };
  }

  async login(emailOrUsername: string, password: string) {
    const tokenData = await api.auth.postUsersLogin({ email: emailOrUsername, password });
    return this.initUserWithToken(tokenData);
  }

  async register(email: string, password: string) {
    const tokenData = await api.auth.postUsersRegister({ email, password });
    return this.initUserWithToken(tokenData);
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
    const doLogin = async () => {
      const token = getStoredToken();
      if (token) {
        setToken(token);
        const userInfo = await api.user.getUsersMe();
        setCurrentUser(userInfo);
        setCurrentToken(token);
        setIsAuthenticated(true);
      }
      setIsInitialized(true);
    };
    doLogin().then(() => void 0);
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const user = await authService.login(emailOrUsername, password);
    if (!user) return;
    setCurrentUser(user.user);
    setCurrentToken(user.token);
    setIsAuthenticated(true);
  };

  const register = async (email: string, password: string) => {
    const user = await authService.register(email, password);
    if (!user) return;
    setCurrentUser(user.user);
    setCurrentToken(user.token);
    setIsAuthenticated(true);
  };

  const logout = () => {
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

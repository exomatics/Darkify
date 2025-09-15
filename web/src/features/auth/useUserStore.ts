import { create } from 'zustand';
import { UserInfo } from '../../api/gen';

type UserStore = {
  isInitialized: boolean;
  isAuthenticated: boolean;
  currentUser: UserInfo | null;
  token: string | null;
  setIsInitialized: (isInitialized: boolean) => void;
  setUserData: (data: UserInfo) => void;
  setToken: (token: string) => void;
  clearUserData: () => void;
  setAvatarUrl: (avatarUrl: string) => void;
  setVisibleUsername: (avatarUrl: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
};

export const useUserStore = create<UserStore>()((set) => ({
  isInitialized: false,
  isAuthenticated: false,
  currentUser: null,
  token: null,
  setIsInitialized(isInitialized: boolean) {
    set((state) => ({ ...state, isInitialized }));
  },
  setIsAuthenticated(isAuthenticated: boolean) {
    set((state) => ({ ...state, isAuthenticated }));
  },
  setUserData(data: UserInfo) {
    set((state) => ({ ...state, currentUser: data }));
  },
  setToken(token: string) {
    set((state) => ({ ...state, token }));
  },
  clearUserData() {
    set((state) => ({ ...state, currentUser: null, token: null }));
  },
  setAvatarUrl: (avatarUrl: string) => {
    set((state) => ({ ...state, currentUser: { ...state.currentUser, avatar_url: avatarUrl } }));
  },
  setVisibleUsername: (visibleUsername: string) => {
    set((state) => ({
      ...state,
      currentUser: { ...state.currentUser, visible_username: visibleUsername },
    }));
  },
}));

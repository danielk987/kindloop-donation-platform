import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { disconnectWebSocket } from "../../hooks/useWebSocket";
import api from "../../lib/axios";

interface Role {
  key: string;
  name: string;
  _id?: string;
  description?: string;
  permissions?: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: {
    countryCode: string;
    number: string;
  };
  role: Role;
  language: string;
  status?: string;
  profileCompletionStatus?: string;
  profileImage?: string;
  createdAt?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  documents?: Array<{
    type: string;
    path: string;
    filename: string;
    uploadedAt: string;
    _id?: string;
  }>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  permissions: string[];
  isAuthenticated: boolean;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string,
    permissions?: string[]
  ) => void;
  setUser: (user: User) => void;
  setPermissions: (permissions: string[]) => void;
  clearAuth: () => void;
  hasPermission: (...requiredPermissions: string[]) => boolean;
  hasAllPermissions: (...requiredPermissions: string[]) => boolean;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken, permissions = []) =>
        set({
          user,
          accessToken,
          refreshToken,
          permissions,
          isAuthenticated: true,
        }),
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      clearAuth: () => {
        // Disconnect WebSocket before clearing auth
        disconnectWebSocket();
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          permissions: [],
          isAuthenticated: false,
        });
      },
      hasPermission: (...requiredPermissions) => {
        const { permissions } = get();
        return requiredPermissions.some((perm) => permissions.includes(perm));
      },
      hasAllPermissions: (...requiredPermissions) => {
        const { permissions } = get();
        return requiredPermissions.every((perm) => permissions.includes(perm));
      },
      refreshUser: async () => {
        try {
          const response = await api.get("/auth/me");
          const userData = response.data.data;
          if (userData) {
            const role = typeof userData.role === "string"
              ? { key: userData.role, name: userData.role }
              : userData.role;

            set({
              user: {
                id: userData._id || userData.id,
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone,
                role,
                language: userData.language,
                status: userData.status,
                profileCompletionStatus: userData.profileCompletionStatus,
                profileImage: userData.profileImage,
                address: userData.address,
                documents: userData.documents,
                createdAt: userData.createdAt,
              },
              permissions: userData.permissions || [],
            });
          }
        } catch (error) {
          console.error("Failed to refresh user:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persist tokens, user data, and permissions
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        permissions: state.permissions,
      }),
    }
  )
);

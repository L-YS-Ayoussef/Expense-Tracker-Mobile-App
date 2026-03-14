import { createContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import { setAuthToken } from "../util/api";
import {
  signup as signupRequest,
  login as loginRequest,
  refreshAccessToken,
  fetchCurrentUser,
} from "../util/auth";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const AuthContext = createContext({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  signup: async ({ full_name, email, password }) => {},
  login: async ({ email, password }) => {},
  logout: async () => {},
});

function AuthContextProvider({ children }) {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function saveSession(accessToken, newRefreshToken, currentUser) {
    setAuthToken(accessToken);

    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    setUser(currentUser);

    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(currentUser));
  }

  async function clearSession() {
    setAuthToken(null);

    setToken(null);
    setRefreshToken(null);
    setUser(null);

    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }

  async function restoreSession() {
    setIsLoading(true);

    try {
      const storedAccessToken =
        await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      const storedRefreshToken =
        await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

      if (!storedAccessToken || !storedRefreshToken) {
        await clearSession();
        return;
      }

      setAuthToken(storedAccessToken);

      try {
        const currentUser = await fetchCurrentUser();
        await saveSession(storedAccessToken, storedRefreshToken, currentUser);
      } catch (error) {
        if (error.response?.status === 401) {
          const newAccessToken = await refreshAccessToken(storedRefreshToken);
          setAuthToken(newAccessToken);

          const currentUser = await fetchCurrentUser();
          await saveSession(newAccessToken, storedRefreshToken, currentUser);
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.log(
        "RESTORE SESSION ERROR:",
        error.response?.data || error.message || error,
      );
      await clearSession();
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(userData) {
    const result = await signupRequest(userData);
    await saveSession(result.accessToken, result.refreshToken, result.user);
  }

  async function login(credentials) {
    const result = await loginRequest(credentials);
    await saveSession(result.accessToken, result.refreshToken, result.user);
  }

  async function logout() {
    await clearSession();
  }

  const value = {
    token,
    user,
    isAuthenticated: !!token,
    isLoading,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContextProvider;

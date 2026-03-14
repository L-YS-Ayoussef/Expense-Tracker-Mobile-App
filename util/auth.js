import { api } from "./api";

function normalizeAuthResponse(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    user: data.user,
  };
}

export async function signup(userData) {
  const response = await api.post("/auth/register", userData);
  return normalizeAuthResponse(response.data);
}

export async function login(credentials) {
  const response = await api.post("/auth/login", credentials);
  return normalizeAuthResponse(response.data);
}

export async function refreshAccessToken(refreshToken) {
  const response = await api.post(
    "/auth/refresh",
    {},
    {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    },
  );

  return response.data.access_token;
}

export async function fetchCurrentUser() {
  const response = await api.get("/auth/me");
  return response.data.user;
}

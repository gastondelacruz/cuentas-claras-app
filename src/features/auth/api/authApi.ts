import { client } from "../../../shared/api/client";
import { parseOrThrow } from "../../../shared/api/errors";
import { clearRefreshToken, getRefreshToken } from "../../../shared/api/tokenStorage";
import { authMeSummarySchema, AuthMeSummaryDto } from "../schemas/authSummarySchema";

export type AuthResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
};

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/auth/login", { email, password });
  return response.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
}

export async function logoutUser(): Promise<void> {
  const refreshToken = await getRefreshToken();

  await client.post("/auth/logout", { refreshToken });
  await clearRefreshToken();
}

export async function getMeSummary(): Promise<AuthMeSummaryDto> {
  const response = await client.get<{ data: AuthMeSummaryDto }>("/me/summary");
  return parseOrThrow(authMeSummarySchema, response.data.data);
}

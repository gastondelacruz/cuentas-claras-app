import { client } from "../../../shared/api/client";

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
  const response = await client.post<AuthResponse>("/v1/auth/login", { email, password });
  return response.data;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>("/v1/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
}

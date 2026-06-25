import { client } from "../../../shared/api/client";

export type LoginResponse = {
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
): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>("/v1/auth/login", { email, password });
  return response.data;
}

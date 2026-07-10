import { client } from "../../../shared/api/client";
import { parseOrThrow } from "../../../shared/api/errors";
import {
	clearRefreshToken,
	getRefreshToken,
} from "../../../shared/api/tokenStorage";
import {
	accountSummarySchema,
	AccountSummaryDto,
} from "../../account/schemas/accountSummarySchema";
import {
	emailVerificationStatusSchema,
	EmailVerificationStatusDto,
} from "../schemas/emailVerificationSchema";

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

export type AuthRefreshResponse = {
	data: {
		accessToken: string;
		refreshToken: string;
	};
};

export type EmailVerificationStatus = EmailVerificationStatusDto;

export async function loginUser(
	email: string,
	password: string,
): Promise<AuthResponse> {
	const response = await client.post<AuthResponse>("/auth/login", {
		email,
		password,
	});
	return response.data;
}

export async function loginWithGoogle(idToken: string): Promise<AuthResponse> {
	const response = await client.post<AuthResponse>("/auth/google", {
		idToken,
	});
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

export async function refreshAuthSession(
	refreshToken: string,
): Promise<AuthRefreshResponse> {
	const response = await client.post<AuthRefreshResponse>("/auth/refresh", {
		refreshToken,
	});
	return response.data;
}

export async function logoutUser(): Promise<void> {
	const refreshToken = await getRefreshToken();
	if (refreshToken) {
		await client.post("/auth/logout", { refreshToken });
	}
	await clearRefreshToken();
}

export async function getMeSummary(): Promise<AccountSummaryDto> {
	const response = await client.get<{ data: AccountSummaryDto }>("/me/summary");
	return parseOrThrow(accountSummarySchema, response.data.data);
}

export async function getEmailVerificationStatus(): Promise<EmailVerificationStatus> {
	const response = await client.get<{ data: EmailVerificationStatus }>(
		"/auth/email-verification/status",
	);
	return parseOrThrow(emailVerificationStatusSchema, response.data.data);
}

export async function resendEmailVerification(): Promise<void> {
	await client.post("/auth/email-verification/resend");
}

export async function verifyEmail(token: string): Promise<void> {
	await client.post("/auth/email-verification/verify", { token });
}

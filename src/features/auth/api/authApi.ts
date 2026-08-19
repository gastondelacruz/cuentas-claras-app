import axios from "axios";

export type EmailVerificationErrorKind = "connection" | "invalid";

export function getEmailVerificationErrorKind(
	error: unknown,
): EmailVerificationErrorKind {
	if (error && typeof error === "object" && "response" in error) {
		return "invalid";
	}

	return "connection";
}

export type PasswordResetErrorCode =
	| "PASSWORD_RESET_TOKEN_INVALID"
	| "PASSWORD_RESET_TOKEN_EXPIRED"
	| "PASSWORD_RESET_TOKEN_CONSUMED"
	| "PASSWORD_RESET_CONNECTION";

export function getPasswordResetErrorCode(
	error: unknown,
): PasswordResetErrorCode {
	if (!axios.isAxiosError(error)) return "PASSWORD_RESET_CONNECTION";
	if (!error.response) return "PASSWORD_RESET_CONNECTION";
	const data = error.response.data as Record<string, unknown> | undefined;
	const nested = data?.error as Record<string, unknown> | undefined;
	const dataNested = data?.data as Record<string, unknown> | undefined;
	const code = data?.code ?? nested?.code ?? dataNested?.code;
	return code === "PASSWORD_RESET_TOKEN_EXPIRED" ||
		code === "PASSWORD_RESET_TOKEN_CONSUMED"
		? code
		: "PASSWORD_RESET_TOKEN_INVALID";
}

import { client } from "../../../shared/api/client";
import { parseOrThrow } from "../../../shared/api/errors";
import {
	clearBiometricEnabled,
	clearRefreshToken,
	clearUserMetadata,
	getRefreshToken,
	getUserMetadata,
	setRefreshToken,
	setUserMetadata,
} from "../../../shared/api/tokenStorage";
import { useAuthStore } from "../../../shared/store/authStore";
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

type RefreshResponse = {
	data: {
		accessToken: string;
		refreshToken: string;
		user?: AuthResponse["data"]["user"];
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

export async function refreshSession(): Promise<void> {
	const refreshToken = await getRefreshToken();
	if (!refreshToken) throw new Error("Refresh token is missing");

	try {
		const response = await client.post<RefreshResponse>("/auth/refresh", {
			refreshToken,
		});
		const {
			accessToken,
			refreshToken: rotatedRefreshToken,
			user,
		} = response.data.data;
		if (useAuthStore.getState().isLogoutInProgress) {
			throw new Error("Session restore cancelled by logout");
		}
		await setRefreshToken(rotatedRefreshToken);
		const currentUser =
			user ?? useAuthStore.getState().user ?? (await getUserMetadata());
		if (!currentUser) throw new Error("Session user is missing");
		await setUserMetadata(currentUser);
		useAuthStore.getState().setSession(currentUser, accessToken);
	} catch (error) {
		if (
			axios.isAxiosError(error) &&
			[401, 403].includes(error.response?.status ?? 0)
		) {
			await Promise.all([
				clearRefreshToken(),
				clearUserMetadata(),
				clearBiometricEnabled(),
			]);
			useAuthStore.getState().clearSession();
		}
		throw error;
	}
}

export async function logoutUser(): Promise<void> {
	const refreshToken = await getRefreshToken();
	try {
		await client.post("/auth/logout", { refreshToken });
	} finally {
		await Promise.all([
			clearRefreshToken(),
			clearBiometricEnabled(),
			clearUserMetadata(),
		]);
	}
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

export async function forgotPassword(email: string): Promise<void> {
	await client.post("/auth/password/forgot", { email });
}

export async function resetPassword(
	token: string,
	password: string,
): Promise<void> {
	await client.post("/auth/password/reset", { token, password });
}

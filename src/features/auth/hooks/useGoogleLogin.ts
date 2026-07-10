import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { AxiosError } from "axios";
import * as Google from "expo-auth-session/providers/google";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";

import { prefetchInitialAppData } from "../../../shared/api/prefetchInitialAppData";
import { setRefreshToken } from "../../../shared/api/tokenStorage";
import { useAuthStore } from "../../../shared/store/authStore";
import { loginWithGoogle } from "../api/authApi";
import { appendGoogleAuthFailureLog } from "../utils/googleAuthTelemetry";

type GoogleLoginErrorCode =
	| "GOOGLE_EMAIL_NOT_VERIFIED"
	| "GOOGLE_ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL"
	| "GOOGLE_ACCOUNT_LINK_CONFLICT"
	| "INVALID_GOOGLE_TOKEN"
	| "UNKNOWN";

function extractGoogleLoginErrorCode(error: unknown): GoogleLoginErrorCode {
	const axiosError = error as AxiosError<
		| {
				code?: string;
				errorCode?: string;
				error?: { code?: string };
		  }
		| unknown
	>;

	const rawCode =
		(typeof axiosError?.response?.data === "object" &&
		axiosError?.response?.data !== null
			? (
					axiosError.response.data as {
						code?: string;
						errorCode?: string;
						error?: { code?: string };
					}
				).code ||
				(
					axiosError.response.data as {
						code?: string;
						errorCode?: string;
						error?: { code?: string };
					}
				).errorCode ||
				(axiosError.response.data as { error?: { code?: string } }).error?.code
			: undefined) ?? undefined;

	if (rawCode === "GOOGLE_EMAIL_NOT_VERIFIED") return rawCode;
	if (rawCode === "GOOGLE_ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL") return rawCode;
	if (rawCode === "GOOGLE_ACCOUNT_LINK_CONFLICT") return rawCode;
	if (rawCode === "INVALID_GOOGLE_TOKEN") return rawCode;

	return "UNKNOWN";
}

function errorMessageByCode(code: GoogleLoginErrorCode): string {
	switch (code) {
		case "GOOGLE_EMAIL_NOT_VERIFIED":
			return "Pedimos verificar tu correo en Google para continuar.";
		case "GOOGLE_ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL":
		case "GOOGLE_ACCOUNT_LINK_CONFLICT":
			return "Ya existe una cuenta para ese correo. Iniciá sesión con email+password o verificá tu email.";
		case "INVALID_GOOGLE_TOKEN":
			return "El token de Google no es válido o expiró.";
		default:
			return "No pudimos iniciar sesión con Google. Intentá de nuevo.";
	}
}

function getGoogleClientId() {
	return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
}

export function useGoogleLogin() {
	const setSession = useAuthStore((state) => state.setSession);
	const androidClientId = getGoogleClientId();
	const isSupportedPlatform = Platform.OS === "android";
	let googleAuthRequestHookOutput: ReturnType<
		typeof Google.useAuthRequest
	> | null = null;
	let useAuthRequestError: unknown = null;

	try {
		googleAuthRequestHookOutput = Google.useAuthRequest({
			androidClientId,
			scopes: ["openid", "email", "profile"],
		});
	} catch (error) {
		useAuthRequestError = error;
	}

	const [request, response, promptAsync] = googleAuthRequestHookOutput ?? [
		null,
		null,
		undefined,
	];

	const canLoginWithGoogle =
		isSupportedPlatform &&
		Boolean(androidClientId) &&
		googleAuthRequestHookOutput !== null &&
		!useAuthRequestError;

	const googleLogin = useMutation({
		mutationFn: async ({ idToken }: { idToken: string }) => {
			return loginWithGoogle(idToken);
		},
		onSuccess: async (response) => {
			const { accessToken, refreshToken, user } = response.data;
			await setRefreshToken(refreshToken);
			setSession(user, accessToken);
			prefetchInitialAppData();
		},
		onError: async (error) => {
			const status = (error as AxiosError).response?.status;
			const code = extractGoogleLoginErrorCode(error);
			await appendGoogleAuthFailureLog({
				code,
				status,
				reason: code === "UNKNOWN" ? "UNHANDLED_ERROR" : code,
			});

			Toast.show({
				type: "error",
				text1: "Error al iniciar sesión con Google",
				text2: errorMessageByCode(code),
			});
		},
	});

	const handledResponse = useRef<unknown>(null);

	useEffect(() => {
		if (!response || handledResponse.current === response) return;
		handledResponse.current = response;

		if (response.type !== "success") {
			if (response.type !== "cancel" && response.type !== "dismiss") {
				void appendGoogleAuthFailureLog({ reason: "PROVIDER_ERROR" });
				Toast.show({
					type: "error",
					text1: "No se pudo iniciar sesión con Google",
					text2: "La autenticación no se completó correctamente.",
				});
			}
			return;
		}

		const idToken =
			response.authentication?.idToken ||
			(typeof response.params === "object"
				? (response.params as { id_token?: string }).id_token
				: undefined);

		if (!idToken) {
			void appendGoogleAuthFailureLog({ reason: "MISSING_ID_TOKEN" });
			Toast.show({
				type: "error",
				text1: "No se pudo iniciar sesión con Google",
				text2: "No se pudo obtener el token de Google.",
			});
			return;
		}

		googleLogin.mutate({ idToken });
	}, [response, googleLogin.mutate]);

	const startGoogleLogin = useCallback(async () => {
		if (!isSupportedPlatform) return;

		if (!canLoginWithGoogle || !request || !promptAsync) {
			if (useAuthRequestError) {
				await appendGoogleAuthFailureLog({
					reason: "UNCONFIGURED_AUTH_REQUEST",
				});
			}

			await appendGoogleAuthFailureLog({
				reason: canLoginWithGoogle
					? "MISSING_REQUEST"
					: "MISSING_GOOGLE_CLIENT_ID",
			});
			Toast.show({
				type: "error",
				text1: "Login con Google no configurado",
				text2: canLoginWithGoogle
					? "Reintentá en unos segundos."
					: "Configurá el cliente de Google en variables EXPO_PUBLIC_GOOGLE_*_CLIENT_ID.",
			});
			return;
		}

		try {
			await promptAsync();
		} catch {
			await appendGoogleAuthFailureLog({ reason: "PROMPT_FAILED" });
			Toast.show({
				type: "error",
				text1: "No se pudo iniciar sesión con Google",
				text2: "La autenticación no pudo iniciarse. Intentá de nuevo.",
			});
		}
	}, [
		canLoginWithGoogle,
		isSupportedPlatform,
		promptAsync,
		request,
		useAuthRequestError,
	]);

	return {
		startGoogleLogin,
		isPending: googleLogin.isPending,
		isReady: Boolean(request) && canLoginWithGoogle,
		isSupportedPlatform,
		response,
	};
}

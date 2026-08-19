import { useState } from "react";

import { resetPassword, getPasswordResetErrorCode } from "../api/authApi";
import {
	clearBiometricEnabled,
	clearRefreshToken,
	clearUserMetadata,
} from "../../../shared/api/tokenStorage";
import { queryClient } from "../../../shared/api/queryClient";
import { useAuthStore } from "../../../shared/store/authStore";
import {
	resetPasswordSchema,
	ResetPasswordFormValues,
} from "../schemas/resetPasswordSchema";

export function useResetPasswordForm(
	token: string | undefined,
	onSuccess: () => void,
) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof ResetPasswordFormValues, string>>
	>({});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [requestError, setRequestError] = useState<string | null>(null);

	function handlePasswordChange(value: string) {
		setPassword(value);
		setIsSubmitted(false);
		setErrors({});
	}

	function handleConfirmPasswordChange(value: string) {
		setConfirmPassword(value);
		setIsSubmitted(false);
		setErrors({});
	}

	async function handleSubmit() {
		const result = resetPasswordSchema.safeParse({ password, confirmPassword });
		if (!result.success) {
			setIsSubmitted(false);
			const fields = result.error.flatten().fieldErrors;
			setErrors({
				password: fields.password?.[0],
				confirmPassword: fields.confirmPassword?.[0],
			});
			return;
		}
		setErrors({});
		setRequestError(null);
		if (!token) {
			setRequestError("El enlace de recuperación no es válido.");
			return;
		}
		setIsPending(true);
		try {
			await resetPassword(token, result.data.password);
			try {
				await Promise.all([
					clearRefreshToken(),
					clearBiometricEnabled(),
					clearUserMetadata(),
				]);
			} catch {
				// The password was already reset; local cleanup must not report a token error.
			}
			queryClient.clear();
			setIsSubmitted(true);
			onSuccess();
			useAuthStore.getState().clearSession();
		} catch (error) {
			const code = getPasswordResetErrorCode(error);
			setRequestError(
				code === "PASSWORD_RESET_CONNECTION"
					? "No pudimos conectar con el servidor. Revisá tu conexión e intentá nuevamente."
					: code === "PASSWORD_RESET_TOKEN_EXPIRED"
						? "El enlace de recuperación venció."
						: code === "PASSWORD_RESET_TOKEN_CONSUMED"
							? "El enlace de recuperación ya fue utilizado."
							: "El enlace de recuperación no es válido.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return {
		password,
		setPassword: handlePasswordChange,
		confirmPassword,
		setConfirmPassword: handleConfirmPasswordChange,
		showPassword,
		setShowPassword,
		showConfirmPassword,
		setShowConfirmPassword,
		errors,
		isSubmitted,
		isPending,
		requestError,
		handleSubmit,
	};
}

import { useEffect, useState } from "react";
import axios from "axios";

import { forgotPassword } from "../api/authApi";
import {
	forgotPasswordSchema,
	ForgotPasswordFormValues,
} from "../schemas/forgotPasswordSchema";

const COOLDOWN_SECONDS = 30;

export function useForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [errors, setErrors] = useState<
		Partial<Record<keyof ForgotPasswordFormValues, string>>
	>({});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isPending, setIsPending] = useState(false);
	const [requestError, setRequestError] = useState<string | null>(null);
	const [cooldownSeconds, setCooldownSeconds] = useState(0);

	useEffect(() => {
		if (cooldownSeconds <= 0) return;

		const timer = setInterval(() => {
			setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
		}, 1000);

		return () => clearInterval(timer);
	}, [cooldownSeconds]);

	function handleEmailChange(value: string) {
		setEmail(value);
		setIsSubmitted(false);
		setRequestError(null);
		setErrors({});
	}

	async function handleSubmit() {
		if (isPending || cooldownSeconds > 0) return;

		const result = forgotPasswordSchema.safeParse({ email });
		if (!result.success) {
			setIsSubmitted(false);
			setErrors({ email: result.error.flatten().fieldErrors.email?.[0] });
			return;
		}
		setErrors({});
		setIsSubmitted(false);
		setRequestError(null);
		setIsPending(true);
		try {
			await forgotPassword(result.data.email);
			setIsSubmitted(true);
			setCooldownSeconds(COOLDOWN_SECONDS);
		} catch (error) {
			if (__DEV__) {
				console.error("[forgot-password] request failed", {
					url: axios.isAxiosError(error) ? error.config?.url : undefined,
					status: axios.isAxiosError(error)
						? error.response?.status
						: undefined,
					response: axios.isAxiosError(error)
						? error.response?.data
						: undefined,
					message: error instanceof Error ? error.message : String(error),
				});
			}
			setRequestError("No pudimos procesar la solicitud. Intentá nuevamente.");
		} finally {
			setIsPending(false);
		}
	}

	return {
		email,
		setEmail: handleEmailChange,
		errors,
		isSubmitted,
		isPending,
		cooldownSeconds,
		requestError,
		handleSubmit,
	};
}

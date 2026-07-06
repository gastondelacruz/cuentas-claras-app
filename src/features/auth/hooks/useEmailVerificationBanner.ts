import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";

import { resendEmailVerification } from "../api/authApi";

const RESEND_COOLDOWN_MS = 30_000;

export function useEmailVerificationBanner() {
	const [isResending, setIsResending] = useState(false);
	const [isCooldownActive, setIsCooldownActive] = useState(false);
	const cooldownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (cooldownTimeoutRef.current) {
				clearTimeout(cooldownTimeoutRef.current);
			}
		};
	}, []);

	async function handleResend() {
		if (isResending || isCooldownActive) return;

		setIsResending(true);
		setIsCooldownActive(true);
		cooldownTimeoutRef.current = setTimeout(() => {
			setIsCooldownActive(false);
			cooldownTimeoutRef.current = null;
		}, RESEND_COOLDOWN_MS);

		try {
			await resendEmailVerification();
			Toast.show({
				type: "success",
				text1: "Email reenviado",
				text2: "Revisá tu casilla de correo.",
			});
		} catch {
			Toast.show({
				type: "error",
				text1: "No pudimos reenviar el email",
				text2: "Intentá nuevamente en unos minutos.",
			});
		} finally {
			setIsResending(false);
		}
	}

	return {
		isResendDisabled: isResending || isCooldownActive,
		handleResend,
	};
}

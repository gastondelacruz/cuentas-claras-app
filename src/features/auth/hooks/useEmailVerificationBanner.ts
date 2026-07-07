import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";

import { resendEmailVerification } from "../api/authApi";

const RESEND_COOLDOWN_SECONDS = 30;
const RESEND_COOLDOWN_MS = RESEND_COOLDOWN_SECONDS * 1_000;

let resendCooldownEndsAt = 0;

function getRemainingCooldownSeconds() {
	return Math.max(Math.ceil((resendCooldownEndsAt - Date.now()) / 1_000), 0);
}

export function __resetEmailVerificationResendCooldownForTests() {
	resendCooldownEndsAt = 0;
}

export function useEmailVerificationBanner() {
	const [isResending, setIsResending] = useState(false);
	const [remainingCooldownSeconds, setRemainingCooldownSeconds] = useState(
		getRemainingCooldownSeconds,
	);
	const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
		null,
	);
	const isMountedRef = useRef(true);
	const isResendLockedRef = useRef(false);

	function clearCooldownTimer() {
		if (cooldownIntervalRef.current) {
			clearInterval(cooldownIntervalRef.current);
			cooldownIntervalRef.current = null;
		}
	}

	function startCooldownTicker() {
		clearCooldownTimer();

		cooldownIntervalRef.current = setInterval(() => {
			const nextRemainingSeconds = getRemainingCooldownSeconds();
			setRemainingCooldownSeconds(nextRemainingSeconds);

			if (nextRemainingSeconds === 0) {
				clearCooldownTimer();
				isResendLockedRef.current = false;
			}
		}, 1_000);
	}

	function startCooldown() {
		resendCooldownEndsAt = Date.now() + RESEND_COOLDOWN_MS;
		isResendLockedRef.current = true;
		setRemainingCooldownSeconds(RESEND_COOLDOWN_SECONDS);
		startCooldownTicker();
	}

	useEffect(() => {
		if (getRemainingCooldownSeconds() > 0) {
			startCooldownTicker();
		}

		return () => {
			isMountedRef.current = false;
			clearCooldownTimer();
		};
	}, []);

	const isCooldownActive = remainingCooldownSeconds > 0;
	const resendButtonLabel = isCooldownActive
		? `Reenviar en ${remainingCooldownSeconds}s`
		: "Reenviar";

	async function handleResend() {
		if (
			isResending ||
			isCooldownActive ||
			isResendLockedRef.current ||
			getRemainingCooldownSeconds() > 0
		)
			return;

		setIsResending(true);
		startCooldown();

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
			if (isMountedRef.current) {
				setIsResending(false);
			}
		}
	}

	return {
		isResendDisabled: isResending || isCooldownActive,
		resendButtonLabel,
		handleResend,
	};
}

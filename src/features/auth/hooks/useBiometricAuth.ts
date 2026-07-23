import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import { refreshSession } from "../api/authApi";
import { useAuthStore } from "../../../shared/store/authStore";
import {
	clearBiometricEnabled,
	getBiometricEnabled,
	setBiometricEnabled,
} from "../../../shared/api/tokenStorage";

export type BiometricMessage =
	| "hardware-unavailable"
	| "not-enrolled"
	| "cancelled"
	| "failed"
	| "refresh-failed";

const messages: Record<BiometricMessage, string> = {
	"hardware-unavailable": "Tu dispositivo no admite desbloqueo biométrico.",
	"not-enrolled": "No hay biometría configurada en este dispositivo.",
	cancelled: "Autenticación cancelada.",
	failed: "No pudimos validar tu identidad.",
	"refresh-failed": "Tu sesión venció. Iniciá sesión con tu contraseña.",
};

async function authenticate(): Promise<
	{ ok: true } | { ok: false; message: BiometricMessage }
> {
	try {
		if (!(await LocalAuthentication.hasHardwareAsync())) {
			return { ok: false, message: "hardware-unavailable" };
		}
		if (!(await LocalAuthentication.isEnrolledAsync())) {
			return { ok: false, message: "not-enrolled" };
		}

		const result = await LocalAuthentication.authenticateAsync({
			promptMessage: "Confirmá tu identidad para continuar",
			cancelLabel: "Cancelar",
			disableDeviceFallback: true,
		});
		return result.success
			? { ok: true }
			: {
					ok: false,
					message: result.error === "user_cancel" ? "cancelled" : "failed",
				};
	} catch {
		return { ok: false, message: "failed" };
	}
}

function showBiometricError(message: BiometricMessage) {
	Toast.show({
		type: "error",
		text1: "Desbloqueo biométrico",
		text2: messages[message],
	});
}

export function useBiometricAuth() {
	const [enabled, setEnabled] = useState(false);
	const [isAvailable, setIsAvailable] = useState(false);
	const [isPending, setIsPending] = useState(false);

	useEffect(() => {
		let mounted = true;
		if (typeof getBiometricEnabled !== "function") return;
		void Promise.all([
			getBiometricEnabled(),
			LocalAuthentication.hasHardwareAsync(),
			LocalAuthentication.isEnrolledAsync(),
		])
			.then(([value, hardware, enrolled]) => {
				if (mounted) {
					setEnabled(value);
					setIsAvailable(value && hardware && enrolled);
				}
			})
			.catch(() => {
				if (mounted) setIsAvailable(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	const enable = useCallback(async () => {
		setIsPending(true);
		try {
			const result = await authenticate();
			if (!result.ok) {
				showBiometricError(result.message);
				return false;
			}
			await setBiometricEnabled(true);
			setEnabled(true);
			setIsAvailable(true);
			Toast.show({ type: "success", text1: "Desbloqueo biométrico activado" });
			return true;
		} finally {
			setIsPending(false);
		}
	}, []);

	const disable = useCallback(async () => {
		setIsPending(true);
		try {
			await clearBiometricEnabled();
			setEnabled(false);
			setIsAvailable(false);
			return true;
		} finally {
			setIsPending(false);
		}
	}, []);

	const unlock = useCallback(async () => {
		setIsPending(true);
		try {
			const result = await authenticate();
			if (!result.ok) {
				showBiometricError(result.message);
				return false;
			}
			try {
				await refreshSession();
				useAuthStore.getState().setBiometricUnlockRequired(false);
				useAuthStore.getState().setRestoringSession(false);
				return true;
			} catch {
				await clearBiometricEnabled();
				setEnabled(false);
				setIsAvailable(false);
				showBiometricError("refresh-failed");
				return false;
			}
		} finally {
			setIsPending(false);
		}
	}, []);

	return { enabled, isAvailable, isPending, enable, disable, unlock };
}

export async function biometricPreferenceEnabled() {
	return getBiometricEnabled();
}

export { authenticate as authenticateBiometric };

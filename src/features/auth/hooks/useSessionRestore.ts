import { useEffect } from "react";

import { refreshSession } from "../api/authApi";
import {
	getBiometricEnabled,
	getRefreshToken,
} from "../../../shared/api/tokenStorage";
import { useAuthStore } from "../../../shared/store/authStore";

export function useSessionRestore() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const setRestoringSession = useAuthStore(
		(state) => state.setRestoringSession,
	);
	const setBiometricUnlockRequired = useAuthStore(
		(state) => state.setBiometricUnlockRequired,
	);
	const isLogoutInProgress = useAuthStore((state) => state.isLogoutInProgress);

	useEffect(() => {
		if (isAuthenticated || isLogoutInProgress) {
			setRestoringSession(false);
			return;
		}

		let mounted = true;
		void (async () => {
			const [refreshToken, biometricEnabled] = await Promise.all([
				getRefreshToken(),
				getBiometricEnabled(),
			]);
			if (!mounted || useAuthStore.getState().isLogoutInProgress) return;
			if (!refreshToken) {
				setRestoringSession(false);
				return;
			}
			setRestoringSession(true);
			if (biometricEnabled) {
				setBiometricUnlockRequired(true);
				setRestoringSession(false);
				return;
			}

			try {
				await refreshSession();
				if (useAuthStore.getState().isLogoutInProgress) {
					useAuthStore.getState().clearSession();
				}
			} catch {
				// The API/client owns invalid-token cleanup; transient failures remain retryable.
			} finally {
				if (mounted) setRestoringSession(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [
		isAuthenticated,
		isLogoutInProgress,
		setBiometricUnlockRequired,
		setRestoringSession,
	]);
}

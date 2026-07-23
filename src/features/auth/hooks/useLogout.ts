import { useMutation } from "@tanstack/react-query";

import { logoutUser } from "../api/authApi";
import {
	clearBiometricEnabled,
	clearRefreshToken,
	clearUserMetadata,
} from "../../../shared/api/tokenStorage";
import { queryClient } from "../../../shared/api/queryClient";
import { useAuthStore } from "../../../shared/store/authStore";

export function useLogout() {
	return useMutation({
		mutationFn: logoutUser,
		onMutate: () => {
			useAuthStore.getState().beginLogout();
			useAuthStore.getState().clearSession();
		},
		onSettled: async () => {
			try {
				await Promise.all([
					clearRefreshToken(),
					clearBiometricEnabled(),
					clearUserMetadata(),
				]);
			} finally {
				useAuthStore.getState().endLogout();
				queryClient.clear();
			}
		},
	});
}

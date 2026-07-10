import { useMutation } from "@tanstack/react-query";

import { queryClient } from "../../../shared/api/queryClient";
import { useAuthStore } from "../../../shared/store/authStore";
import { logoutUser } from "../api/authApi";

export function useLogout() {
	return useMutation({
		mutationFn: logoutUser,
		onMutate: () => {
			useAuthStore.getState().clearSession();
		},
		onSettled: () => {
			queryClient.clear();
		},
	});
}

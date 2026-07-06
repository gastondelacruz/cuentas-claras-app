import { useAuthStore } from "../store/authStore";

export function useProtectedDataEnabled() {
	return useAuthStore((state) => state.isAuthenticated && state.emailVerified);
}

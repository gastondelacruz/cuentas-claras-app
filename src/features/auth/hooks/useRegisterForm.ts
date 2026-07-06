import { useState } from "react";
import Toast from "react-native-toast-message";

import { useAuthStore } from "../../../shared/store/authStore";
import { setRefreshToken } from "../../../shared/api/tokenStorage";
import { registerSchema, RegisterFormValues } from "../schemas/registerSchema";
import { useRegister } from "./useRegister";

export function useRegisterForm() {
	const setSession = useAuthStore((s) => s.setSession);
	const registerMutation = useRegister();

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof RegisterFormValues, string>>
	>({});

	function handleRegister() {
		const result = registerSchema.safeParse({
			name,
			email,
			password,
			confirmPassword,
		});
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			setErrors({
				name: fieldErrors.name?.[0],
				email: fieldErrors.email?.[0],
				password: fieldErrors.password?.[0],
				confirmPassword: fieldErrors.confirmPassword?.[0],
			});
			return;
		}
		setErrors({});
		registerMutation.mutate(
			{ name, email, password },
			{
				onSuccess: async (response) => {
					const { accessToken, refreshToken, user } = response.data;
					await setRefreshToken(refreshToken);
					setSession(user, accessToken);
				},
				onError: () => {
					Toast.show({
						type: "error",
						text1: "Error al registrarse",
						text2: "Verificá tus datos",
					});
				},
			},
		);
	}

	return {
		name,
		setName,
		email,
		setEmail,
		password,
		setPassword,
		confirmPassword,
		setConfirmPassword,
		showPassword,
		setShowPassword,
		errors,
		isPending: registerMutation.isPending,
		handleRegister,
	};
}

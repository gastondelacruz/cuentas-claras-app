import { useState } from "react";

import {
	resetPasswordSchema,
	ResetPasswordFormValues,
} from "../schemas/resetPasswordSchema";

export function useResetPasswordForm() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<
		Partial<Record<keyof ResetPasswordFormValues, string>>
	>({});
	const [isSubmitted, setIsSubmitted] = useState(false);

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

	function handleSubmit() {
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
		setIsSubmitted(true);
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
		handleSubmit,
	};
}

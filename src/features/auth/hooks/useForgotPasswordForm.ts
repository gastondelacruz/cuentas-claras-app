import { useState } from "react";

import {
	forgotPasswordSchema,
	ForgotPasswordFormValues,
} from "../schemas/forgotPasswordSchema";

export function useForgotPasswordForm() {
	const [email, setEmail] = useState("");
	const [errors, setErrors] = useState<
		Partial<Record<keyof ForgotPasswordFormValues, string>>
	>({});
	const [isSubmitted, setIsSubmitted] = useState(false);

	function handleEmailChange(value: string) {
		setEmail(value);
		setIsSubmitted(false);
		setErrors({});
	}

	function handleSubmit() {
		const result = forgotPasswordSchema.safeParse({ email });
		if (!result.success) {
			setIsSubmitted(false);
			setErrors({ email: result.error.flatten().fieldErrors.email?.[0] });
			return;
		}
		setErrors({});
		setIsSubmitted(true);
	}

	return {
		email,
		setEmail: handleEmailChange,
		errors,
		isSubmitted,
		handleSubmit,
	};
}

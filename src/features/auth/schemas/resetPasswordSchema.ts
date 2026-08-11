import { z } from "zod";

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres")
			.regex(/[A-Za-z]/, "Incluí al menos una letra")
			.regex(/[0-9]/, "Incluí al menos un número"),
		confirmPassword: z.string(),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "Las contraseñas no coinciden",
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

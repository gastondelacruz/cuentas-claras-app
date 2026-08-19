import { z } from "zod";

export const resetPasswordSchema = z
	.object({
		password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z.string(),
	})
	.refine((values) => values.password === values.confirmPassword, {
		path: ["confirmPassword"],
		message: "Las contraseñas no coinciden",
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

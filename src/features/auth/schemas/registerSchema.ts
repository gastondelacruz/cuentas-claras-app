import { z } from "zod";

export const registerSchema = z
	.object({
		name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
		email: z.string().email("Ingresá un email válido"),
		password: z
			.string()
			.min(8, "La contraseña debe tener al menos 8 caracteres"),
		confirmPassword: z.string().min(1, "Repetí la contraseña"),
	})
	.superRefine(({ password, confirmPassword }, ctx) => {
		if (password !== confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Las contraseñas no coinciden",
				path: ["confirmPassword"],
			});
		}
	});

export type RegisterFormValues = z.infer<typeof registerSchema>;

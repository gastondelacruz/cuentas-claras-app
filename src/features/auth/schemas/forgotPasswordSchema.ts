import { z } from "zod";

export const forgotPasswordSchema = z.object({
	email: z.string().email("Ingresá un email válido"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

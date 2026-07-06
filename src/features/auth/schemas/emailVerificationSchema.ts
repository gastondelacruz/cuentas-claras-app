import { z } from "zod";

const verifiedAtSchema = z
	.record(z.string(), z.unknown())
	.nullable()
	.default(null)
	.transform((verifiedAt) => {
		if (verifiedAt === null) return null;

		return JSON.stringify(verifiedAt);
	});

export const emailVerificationStatusSchema = z.object({
	verified: z.boolean(),
	verifiedAt: verifiedAtSchema,
});

export type EmailVerificationStatusDto = z.infer<
	typeof emailVerificationStatusSchema
>;

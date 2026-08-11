import { forgotPasswordSchema } from "../forgotPasswordSchema";
import { resetPasswordSchema } from "../resetPasswordSchema";

describe("password recovery schemas", () => {
	it("accepts a valid recovery email", () => {
		expect(
			forgotPasswordSchema.safeParse({ email: "user@example.com" }).success,
		).toBe(true);
	});

	it("rejects an invalid recovery email", () => {
		expect(
			forgotPasswordSchema.safeParse({ email: "not-an-email" }).success,
		).toBe(false);
	});

	it("requires a strong matching password", () => {
		expect(
			resetPasswordSchema.safeParse({
				password: "secure123",
				confirmPassword: "secure123",
			}).success,
		).toBe(true);
		expect(
			resetPasswordSchema.safeParse({
				password: "short",
				confirmPassword: "short",
			}).success,
		).toBe(false);
		expect(
			resetPasswordSchema.safeParse({
				password: "secure123",
				confirmPassword: "different123",
			}).success,
		).toBe(false);
	});
});

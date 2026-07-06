import { registerSchema } from "../registerSchema";

describe("registerSchema", () => {
	it("accepts valid registration data when both passwords match", () => {
		const result = registerSchema.safeParse({
			name: "Gastón",
			email: "gaston@example.com",
			password: "validpassword",
			confirmPassword: "validpassword",
		});
		expect(result.success).toBe(true);
	});

	it("rejects a name shorter than 2 characters", () => {
		const result = registerSchema.safeParse({
			name: "A",
			email: "gaston@example.com",
			password: "validpassword",
			confirmPassword: "validpassword",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.name).toContain(
				"El nombre debe tener al menos 2 caracteres",
			);
		}
	});

	it("rejects an empty name", () => {
		const result = registerSchema.safeParse({
			name: "",
			email: "gaston@example.com",
			password: "validpassword",
			confirmPassword: "validpassword",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.name).toContain(
				"El nombre debe tener al menos 2 caracteres",
			);
		}
	});

	it("rejects an invalid email", () => {
		const result = registerSchema.safeParse({
			name: "Gastón",
			email: "notanemail",
			password: "validpassword",
			confirmPassword: "validpassword",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.email).toContain(
				"Ingresá un email válido",
			);
		}
	});

	it("rejects a password shorter than 8 characters", () => {
		const result = registerSchema.safeParse({
			name: "Gastón",
			email: "gaston@example.com",
			password: "short",
			confirmPassword: "short",
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.password).toContain(
				"La contraseña debe tener al menos 8 caracteres",
			);
		}
	});

	it("rejects registration data when password confirmation does not match", () => {
		const result = registerSchema.safeParse({
			name: "Gastón",
			email: "gaston@example.com",
			password: "validpassword",
			confirmPassword: "differentpassword",
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
				"Las contraseñas no coinciden",
			);
		}
	});
});

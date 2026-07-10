import appConfig from "../../../../app.json";
import { getStateFromCuentasClarasURL, linking } from "../linking";

describe("root deep-linking config", () => {
	it("registers the public and Android package Expo URL schemes", () => {
		expect(appConfig.expo.scheme).toEqual([
			"cuentasclaras",
			"com.cuentasclaras.app",
		]);
	});

	it("uses the custom scheme as the first supported prefix", () => {
		expect(linking.prefixes[0]).toBe("cuentasclaras://");
		expect(linking.prefixes).not.toContain("https://cuentasclaras.app");
	});

	it("parses email verification custom-scheme links with token params", () => {
		const state = getStateFromCuentasClarasURL(
			"cuentasclaras://verify-email?token=abc",
		);

		expect(state?.routes[0]).toEqual({
			name: "VerifyEmail",
			params: { token: "abc" },
			path: "verify-email?token=abc",
		});
	});

	it("parses group invitation custom-scheme links with token params", () => {
		const state = getStateFromCuentasClarasURL(
			"cuentasclaras://group-invitations/accept?token=abc",
		);

		expect(state?.routes[0]).toEqual({
			name: "AcceptGroupInvitation",
			params: { token: "abc" },
			path: "group-invitations/accept?token=abc",
		});
	});
});

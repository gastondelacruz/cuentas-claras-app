import appConfig from "../../../../app.json";
import { getStateFromCuentasClarasURL, linking } from "../linking";

describe("root deep-linking config", () => {
	it("registers the custom Expo URL scheme", () => {
		expect(appConfig.expo.scheme).toBe("cuentasclaras");
	});

	it("keeps the custom scheme and supports the verified HTTPS domain", () => {
		expect(linking.prefixes[0]).toBe("cuentasclaras://");
		expect(linking.prefixes).toContain("https://cuentas-claras-app.com");
	});

	it("parses HTTPS reset-password links with token params", () => {
		const state = getStateFromCuentasClarasURL(
			"https://cuentas-claras-app.com/reset-password?token=abc",
		);

		expect(state?.routes[0]).toEqual({
			name: "ResetPassword",
			params: { token: "abc" },
			path: "reset-password?token=abc",
		});
	});

	it("parses HTTPS email verification links with token params", () => {
		const state = getStateFromCuentasClarasURL(
			"https://cuentas-claras-app.com/verify-email?token=abc",
		);

		expect(state?.routes[0]).toEqual({
			name: "VerifyEmail",
			params: { token: "abc" },
			path: "verify-email?token=abc",
		});
	});

	it("still parses group invitation custom-scheme links with token params", () => {
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

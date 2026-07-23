import {
	clearRefreshToken,
	clearBiometricEnabled,
	clearUserMetadata,
	getBiometricEnabled,
	getUserMetadata,
	getRefreshToken,
	setBiometricEnabled,
	setRefreshToken,
	setUserMetadata,
} from "../tokenStorage";

describe("tokenStorage", () => {
	it("persists and clears auth user metadata through secure-store", async () => {
		const user = { id: "user-1", name: "Ana", email: "ana@example.com" };
		await setUserMetadata(user);
		await expect(getUserMetadata()).resolves.toEqual(user);

		await clearUserMetadata();
		await expect(getUserMetadata()).resolves.toBeNull();
	});

	it("persists and clears refresh token through secure-store", async () => {
		await setRefreshToken("tok-xyz");
		await expect(getRefreshToken()).resolves.toBe("tok-xyz");

		await clearRefreshToken();
		await expect(getRefreshToken()).resolves.toBeNull();
	});

	it("persists only the biometric-enabled preference through secure-store", async () => {
		await setBiometricEnabled(true);
		await expect(getBiometricEnabled()).resolves.toBe(true);

		await clearBiometricEnabled();
		await expect(getBiometricEnabled()).resolves.toBe(false);
	});
});

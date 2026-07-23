import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "refreshToken";
const BIOMETRIC_ENABLED_KEY = "biometricEnabled";
const AUTH_USER_METADATA_KEY = "authUserMetadata";

export type StoredAuthUser = {
	id: string;
	name?: string;
	email: string;
};

export function getRefreshToken(): Promise<string | null> {
	return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): Promise<void> {
	return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): Promise<void> {
	return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function getUserMetadata(): Promise<StoredAuthUser | null> {
	const value = await SecureStore.getItemAsync(AUTH_USER_METADATA_KEY);
	if (!value) return null;
	try {
		const parsed = JSON.parse(value) as Partial<StoredAuthUser>;
		if (typeof parsed.id !== "string" || typeof parsed.email !== "string")
			return null;
		return { id: parsed.id, name: parsed.name, email: parsed.email };
	} catch {
		return null;
	}
}

export function setUserMetadata(user: StoredAuthUser): Promise<void> {
	return SecureStore.setItemAsync(AUTH_USER_METADATA_KEY, JSON.stringify(user));
}

export function clearUserMetadata(): Promise<void> {
	return SecureStore.deleteItemAsync(AUTH_USER_METADATA_KEY);
}

export async function getBiometricEnabled(): Promise<boolean> {
	return (await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY)) === "true";
}

export function setBiometricEnabled(enabled: boolean): Promise<void> {
	return SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, String(enabled));
}

export async function clearBiometricEnabled(): Promise<void> {
	await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
}

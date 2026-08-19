import { getStateFromPath } from "@react-navigation/native";
import type { LinkingOptions } from "@react-navigation/native";

import type { RootStackParamList } from "./types";

const CUSTOM_SCHEME_PREFIX = "cuentasclaras://";
const HTTPS_PREFIX = "https://cuentas-claras-app.com/";

export const linkingConfig = {
	screens: {
		ResetPassword: "reset-password",
		VerifyEmail: "verify-email",
		AcceptGroupInvitation: "group-invitations/accept",
	},
} satisfies NonNullable<LinkingOptions<RootStackParamList>["config"]>;

export function getPathFromCuentasClarasURL(url: string) {
	if (url.startsWith(CUSTOM_SCHEME_PREFIX)) {
		return url.slice(CUSTOM_SCHEME_PREFIX.length);
	}

	if (url.startsWith(HTTPS_PREFIX)) {
		return url.slice(HTTPS_PREFIX.length);
	}

	return url;
}

export function getStateFromCuentasClarasURL(url: string) {
	return getStateFromPath(getPathFromCuentasClarasURL(url), linkingConfig);
}

export const linking = {
	prefixes: [CUSTOM_SCHEME_PREFIX, "https://cuentas-claras-app.com"],
	config: linkingConfig,
	getStateFromPath: (path, options) =>
		getStateFromPath(getPathFromCuentasClarasURL(path), options),
} satisfies LinkingOptions<RootStackParamList>;

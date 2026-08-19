import type { ConfigContext, ExpoConfig } from "expo/config";

import packageJson from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig =>
	({
		...config,
		plugins: [...(config.plugins ?? []), "expo-status-bar"],
		version: packageJson.version,
		extra: {
			...config.extra,
			apiUrl: process.env.EXPO_PUBLIC_API_URL,
		},
		ios: {
			...config.ios,
			infoPlist: {
				...config.ios?.infoPlist,
				NSFaceIDUsageDescription:
					"Usamos Face ID para desbloquear tu sesión de forma segura.",
			},
		},
	}) as ExpoConfig;

import type { ConfigContext, ExpoConfig } from "expo/config";

import packageJson from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig =>
	({
		...config,
		version: packageJson.version,
		ios: {
			...config.ios,
			infoPlist: {
				...config.ios?.infoPlist,
				NSFaceIDUsageDescription:
					"Usamos Face ID para desbloquear tu sesión de forma segura.",
			},
		},
	}) as ExpoConfig;

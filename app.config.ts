import type { ConfigContext, ExpoConfig } from "expo/config";

import packageJson from "./package.json";

export default ({ config }: ConfigContext): ExpoConfig =>
	({
		...config,
		version: packageJson.version,
	}) as ExpoConfig;

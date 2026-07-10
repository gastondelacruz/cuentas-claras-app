import type { ConfigContext, ExpoConfig } from "expo/config";

import appJson from "../../../app.json";
import easJson from "../../../eas.json";
import packageJson from "../../../package.json";
import appConfig from "../../../app.config";
import { validateReleaseTag } from "../../../scripts/validate-release-tag";

type DynamicAppConfig = (context: ConfigContext) => ExpoConfig;

const releaseConfig = (appConfig as unknown as DynamicAppConfig)({
	config: appJson.expo as ExpoConfig,
} as ConfigContext);

describe("release configuration", () => {
	it("preserves app.json configuration while overriding the public version", () => {
		expect(releaseConfig.slug).toBe(appJson.expo.slug);
		expect(releaseConfig.version).toBe(packageJson.version);
	});

	it("assigns each build profile to its explicit EAS environment without embedding the public API URL", () => {
		const buildProfiles = easJson.build as Record<
			string,
			{ environment?: string; env?: Record<string, string> }
		>;

		expect(buildProfiles.development.environment).toBe("development");
		expect(buildProfiles.preview.environment).toBe("preview");
		expect(buildProfiles["release-apk"].environment).toBe("production");
		expect(buildProfiles.production.environment).toBe("production");

		for (const profile of Object.values(buildProfiles)) {
			expect(profile.env?.EXPO_PUBLIC_API_URL).toBeUndefined();
		}
	});

	it("accepts only the matching semantic version tag", () => {
		expect(() => validateReleaseTag(`v${packageJson.version}`)).not.toThrow();
		expect(() => validateReleaseTag("v0.0.0")).toThrow(
			`Release tag v0.0.0 does not match package version ${packageJson.version}.`,
		);
	});
});

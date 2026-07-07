import appConfig from "../../../app.json";
// @ts-expect-error Node types are intentionally not installed in this Expo app.
import * as fs from "fs";
// @ts-expect-error Node types are intentionally not installed in this Expo app.
import * as path from "path";

declare const process: { cwd(): string };

type SplashPlatformConfig = {
	backgroundColor: string;
	image: string;
	imageWidth?: number;
	resizeMode?: string;
};

type SplashPluginConfig = {
	android: SplashPlatformConfig;
	ios: SplashPlatformConfig;
};

type SplashPlugin = ["expo-splash-screen", SplashPluginConfig];

function readPngDimensions(relativePath: string) {
	const imageBuffer = fs.readFileSync(
		path.resolve(process.cwd(), relativePath),
	);
	return {
		width: imageBuffer.readUInt32BE(16),
		height: imageBuffer.readUInt32BE(20),
	};
}

describe("native app asset config", () => {
	const splashPlugin = (appConfig.expo.plugins as unknown[]).find(
		(plugin): plugin is SplashPlugin =>
			Array.isArray(plugin) && plugin[0] === "expo-splash-screen",
	);

	it("configures Android splash with the recommended icon-style asset", () => {
		expect(splashPlugin?.[1].android).toEqual({
			backgroundColor: "#ffffff",
			image: "./assets/icon.png",
			imageWidth: 200,
		});
		expect(readPngDimensions("./assets/icon.png")).toEqual({
			width: 1024,
			height: 1024,
		});
	});

	it("keeps the full-screen artwork for iOS cover-mode splash rendering", () => {
		expect(splashPlugin?.[1].ios).toEqual({
			backgroundColor: "#ffffff",
			image: "./assets/screen.png",
			resizeMode: "cover",
		});
		expect(
			fs.existsSync(path.resolve(process.cwd(), "./assets/screen.png")),
		).toBe(true);
		expect(readPngDimensions("./assets/screen.png")).toEqual({
			width: 1143,
			height: 2048,
		});
	});

	it("configures the installed app icon from a square high-resolution asset", () => {
		expect(appConfig.expo.icon).toBe("./assets/icon.png");
		expect(
			fs.existsSync(path.resolve(process.cwd(), appConfig.expo.icon)),
		).toBe(true);
		expect(readPngDimensions("./assets/icon.png")).toEqual({
			width: 1024,
			height: 1024,
		});
	});
});

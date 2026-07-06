import appConfig from "../../../app.json";
// @ts-expect-error Node types are intentionally not installed in this Expo app.
import * as fs from "fs";
// @ts-expect-error Node types are intentionally not installed in this Expo app.
import * as path from "path";

declare const process: { cwd(): string };

type SplashPluginConfig = {
	backgroundColor: string;
	image: string;
	resizeMode: string;
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

	it("configures expo-splash-screen with the provided full-screen artwork", () => {
		expect(splashPlugin?.[1]).toEqual({
			backgroundColor: "#ffffff",
			image: "./assets/splash-screen.png",
			resizeMode: "cover",
		});
		expect(
			fs.existsSync(path.resolve(process.cwd(), "./assets/splash-screen.png")),
		).toBe(true);
		expect(readPngDimensions("./assets/splash-screen.png")).toEqual({
			width: 768,
			height: 1376,
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

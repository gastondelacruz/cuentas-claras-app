import appConfig from '../../../app.json';
// @ts-expect-error Node types are intentionally not installed in this Expo app.
import * as fs from 'fs';
// @ts-expect-error Node types are intentionally not installed in this Expo app.
import * as path from 'path';

declare const process: { cwd(): string };

type SplashPluginConfig = {
  backgroundColor: string;
  image: string;
  resizeMode: string;
};

type SplashPlugin = ['expo-splash-screen', SplashPluginConfig];

describe('native splash screen config', () => {
  const splashPlugin = (appConfig.expo.plugins as unknown[]).find(
    (plugin): plugin is SplashPlugin => Array.isArray(plugin) && plugin[0] === 'expo-splash-screen',
  );

  it('configures expo-splash-screen with the full-screen Stitch artwork', () => {
    expect(splashPlugin).toBeDefined();
    expect(splashPlugin?.[1]).toEqual({
      backgroundColor: '#ffffff',
      image: './assets/splash-screen.png',
      resizeMode: 'cover',
    });
  });

  it('keeps the configured splash asset in the app assets folder', () => {
    const splashImage = splashPlugin?.[1].image;

    expect(splashImage).toBe('./assets/splash-screen.png');
    expect(fs.existsSync(path.resolve(process.cwd(), splashImage as string))).toBe(true);
  });

  it('uses the Stitch mobile screen dimensions for the splash artwork', () => {
    const splashImage = splashPlugin?.[1].image;
    const imageBuffer = fs.readFileSync(path.resolve(process.cwd(), splashImage as string));

    expect(imageBuffer.readUInt32BE(16)).toBe(768);
    expect(imageBuffer.readUInt32BE(20)).toBe(1376);
  });
});

module.exports = {
	preset: "jest-expo",
	setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
	testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
	testPathIgnorePatterns: ["/node_modules/", "/openspec/"],
	transformIgnorePatterns: [
		"node_modules/(?!((jest-)?react-native|@react-native|expo|expo-modules-core|@expo/.*|@expo-google-fonts/.*|@react-navigation/.*|expo-local-authentication|react-native-reanimated|react-native-safe-area-context|react-native-gesture-handler|nativewind|react-native-css-interop|lucide-react-native)/)",
	],
};

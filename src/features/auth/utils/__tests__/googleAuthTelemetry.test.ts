import * as SecureStore from "expo-secure-store";

import {
	appendGoogleAuthFailureLog,
	configureGoogleAuthFailureReporter,
} from "../googleAuthTelemetry";

jest.mock("expo-secure-store", () => ({
	getItemAsync: jest.fn(async () => null),
	setItemAsync: jest.fn(async () => undefined),
}));

const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockSetItemAsync = jest.mocked(SecureStore.setItemAsync);

describe("googleAuthTelemetry", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		configureGoogleAuthFailureReporter(null);
		mockGetItemAsync.mockResolvedValue(null);
	});

	it("reports an allowlisted structured event without tokens or PII", async () => {
		const reporter = jest.fn(async () => undefined);
		configureGoogleAuthFailureReporter(reporter);

		await appendGoogleAuthFailureLog({
			code: "INVALID_GOOGLE_TOKEN",
			status: 401,
			reason: "INVALID_GOOGLE_TOKEN",
			message: "secret-token user@example.com",
		} as never);

		expect(reporter).toHaveBeenCalledWith({
			provider: "google",
			code: "INVALID_GOOGLE_TOKEN",
			status: 401,
			reason: "INVALID_GOOGLE_TOKEN",
			timestamp: expect.any(String),
		});
		expect(mockSetItemAsync).not.toHaveBeenCalled();
	});

	it("persists a bounded local fallback when no reporter is configured", async () => {
		await appendGoogleAuthFailureLog({ reason: "PROMPT_FAILED" });

		expect(mockSetItemAsync).toHaveBeenCalledWith(
			"google-auth-failures",
			expect.any(String),
		);
		const stored = JSON.parse(mockSetItemAsync.mock.calls[0][1]);
		expect(stored).toEqual([
			expect.objectContaining({
				provider: "google",
				reason: "PROMPT_FAILED",
				timestamp: expect.any(String),
			}),
		]);
	});

	it("falls back to local persistence when the reporter fails", async () => {
		configureGoogleAuthFailureReporter(
			jest.fn(async () => {
				throw new Error("reporter unavailable");
			}),
		);

		await appendGoogleAuthFailureLog({ reason: "MISSING_ID_TOKEN" });

		expect(mockSetItemAsync).toHaveBeenCalledTimes(1);
	});
});

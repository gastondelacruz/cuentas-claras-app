import { client } from "../../../shared/api/client";
import {
	getEmailVerificationStatus,
	getMeSummary,
	resendEmailVerification,
	verifyEmail,
} from "../api/authApi";

jest.mock("../../../shared/api/client", () => ({
	client: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = jest.mocked(client.get);
const mockPost = jest.mocked(client.post);

describe("authApi.getMeSummary", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("calls GET /me/summary and returns parsed data", async () => {
		const data = {
			totalGroups: 12,
			totalExpenses: 2,
			totalsByCurrency: [
				{
					currency: "ARS",
					totalPaid: 57660,
					totalOwed: 1200,
					totalToReceive: 28830,
				},
			],
			activeSince: "2026-06-27T12:15:29.827Z",
		};
		mockGet.mockResolvedValueOnce({ data: { data } });

		const result = await getMeSummary();

		expect(mockGet).toHaveBeenCalledWith("/me/summary");
		expect(result).toEqual(data);
	});

	it("throws when the response does not match the contract", async () => {
		mockGet.mockResolvedValueOnce({ data: { data: { totalGroups: 12 } } });

		await expect(getMeSummary()).rejects.toThrow(
			"API response does not match contract",
		);
	});
});

describe("authApi.emailVerification", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("calls GET /auth/email-verification/status and returns nullable verifiedAt", async () => {
		mockGet.mockResolvedValueOnce({
			data: { data: { verified: false, verifiedAt: null } },
		});

		const result = await getEmailVerificationStatus();

		expect(mockGet).toHaveBeenCalledWith("/auth/email-verification/status");
		expect(result).toEqual({ verified: false, verifiedAt: null });
	});

	it("defaults missing verifiedAt to null because the API contract does not require it", async () => {
		mockGet.mockResolvedValueOnce({ data: { data: { verified: false } } });

		await expect(getEmailVerificationStatus()).resolves.toEqual({
			verified: false,
			verifiedAt: null,
		});
	});

	it("normalizes object verifiedAt values accepted by the API contract", async () => {
		mockGet.mockResolvedValueOnce({
			data: {
				data: {
					verified: true,
					verifiedAt: { iso: "2026-07-05T10:00:00.000Z" },
				},
			},
		});

		await expect(getEmailVerificationStatus()).resolves.toEqual({
			verified: true,
			verifiedAt: JSON.stringify({ iso: "2026-07-05T10:00:00.000Z" }),
		});
	});

	it("throws when the email verification status response does not match the contract", async () => {
		mockGet.mockResolvedValueOnce({
			data: { data: { verified: "yes", verifiedAt: null } },
		});

		await expect(getEmailVerificationStatus()).rejects.toThrow(
			"API response does not match contract",
		);
	});

	it("throws when verifiedAt is not an object or null", async () => {
		mockGet.mockResolvedValueOnce({
			data: {
				data: { verified: true, verifiedAt: "2026-07-05T10:00:00.000Z" },
			},
		});

		await expect(getEmailVerificationStatus()).rejects.toThrow(
			"API response does not match contract",
		);
	});

	it("posts the verification token and expects no response body", async () => {
		mockPost.mockResolvedValueOnce({ status: 204 });

		await verifyEmail("verify-token");

		expect(mockPost).toHaveBeenCalledWith("/auth/email-verification/verify", {
			token: "verify-token",
		});
	});

	it("posts resend with no body and expects no response body", async () => {
		mockPost.mockResolvedValueOnce({ status: 204 });

		await resendEmailVerification();

		expect(mockPost).toHaveBeenCalledWith("/auth/email-verification/resend");
	});
});

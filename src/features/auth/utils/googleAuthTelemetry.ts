import * as SecureStore from "expo-secure-store";

export type GoogleAuthFailureEntry = {
	code?: string;
	status?: number;
	reason?: string;
	provider: "google";
	timestamp: string;
};

type GoogleAuthFailureInput = Pick<
	GoogleAuthFailureEntry,
	"code" | "status" | "reason"
>;
type GoogleAuthFailureReporter = (
	entry: GoogleAuthFailureEntry,
) => void | Promise<void>;

const GOOGLE_AUTH_FAILURE_LOG_KEY = "google-auth-failures";
const MAX_FAILURE_LOG_ENTRIES = 20;

let googleAuthFailureReporter: GoogleAuthFailureReporter | null = null;

export function configureGoogleAuthFailureReporter(
	reporter: GoogleAuthFailureReporter | null,
): void {
	googleAuthFailureReporter = reporter;
}

function createFailureEntry(
	entry: GoogleAuthFailureInput,
): GoogleAuthFailureEntry {
	return {
		...(typeof entry.code === "string" ? { code: entry.code } : {}),
		...(typeof entry.status === "number" ? { status: entry.status } : {}),
		...(typeof entry.reason === "string" ? { reason: entry.reason } : {}),
		provider: "google",
		timestamp: new Date().toISOString(),
	};
}

async function persistFailureEntry(entry: GoogleAuthFailureEntry): Promise<void> {
	try {
		const existingRaw = await SecureStore.getItemAsync(
			GOOGLE_AUTH_FAILURE_LOG_KEY,
		);
		let existing: GoogleAuthFailureEntry[] = [];

		if (existingRaw) {
			try {
				const parsed: unknown = JSON.parse(existingRaw);
				if (Array.isArray(parsed)) {
					existing = parsed as GoogleAuthFailureEntry[];
				}
			} catch {
				// Replace unreadable local telemetry with the next valid event.
			}
		}

		const next = [...existing, entry].slice(-MAX_FAILURE_LOG_ENTRIES);
		await SecureStore.setItemAsync(
			GOOGLE_AUTH_FAILURE_LOG_KEY,
			JSON.stringify(next),
		);
	} catch {
		// Authentication must remain non-blocking when local persistence fails.
	}
}

export async function appendGoogleAuthFailureLog(
	entry: GoogleAuthFailureInput,
): Promise<void> {
	const failureEntry = createFailureEntry(entry);

	if (googleAuthFailureReporter) {
		try {
			await googleAuthFailureReporter(failureEntry);
			return;
		} catch {
			// Fall through to bounded local persistence when reporting is unavailable.
		}
	}

	await persistFailureEntry(failureEntry);
}

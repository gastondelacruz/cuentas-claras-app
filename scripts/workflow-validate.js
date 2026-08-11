const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const requiredArtifacts = ["proposal.md", "design.md", "tasks.md"];

function classifyChangedPaths(changedPaths) {
	const categories = new Set();

	for (const changedPath of changedPaths) {
		const normalizedPath = changedPath.replaceAll("\\", "/");
		if (/^\.github\/workflows\//.test(normalizedPath)) categories.add("ci");
		if (
			/^(package\.json|pnpm-lock\.yaml|package-lock\.json|yarn\.lock|npm-shrinkwrap\.json)$/.test(
				normalizedPath,
			)
		) {
			categories.add("dependencies");
		}
		if (/(^|\/)(migrations?|database\/migrations?)\//i.test(normalizedPath))
			categories.add("migrations");
		if (
			/^(src|scripts|android|ios)\//.test(normalizedPath) ||
			/^(app\.json|eas\.json|babel\.config\.[jt]s|metro\.config\.[jt]s|tailwind\.config\.[jt]s|tsconfig\.json)$/.test(
				normalizedPath,
			)
		) {
			categories.add("application");
		}
	}

	const documentationOnly = changedPaths.length > 0 && categories.size === 0;
	return {
		documentationOnly,
		relevant: categories.size > 0,
		categories: [...categories].sort(),
	};
}

function findValidOpenSpecChanges(openSpecChanges) {
	return Object.entries(openSpecChanges)
		.filter(
			([name, files]) =>
				name !== "archive" &&
				requiredArtifacts.every((artifact) => files.includes(artifact)),
		)
		.map(([name]) => name)
		.sort();
}

function formatIncompleteChanges(openSpecChanges) {
	return Object.entries(openSpecChanges)
		.filter(
			([name, files]) =>
				name !== "archive" &&
				!requiredArtifacts.every((artifact) => files.includes(artifact)),
		)
		.map(([name, files]) => {
			const missing = requiredArtifacts.filter(
				(artifact) => !files.includes(artifact),
			);
			return `${name} (missing ${missing.join(", ")})`;
		})
		.sort()
		.join("; ");
}

function validateWorkflow({ changedPaths, openSpecChanges = {} }) {
	const classification = classifyChangedPaths(changedPaths);
	if (!classification.relevant) {
		return { ok: true, errors: [], relevant: false };
	}

	const validChanges = findValidOpenSpecChanges(openSpecChanges);
	if (validChanges.length > 0) {
		return { ok: true, errors: [], relevant: true };
	}

	const incomplete = formatIncompleteChanges(openSpecChanges);
	const errors = incomplete
		? [`Active OpenSpec changes are incomplete: ${incomplete}.`]
		: [
				"Relevant changes require an active OpenSpec change with proposal.md, design.md, and tasks.md.",
			];
	return { ok: false, errors, relevant: true };
}

function readOpenSpecChanges(openSpecRoot) {
	if (!fs.existsSync(openSpecRoot)) return {};

	const changes = {};
	for (const entry of fs.readdirSync(openSpecRoot, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const changePath = path.join(openSpecRoot, entry.name);
		changes[entry.name] = fs
			.readdirSync(changePath, { withFileTypes: true })
			.filter((item) => item.isFile())
			.map((item) => item.name);
	}
	return changes;
}

function readChangedPaths(base) {
	const range = base ? [`${base}...HEAD`] : ["HEAD^", "HEAD"];
	return execFileSync("git", ["diff", "--name-only", ...range], {
		cwd: rootDir,
		encoding: "utf8",
	})
		.split("\n")
		.map((file) => file.trim())
		.filter(Boolean);
}

function main() {
	const baseArgument = process.argv.find((argument) =>
		argument.startsWith("--base="),
	);
	const base = baseArgument
		? baseArgument.slice("--base=".length)
		: process.env.GITHUB_BASE_REF;
	const changedPaths = readChangedPaths(base);
	const openSpecChanges = readOpenSpecChanges(
		path.join(rootDir, "openspec", "changes"),
	);
	const result = validateWorkflow({ changedPaths, openSpecChanges });

	if (result.ok) {
		console.log(
			result.relevant
				? `Workflow validation passed (${result.categories?.join(", ") ?? "relevant change"}).`
				: "Workflow validation passed (documentation-only change).",
		);
		return;
	}

	console.error("Workflow validation failed:");
	for (const error of result.errors) console.error(`- ${error}`);
	console.error(
		"Create or complete an artifact set under openspec/changes/<change-name>/.",
	);
	process.exitCode = 1;
}

if (require.main === module) main();

module.exports = {
	classifyChangedPaths,
	findValidOpenSpecChanges,
	readOpenSpecChanges,
	validateWorkflow,
};

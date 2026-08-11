const {
	classifyChangedPaths,
	findValidOpenSpecChanges,
	validateWorkflow,
} = require("./workflow-validate");

describe("workflow validator", () => {
	test("allows documentation-only changes without an OpenSpec change", () => {
		expect(
			validateWorkflow({
				changedPaths: ["docs/development-workflow.md"],
				openSpecRoot: "openspec/changes",
			}),
		).toEqual({
			ok: true,
			errors: [],
			relevant: false,
		});
	});

	test("requires an OpenSpec change for application changes", () => {
		const result = validateWorkflow({
			changedPaths: ["src/features/groups/screens/GroupsListScreen.tsx"],
			openSpecRoot: "openspec/changes",
			openSpecChanges: {},
		});

		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"Relevant changes require an active OpenSpec change with proposal.md, design.md, and tasks.md.",
		);
	});

	test("accepts a complete active OpenSpec change", () => {
		const result = validateWorkflow({
			changedPaths: ["package.json"],
			openSpecRoot: "openspec/changes",
			openSpecChanges: {
				"workflow-adoption": ["proposal.md", "design.md", "tasks.md"],
			},
		});

		expect(result).toEqual({ ok: true, errors: [], relevant: true });
	});

	test("reports incomplete OpenSpec artifacts", () => {
		const result = validateWorkflow({
			changedPaths: [".github/workflows/ci.yml"],
			openSpecRoot: "openspec/changes",
			openSpecChanges: { "workflow-adoption": ["proposal.md", "tasks.md"] },
		});

		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"Active OpenSpec changes are incomplete: workflow-adoption (missing design.md).",
		);
	});

	test("classifies dependency, CI, migration, and documentation paths", () => {
		expect(
			classifyChangedPaths([
				"package.json",
				"pnpm-lock.yaml",
				".github/workflows/ci.yml",
				"db/migrations/001-init.sql",
				"README.md",
			]),
		).toEqual({
			documentationOnly: false,
			relevant: true,
			categories: ["ci", "dependencies", "migrations"],
		});
	});

	test("ignores archived OpenSpec changes when finding active changes", () => {
		expect(
			findValidOpenSpecChanges({
				archive: ["proposal.md", "design.md", "tasks.md"],
				current: ["proposal.md", "design.md", "tasks.md"],
			}),
		).toEqual(["current"]);
	});
});

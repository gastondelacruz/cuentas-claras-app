const packageJson = require("../package.json");

function validateReleaseTag(tag, version = packageJson.version) {
	const expectedTag = `v${version}`;

	if (tag !== expectedTag) {
		throw new Error(
			`Release tag ${tag} does not match package version ${version}.`,
		);
	}
}

if (require.main === module) {
	validateReleaseTag(process.argv[2]);
}

module.exports = { validateReleaseTag };

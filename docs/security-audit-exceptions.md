# Security audit exceptions

## `image-size` — CVE-2025-71329 and CVE-2025-71330

- **Status:** temporary exception.
- **Dependency path:** `expo > @expo/metro > metro > image-size@1.2.1`.
- **Reason:** `pnpm audit` reports no patched version for these advisories (`patched versions: <0.0.0`). The package is used by the Expo/Metro build toolchain and is not imported by the application runtime.
- **Mitigation:** keep Expo and its Metro toolchain updated; rerun the audit after every Expo upgrade and before releases.
- **Exit condition:** remove both `--ignore` flags from `package.json` as soon as Expo/Metro ships a version that removes the vulnerable dependency or an audited patched version becomes available.

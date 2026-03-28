## What's New
- Restore missing npm metadata (license, author, repository, homepage, keywords) lost during v0.16 refactoring
- Fix GitHub Releases showing empty release notes — now uses RELEASE_NOTES.md as body

## Details
- `package.json`: Added `license`, `author`, `repository`, `homepage`, `bugs`, `keywords` fields
- `.github/workflows/release.yml`: Use `body_path: RELEASE_NOTES.md` instead of auto-generated notes

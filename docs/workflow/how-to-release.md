# How to Release

Guide for publishing `@pointclick/engine-core` and `@pointclick/engine-renderer-r3f` to npm.

**Versioning strategy**: lockstep (both packages share the same version number during v0.x).

---

## Pre-release checklist

- [ ] `main` branch is up to date and clean (`git status`)
- [ ] All tests pass: `npm run test`
- [ ] All linters pass: `npm run lint`
- [ ] Build is clean: `npm run build`
- [ ] Demo builds and runs: `npm run dev` + manual smoke at `http://localhost:3000`
- [ ] CHANGELOG entries written under the new version in each package
- [ ] No `WIP`, `TODO` left as undocumented items in `publicApi.ts`
- [ ] npm account logged in with access to `@pointclick` scope: `npm whoami`

---

## Release a new version (e.g., v0.1.0)

```bash
# 1. Bump versions (lockstep, no auto git tag)
npm version 0.1.0 --workspace packages/engine-core --no-git-tag-version
npm version 0.1.0 --workspace packages/engine-renderer-r3f --no-git-tag-version

# 2. Update CHANGELOG entries in both packages:
#    Replace "## [Unreleased]" with "## [0.1.0] — YYYY-MM-DD"

# 3. Run full gate one last time
npm run build
npm run test
npm run lint

# 4. Commit and tag
git add -A
git commit -m "chore(release): v0.1.0"
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin main --tags

# 5. Publish
npm publish --workspace packages/engine-core --access public
npm publish --workspace packages/engine-renderer-r3f --access public

# 6. Verify publication
npm view @pointclick/engine-core@0.1.0
npm view @pointclick/engine-renderer-r3f@0.1.0
```

---

## Rollback a broken version

```bash
# Deprecate (preferred over unpublish — npm deletes history after 72h)
npm deprecate @pointclick/engine-core@0.1.0 "broken: use 0.1.1 instead"
npm deprecate @pointclick/engine-renderer-r3f@0.1.0 "broken: use 0.1.1 instead"

# Then publish a fix as 0.1.1
```

---

## If `npm publish` fails

| Error | Fix |
|-------|-----|
| `E403 Forbidden` | Scope `@pointclick` not yet created as org on npmjs.com. Go to npmjs.com → Create Organization → `pointclick`. Then retry. |
| `EOTP` (2FA required) | Add `--otp=<your-2fa-code>` to the publish command. |
| `E409 Conflict` | Version already published. Bump version first. |

---

## Notes

- **Don't `npm unpublish`** unless within the 72-hour window and no consumers exist.
- **Patch releases** (0.1.x) fix bugs without API changes — no migration guide needed.
- **Minor releases** (0.x.0) may add new exports — update CHANGELOG and README.
- **Breaking changes** require a `0.x.0 → 0.x+1.0` bump, a migration guide, and an issue on GitHub.
- See ADR-0007 (`docs/decisions/0007-release-strategy.md`) for the full versioning strategy.

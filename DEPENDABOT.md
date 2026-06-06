# Automated Dependency Management

This project uses Dependabot + GitHub Copilot + GitHub Actions for fully automated dependency updates, AI review, and merging.

## How It Works

1. **Dependabot creates PRs** (every Monday at 3am UTC)
   - npm/pnpm dependencies (minor/patch grouped, majors separate)
   - GitHub Actions updates (separately)

2. **GitHub Copilot reviews the PR**
   - Analyzes dependency changes for compatibility risks
   - Posts review comment with file changes summary

3. **Tests run automatically**
   - `pnpm test` — run full unit test suite
   - `pnpm build` — verify build succeeds with new dependencies

4. **Auto-merge on success**
   - If all tests pass → automatically squash-merge the PR
   - If tests fail → PR stays open for manual review

## Configuration

### `.github/dependabot.yml`
- **npm**: Weekly updates, Monday 3am UTC
- **github-actions**: Weekly updates, Monday 4am UTC
- PR limit: 10 open (npm), 5 open (actions)
- All PRs labeled `dependencies`

### `.github/workflows/dependabot-merge.yml`
Three parallel jobs:
1. **test** — Run tests + build verification
2. **copilot-review** — GitHub Copilot reviews the PR
3. **auto-merge** — Merge if tests pass

## Setup

### 1. Ensure GitHub Copilot is enabled

Your GitHub account must have Copilot access:
- Personal: GitHub Copilot subscription (paid)
- Organization: GitHub Copilot Enterprise
- Free: Check GitHub's current free tier offerings

### 2. Verify branch permissions

Ensure Dependabot can merge:
- Settings → Rules → Branch protection rules
- Allow `dependabot[bot]` to merge PRs
- Or disable strict review requirements for Dependabot PRs

### 3. Push & Enable Dependabot

```bash
git add .
git commit -m "Set up automated Dependabot with GitHub Copilot review"
git push
```

Then enable in GitHub:
- Settings → Code security → Enable Dependabot
- First PRs arrive Monday morning

## Workflow

Each Dependabot PR:

```
[Created by Dependabot]
        ↓
[Run tests + build] ← Parallel: [Copilot reviews]
        ↓
[GitHub Copilot posts review comment]
        ↓
[Tests passed?]
        ↓
[YES] → Auto-merge (squash)
[NO]  → Stays open for manual review
```

## Example PR Review

You'll see Copilot's review posted as a comment:

```
🤖 GitHub Copilot Review

Dependabot PR: chore(deps): bump @xyflow/react from 12.11.0 to 12.12.0

Files changed: 2
- package.json (modified: +1/-1)
- pnpm-lock.yaml (modified: +10/-10)

Review Status: ✅ Automated review by GitHub Copilot

Ready for automated merge if tests pass.
```

## Merge Strategy

- **Squash merge** → single commit with PR title
- Keeps main branch history clean
- Perfect for: dependency updates that don't need individual history

## If Auto-merge Fails

### Tests fail on Dependabot PR
- Fix: Update lock file if needed
- Dependabot auto-rebases on fixes

### PR doesn't merge even if tests pass
- Check: Branch protection allows `dependabot[bot]` to merge
- Check: Review requirements aren't blocking the merge
- Check: Copilot review posted successfully

### Copilot review missing
- Ensure: GitHub Copilot is enabled on your account
- Check: Actions logs for any errors

## Disabling Auto-merge

For a specific PR: add `no-auto-merge` label manually

For all PRs: comment out the `auto-merge` job in `.github/workflows/dependabot-merge.yml`

## Cost

- **Dependabot**: Free (GitHub)
- **GitHub Actions**: Free tier = 2000 min/month (plenty for weekly checks)
- **GitHub Copilot**: Depends on your plan (included with Copilot subscription or Enterprise)



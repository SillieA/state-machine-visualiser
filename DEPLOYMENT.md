# Deployment Guide

## Static Export (Current)

This app builds as a fully static site — no server required.

### Build

```bash
pnpm install
pnpm build
```

Output: `out/` directory containing static HTML, CSS, JS, and assets.

### GitHub Pages (Automated)

1. **Automatic deployment via GitHub Actions**
   - Workflow: `.github/workflows/deploy.yml`
   - Triggers on: push to `main` branch
   - Builds and deploys to `gh-pages` branch automatically

2. **Configure repo settings**
   - Go to GitHub repo → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`
   - Save

3. **URL**
   - `https://SillieA.github.io/state-machine-visualiser/`
   - (Auto-configured by `basePath: "/state-machine-visualiser"` in next.config.ts)

### Manual Deploy to CDN

- **Cloudflare Pages**: Connect GitHub repo, set build command to `pnpm build`, build output `out`
- **Vercel Static**: Same as above
- **Netlify**: Same setup
- **S3 + CloudFront**: Upload `out/` contents

### Local Preview

```bash
pnpm start  # serves out/ on http://localhost:3000
```

## Future: Server-side Features

To add server-side functionality (e.g., GitHub API integration for loading JSMs):

1. Remove `output: "export"` and `basePath` from `next.config.ts`
2. Add API routes in `src/app/api/` as needed
3. Deploy to Node.js host (Vercel, Render, Railway, etc.) instead of static CDN
4. Update `.github/workflows/deploy.yml` to deploy to Node.js host instead of GitHub Pages

All existing client-side code remains unchanged — only add server handlers alongside.

## Requirements

- **Node.js**: ≥24.0.0
- **pnpm**: ≥8.0.0 (enforced by `packageManager` field in package.json)

See `package.json` `engines` field for version constraints.


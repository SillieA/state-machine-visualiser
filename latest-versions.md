# Latest Versions and Best Practices

## Node.js
- Current LTS: **v24** (Hydrogen)
- Release cycle: 6-month Current phase, then 30-month LTS support
- Latest stable: v26 (Current)

## GitHub Actions
- setup-node action: **v4**
- Supports Node.js 24 LTS and latest versions
- Recommended to use `node-version: '24'` for LTS stability

## pnpm
- Current version: **11.5.2** (globally installed)
- Minimum Node.js requirement: v22
- Compatible with Node.js 24 and 26
- Should use `cache: 'pnpm'` with `cache-dependency-path: pnpm-lock.yaml`

## Key Recommendations
1. Use Node.js 24 LTS for stability and support
2. Leverage built-in caching in setup-node@v4
3. Always commit pnpm-lock.yaml for reproducible builds
4. Test with full pipeline: lint, test, build
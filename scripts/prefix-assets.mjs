#!/usr/bin/env node
/**
 * Post-build asset prefixer for the GitHub Pages subpath deployment.
 *
 * Next.js 16 (Turbopack) does not prefix public/ asset URLs with the
 * basePath in the static export, so on https://<user>.github.io/<repo>/ the
 * root-absolute public asset urls would 404. This script rewrites them in
 * the static export after the build. It only rewrites public asset paths —
 * Next.js-managed /_next/... urls already carry the basePath and are left
 * untouched (lookbehind below).
 *
 * Runs automatically in `npm run build:github` (NEXT_PUBLIC_ASSET_BASE set);
 * a plain `npm run build` (root deployment) skips the rewrite.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';

const basePath = process.env.NEXT_PUBLIC_ASSET_BASE;
if (!basePath) {
  console.log('prefix-assets: NEXT_PUBLIC_ASSET_BASE not set — skipping (root deployment)');
  process.exit(0);
}
const prefix = basePath.replace(/^\//, '');
// Rewrite any root-absolute public asset path; the lookbehind prevents
// double-prefixing urls that already carry the basePath or /_next/... urls.
const assetRe = /(?<![A-Za-z0-9_-])\/(fonts|images|cursors|icons|icon\.svg|manifest\.webmanifest|favicon\.ico)\b/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = `${dir}/${entry}`;
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(html|css)$/.test(entry)) out.push(path);
  }
  return out;
}

let changed = 0;
for (const file of walk('out')) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(assetRe, (match, asset) => `/${prefix}/${asset}`);
  if (after !== before) {
    writeFileSync(file, after);
    changed += 1;
  }
}
console.log(`prefix-assets: prefixed public asset urls in ${changed} file(s) with /${prefix}`);

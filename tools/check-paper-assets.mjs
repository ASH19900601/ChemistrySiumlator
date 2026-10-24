import { existsSync, readFileSync } from 'node:fs'
const source = readFileSync(new URL('../src/papers/archive-data.ts', import.meta.url), 'utf8')
const rows = JSON.parse(source.split(' = ')[1].replace(/ as const\s*$/, ''))
const missing = rows.flatMap(p => Object.values(p.assets).flatMap(a => [a.pdf, ...a.pages.map(p => p.path)])).filter(path => !existsSync(new URL(`../public/${path}`, import.meta.url)))
if (missing.length) console.warn(`Source build: ${missing.length} original-paper assets are absent. Core lab works; PDF/page views require restoring resources. See README. Use npm run build:full for a verified full-library build.`)
else console.log('Original-paper assets are present. npm run build:full additionally verifies PDF checksums.')

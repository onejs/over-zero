#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import fs from 'node:fs'

const args = process.argv.slice(2)

const dryRun = args.includes('--dry-run')
const skipBuild = args.includes('--skip-build')
const skipChecks = args.includes('--skip-checks')
const dirty = args.includes('--dirty')
const patch = args.includes('--patch')
const minor = args.includes('--minor')
const canary = args.includes('--canary')

const pkgPath = './package.json'
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
const curVersion = pkg.version

if (!patch && !minor && !canary) {
  console.error('Must specify --patch, --minor, or --canary')
  process.exit(1)
}

function run(cmd: string, opts?: { silent?: boolean }) {
  if (!opts?.silent) console.info(`$ ${cmd}`)
  try {
    return execSync(cmd, { stdio: opts?.silent ? 'pipe' : 'inherit', encoding: 'utf-8' })
  } catch (err) {
    process.exit(1)
  }
}

function getNextVersion(): string {
  if (canary) {
    return `${curVersion.replace(/-canary\.\d+$/, '')}-canary.${Date.now()}`
  }
  const [major, min, pat] = curVersion.replace(/-.*$/, '').split('.').map(Number)
  if (patch) return `${major}.${min}.${pat + 1}`
  if (minor) return `${major}.${min + 1}.0`
  return curVersion
}

const nextVersion = getNextVersion()

console.info(`\n🚀 Releasing ${pkg.name}`)
console.info(`   ${curVersion} → ${nextVersion}\n`)

// ensure on main and clean
const branch = run('git rev-parse --abbrev-ref HEAD', { silent: true })?.trim()
if (branch !== 'main' && !canary) {
  console.error('Not on main branch')
  process.exit(1)
}

if (!dirty) {
  const status = run('git status --porcelain', { silent: true })
  if (status?.trim()) {
    console.error('Working directory not clean')
    process.exit(1)
  }
  run('git pull --rebase origin main')
}

// checks
if (!skipChecks) {
  run('bun run typecheck')
}

// build
if (!skipBuild) {
  run('bun run clean')
  run('bun install')
  run('bun run build')

  if (!fs.existsSync('./dist')) {
    console.error('dist directory missing after build')
    process.exit(1)
  }
}

// update version
pkg.version = nextVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')

if (dryRun) {
  console.info('\n--dry-run: stopping before publish\n')
  // revert version change
  pkg.version = curVersion
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  process.exit(0)
}

// publish
const tag = canary ? '--tag canary' : ''
run(`npm publish ${tag}`)

// git commit and tag
const gitTag = `v${nextVersion}`
run('git add -A')
run(`git commit -m "${gitTag}"`)
if (!canary) {
  run(`git tag ${gitTag}`)
}
run('git pull --rebase origin main')
run('git push origin main')
if (!canary) {
  run(`git push origin ${gitTag}`)
}

console.info(`\n✅ Published ${pkg.name}@${nextVersion}\n`)

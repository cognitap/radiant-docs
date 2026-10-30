import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, realpathSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const [input] = process.argv.slice(2)
if (!input || process.argv.length > 3) {
  throw new Error('Usage: pnpm preview:local /path/to/radiant')
}
const checkout = path.resolve(input)
if (!existsSync(path.join(checkout, 'src/index.ts'))) {
  throw new Error(`${checkout} is not a Radiant checkout.`)
}

// The published package lives in pnpm's content-addressed store through hard links,
// so it is moved aside rather than overwritten, and moved back on exit.
const installed = realpathSync(path.join(root, 'node_modules/@cognitap/radiant'))
const published = `${installed}.published`
const restore = () => {
  if (!existsSync(published)) return
  rmSync(installed, { recursive: true, force: true })
  renameSync(published, installed)
}
restore()

mkdirSync(path.join(root, '.scratch'), { recursive: true })
const scratch = mkdtempSync(path.join(root, '.scratch', 'local-'))
const tarball = path.join(scratch, 'radiant.tgz')
execFileSync('pnpm', ['build'], { cwd: checkout, stdio: 'inherit' })
execFileSync('pnpm', ['pack', '--out', tarball], { cwd: checkout, stdio: 'inherit' })

const label =
  execFileSync('git', ['branch', '--show-current'], { cwd: checkout, encoding: 'utf8' }).trim() ||
  path.basename(checkout)

renameSync(installed, published)
try {
  mkdirSync(installed)
  execFileSync('tar', ['-xzf', tarball, '-C', installed, '--strip-components=1'])
} catch (error) {
  restore()
  throw error
}

const child = spawn('pnpm', ['dev'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, RADIANT_CANDIDATE: label }
})
const stop = signal => child.kill(signal)
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
child.once('exit', code => {
  restore()
  rmSync(scratch, { recursive: true, force: true })
  process.exit(code ?? 130)
})

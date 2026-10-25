import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const [input, option] = process.argv.slice(2)
if (!input || (option && option !== '--check') || process.argv.length > 4) {
  throw new Error('Usage: pnpm preview:candidate /absolute/path/radiant.tgz [--check]')
}
const tarball = path.resolve(input)
if (!tarball.endsWith('.tgz') || !(await stat(tarball)).isFile()) {
  throw new Error('Provide a Radiant package tarball produced by pnpm pack.')
}

const scratch = path.join(root, '.scratch')
await mkdir(scratch, { recursive: true })
const staging = await mkdtemp(path.join(scratch, 'candidate-'))
const excluded = new Set([
  '.git',
  '.next',
  '.source',
  '.scratch',
  'node_modules',
  'out',
  'output',
  'next-env.d.ts'
])
const env = {
  ...process.env,
  RADIANT_CANDIDATE: path.basename(tarball),
  NEXT_TELEMETRY_DISABLED: '1'
}
let child
let interrupted = false
const interrupt = signal => {
  interrupted = true
  child?.kill(signal)
}
const onInterrupt = () => interrupt('SIGINT')
const onTerminate = () => interrupt('SIGTERM')
process.on('SIGINT', onInterrupt)
process.on('SIGTERM', onTerminate)

async function run(args) {
  if (interrupted) throw new Error('Candidate preview interrupted.')
  await new Promise((resolve, reject) => {
    child = spawn('pnpm', args, { cwd: staging, env, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      child = undefined
      if (code === 0) resolve()
      else reject(new Error(`pnpm ${args.join(' ')} exited with ${signal ?? code}.`))
    })
  })
}

try {
  for (const entry of await readdir(root)) {
    await cp(path.join(root, entry), path.join(staging, entry), {
      recursive: true,
      filter: source =>
        !path
          .relative(root, source)
          .split(path.sep)
          .some(
            part => excluded.has(part) || part.startsWith('.env') || part.endsWith('.tsbuildinfo')
          )
    })
  }
  await cp(tarball, path.join(staging, 'radiant-candidate.tgz'))
  const manifestPath = path.join(staging, 'package.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  manifest.dependencies['@cognitap/radiant'] = 'file:./radiant-candidate.tgz'
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  console.log(`Candidate: ${tarball}\nIsolated checkout: ${staging}`)
  await run(['install', '--no-frozen-lockfile'])
  if (option === '--check') {
    await run(['typecheck'])
    await run(['test:workshop'])
    await run(['build'])
    await run(['test:smoke'])
  } else {
    await run(['build'])
    env.PORT = process.env.PORT ?? '3002'
    await run(['preview'])
  }
} catch (error) {
  if (!interrupted) throw error
  process.exitCode = 130
} finally {
  process.off('SIGINT', onInterrupt)
  process.off('SIGTERM', onTerminate)
  if (option === '--check') {
    const evidence = path.join(staging, 'output')
    if (await stat(evidence).catch(() => null))
      await cp(evidence, path.join(root, 'output', 'candidate'), { recursive: true })
  }
  await rm(staging, { recursive: true, force: true })
}

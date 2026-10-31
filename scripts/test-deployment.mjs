import { spawn } from 'node:child_process'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { url: { type: 'string' } }
})
const target = values.url ?? positionals[0]
if (!target) throw new Error('Usage: pnpm test:deployment https://<deployment>')

const child = spawn(process.execPath, ['--test', 'tests/site/navigation.test.ts'], {
  stdio: 'inherit',
  env: { ...process.env, DOCS_URL: target }
})
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})

import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { fileURLToPath } from 'node:url'
import { radiantPackage } from './radiant-package.mjs'

/** Production must be explicit; preview branch names can never target main. */
export function deploymentBranch({ production = false, branch }) {
  if (production) {
    if (branch && branch !== 'main') throw new Error('Production uses the main branch only.')
    return 'main'
  }
  if (!branch || branch === 'main' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(branch)) {
    throw new Error('Preview requires a non-main lowercase branch slug, for example pr-10.')
  }
  return branch
}

async function deploy() {
  const { values } = parseArgs({
    options: { production: { type: 'boolean' }, branch: { type: 'string' } }
  })
  const branch = deploymentBranch(values)
  const project = process.env.CLOUDFLARE_PAGES_PROJECT
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  assert.match(
    project ?? '',
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Set CLOUDFLARE_PAGES_PROJECT to a project slug.'
  )
  assert.match(
    account ?? '',
    /^[a-f0-9]{32}$/,
    'Set CLOUDFLARE_ACCOUNT_ID to the selected account ID.'
  )
  assert.ok(token, 'Set CLOUDFLARE_API_TOKEN with Cloudflare Pages Edit access to that account.')
  assert.equal(radiantPackage.candidate, '', 'Packed candidates cannot be deployed.')
  assert.equal(
    execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
    '',
    'Commit source changes before deploying.'
  )
  const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  if (values.production) {
    const main = execFileSync('git', ['ls-remote', '--exit-code', 'origin', 'refs/heads/main'], {
      encoding: 'utf8'
    })
      .trim()
      .split(/\s+/)[0]
    assert.equal(
      revision,
      main,
      'Production must deploy current origin/main; older runs cannot overwrite a newer release.'
    )
  }
  const bundle = JSON.parse(await readFile('out/deployment.json', 'utf8'))
  assert.equal(bundle.schemaVersion, 1)
  assert.equal(bundle.revision, revision, 'Build the current revision before deploying.')
  assert.equal(bundle.radiantVersion, radiantPackage.version)
  assert.equal(bundle.candidate, '')
  assert.equal(bundle.experimental, true)
  for (const file of ['index.html', '404.html', 'search-index.json'])
    await stat(path.join('out', file))
  assert.equal((await stat('out/_next/static')).isDirectory(), true)
  const registry = await fetch(
    `https://registry.npmjs.org/@cognitap%2fradiant/${radiantPackage.version}`,
    { signal: AbortSignal.timeout(30000) }
  )
  assert.equal(registry.status, 200, 'The documented Radiant version must be available from npm.')
  assert.equal((await registry.json()).version, radiantPackage.version)

  const api = 'https://api.cloudflare.com/client/v4'
  const projectPath = `/accounts/${account}/pages/projects/${project}`
  async function cloudflare(endpoint, { allowMissing = false, ...options } = {}) {
    const response = await fetch(`${api}${endpoint}`, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30000)
    })
    const body = await response.json()
    if (
      allowMissing &&
      response.status === 404 &&
      body.errors?.some(error => error.code === 8000007)
    )
      return null
    if (!response.ok || !body.success)
      throw new Error(
        `Cloudflare ${response.status}: ${body.errors?.map(error => error.message).join('; ') ?? 'Request failed'}`
      )
    return body.result
  }
  // Bootstrap only this named Pages project, without connecting a second build system.
  const existing = await cloudflare(projectPath, { allowMissing: true })
  const settings =
    existing ??
    (await cloudflare(`/accounts/${account}/pages/projects`, {
      method: 'POST',
      body: JSON.stringify({ name: project, production_branch: 'main' })
    }))
  assert.equal(settings.production_branch, 'main', 'The Pages production branch must be main.')
  assert.ok(
    !settings.source,
    'Use a Direct Upload project; do not combine CI with a second Git build pipeline.'
  )

  await mkdir('.wrangler', { recursive: true })
  const output = path.resolve('.wrangler/deploy-output.jsonl')
  await rm(output, { force: true })
  const result = spawnSync(
    'pnpm',
    [
      'exec',
      'wrangler',
      'pages',
      'deploy',
      'out',
      '--project-name',
      project,
      '--branch',
      branch,
      '--commit-hash',
      revision,
      '--commit-dirty=false'
    ],
    {
      stdio: 'inherit',
      env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_OUTPUT_FILE_PATH: output }
    }
  )
  assert.equal(result.status, 0, 'Pages upload failed.')
  const records = (await readFile(output, 'utf8'))
    .trim()
    .split('\n')
    .map(line => JSON.parse(line))
  const deployment = records.findLast(record => record.type === 'pages-deploy-detailed')
  assert.ok(deployment, 'Wrangler did not return deployment details.')
  assert.equal(deployment.environment, values.production ? 'production' : 'preview')
  assert.equal(deployment.deployment_trigger.metadata.commit_hash, revision)
  const url = new URL(deployment.url)
  assert.equal(url.protocol, 'https:')
  assert.ok(url.hostname.endsWith('.pages.dev'))
  await mkdir('output/deployment', { recursive: true })
  await writeFile(
    'output/deployment/deployment.json',
    `${JSON.stringify({ ...deployment, revision, radiantVersion: radiantPackage.version }, null, 2)}\n`
  )
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `url=${url.origin}\n`)
  if (process.env.GITHUB_STEP_SUMMARY)
    await appendFile(
      process.env.GITHUB_STEP_SUMMARY,
      `### Radiant documentation\n\n[${values.production ? 'Production' : 'Preview'} deployment](${url.origin}) · Radiant ${radiantPackage.version} · \`${revision}\`\n`
    )
  console.log(`Verify the uploaded site: pnpm test:deployment ${url.origin}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await deploy()

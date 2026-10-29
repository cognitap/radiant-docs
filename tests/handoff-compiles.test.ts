import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { handoffAPI } from '../examples/workshop/workshop-handoff.ts'
import { handoffFixture } from '../scripts/handoff-fixture.mjs'

const tsc = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url))

test('one fixture theme handoff typechecks against the installed package', async () => {
  await mkdir('output', { recursive: true })
  const directory = await mkdtemp(path.join('output', 'handoff-'))
  try {
    const { document } = handoffFixture()
    await writeFile(path.join(directory, 'radiant-theme.ts'), handoffAPI.typedTheme(document))
    await writeFile(
      path.join(directory, 'radiant-motion.ts'),
      handoffAPI.typedTheme(document, ['motion'])
    )
    await writeFile(path.join(directory, 'RadiantMotion.tsx'), handoffAPI.runtimeSetup().source)
    await writeFile(
      path.join(directory, 'styles.d.ts'),
      "declare module '@cognitap/radiant/styles.css'\n"
    )
    await writeFile(
      path.join(directory, 'tsconfig.json'),
      `${JSON.stringify(
        {
          compilerOptions: {
            target: 'ES2022',
            module: 'ESNext',
            moduleResolution: 'Bundler',
            jsx: 'react-jsx',
            strict: true,
            skipLibCheck: true,
            noEmit: true
          },
          files: ['radiant-theme.ts', 'radiant-motion.ts', 'RadiantMotion.tsx', 'styles.d.ts']
        },
        null,
        2
      )}\n`
    )
    execFileSync(process.execPath, [tsc, '-p', path.join(directory, 'tsconfig.json')], {
      stdio: 'inherit'
    })
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

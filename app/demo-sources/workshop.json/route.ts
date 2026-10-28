import { resolve } from 'node:path'
import { highlightSource } from '@/components/demo/highlight-source'
import { exampleSources } from '@/lib/demo-sources.mjs'

export const dynamic = 'force-static'

/** The workshop listing is megabytes of highlighted code, so it ships apart from the page. */
export async function GET() {
  const files = await exampleSources(resolve('examples'), 'workshop')
  return Response.json(await Promise.all(files.map(highlightSource)))
}

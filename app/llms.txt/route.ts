import { radiantCatalog, renderCatalogGuidance } from '@cognitap/radiant/catalog'

export const dynamic = 'force-static'

const summary =
  "Radiant's model-facing catalog: the components an agent can place on a generated UI surface. Entries are catalog components, not React exports. To render, validate and extend surfaces, read the [agent guide](/docs/agents/); for the React API, the [component guides](/docs/). React apps navigate with Link, not Button."

export function GET() {
  return new Response(
    renderCatalogGuidance(radiantCatalog, { title: 'Radiant agent catalog', summary }),
    { headers: { 'content-type': 'text/plain; charset=utf-8' } }
  )
}

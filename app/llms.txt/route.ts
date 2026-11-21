import { radiantCatalog, renderCatalogGuidance } from '@cognitap/radiant/catalog'

export const dynamic = 'force-static'

export function GET() {
  return new Response(renderCatalogGuidance(radiantCatalog, { title: 'Radiant' }), {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  })
}

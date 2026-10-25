import { execFileSync } from 'node:child_process'
import { radiantVersion, radiantCandidate } from '@/lib/radiant'

export const dynamic = 'force-static'

export function GET() {
  return Response.json({
    schemaVersion: 1,
    revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    radiantVersion,
    candidate: radiantCandidate,
    experimental: true
  })
}

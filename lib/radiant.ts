export const radiantVersion = process.env.NEXT_PUBLIC_RADIANT_VERSION
export const radiantCandidate = process.env.NEXT_PUBLIC_RADIANT_CANDIDATE
export const radiantLabel = radiantCandidate
  ? `Radiant ${radiantVersion} · Local candidate: ${radiantCandidate}`
  : `Radiant ${radiantVersion} · Experimental`

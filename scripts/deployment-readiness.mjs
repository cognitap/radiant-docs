import { setTimeout as delay } from 'node:timers/promises'

/** New Pages projects can report upload success before edge DNS/TLS is ready. */
export async function waitForDeployment(
  get,
  { timeoutMs = 180000, intervalMs = 2000, now = Date.now, sleep = delay } = {}
) {
  const deadline = now() + timeoutMs
  let lastError
  while (now() < deadline) {
    try {
      const response = await get(Math.max(1, deadline - now()))
      if (response.status() === 200) return response
      if (![404, 502, 503, 504].includes(response.status())) {
        throw new Error(`Deployment returned HTTP ${response.status()}.`)
      }
      lastError = new Error(`Deployment returned HTTP ${response.status()}.`)
    } catch (error) {
      if (
        !/EPROTO|ENOTFOUND|EAI_AGAIN|ECONNRESET|ETIMEDOUT|Timeout \d+ms exceeded/.test(
          String(error)
        )
      )
        throw error
      lastError = error
    }
    await sleep(Math.min(intervalMs, Math.max(0, deadline - now())))
  }
  throw new Error(`Deployment HTTPS did not become ready within ${timeoutMs}ms.`, {
    cause: lastError
  })
}

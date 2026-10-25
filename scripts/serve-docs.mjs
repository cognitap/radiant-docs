import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(fileURLToPath(new URL('../out/', import.meta.url)))
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

/** Serve the exported files without SPA fallback, so deep-link failures stay visible. */
export function createDocsServer() {
  return createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      let file = path.resolve(root, `.${pathname}`)
      if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end()
        return
      }
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
      const content = await readFile(file)
      response.writeHead(200, {
        'Content-Type': types[path.extname(file)] ?? 'application/octet-stream'
      })
      response.end(content)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
      response.end(await readFile(path.join(root, '404.html')).catch(() => 'Not found'))
    }
  })
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = createDocsServer()
  const port = Number(process.env.PORT ?? 3001)
  server.listen(port, '127.0.0.1', () => console.log(`Radiant docs: http://127.0.0.1:${port}`))
}

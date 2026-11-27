// Local static server for Featherbreak (Node 22 standard library only).
// Usage: node serve.ts [--port 8080]

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const GAME_ROOT = resolve(fileURLToPath(new URL('./game', import.meta.url)));

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.txt': 'text/plain; charset=utf-8',
};

function parsePort(argv: string[]): number {
  const idx = argv.indexOf('--port');
  const candidate = idx >= 0 ? Number(argv[idx + 1]) : 8080;
  return Number.isInteger(candidate) && candidate > 0 && candidate < 65536 ? candidate : 8080;
}

const port = parsePort(process.argv.slice(2));

createServer((req, res) => {
  let pathName: string;
  try {
    pathName = decodeURIComponent(new URL(req.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (pathName.endsWith('/')) pathName += 'index.html';
  const target = resolve(join(GAME_ROOT, normalize(pathName)));
  if (target !== GAME_ROOT && !target.startsWith(GAME_ROOT + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const info = statSync(target);
    if (!info.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'content-type': MIME_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-store',
    });
    createReadStream(target).pipe(res);
  } catch {
    res.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Featherbreak serving game/ at http://127.0.0.1:${port}`);
});

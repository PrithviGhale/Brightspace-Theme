import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function serve(port = 0) {
  const server = http.createServer(async (req, res) => {
    try {
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/') { res.writeHead(302, {Location:'/preview/index.html'}).end(); return; }
      if (pathname === '/popup-preview') {
        const html = await readFile(path.join(root, 'extension/popup.html'), 'utf8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(html.replace('<head>', '<head><base href="/extension/"><script src="/preview/storage-adapter.js"></script>'));
        return;
      }
      const target = path.resolve(root, '.' + pathname);
      if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
      const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json' };
      res.setHeader('Content-Type', `${types[path.extname(target)] || 'text/plain'}; charset=utf-8`);
      res.end(await readFile(target));
    } catch { res.writeHead(404).end('Not found'); }
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await serve(Number(process.argv[2] || 4173));
  console.log(`Preview: http://127.0.0.1:${server.address().port} (Ctrl+C to stop)`);
}

// Simple static server for previewing rootfs/app/web
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'rootfs', 'app', 'web');
const port = process.env.PORT ? Number(process.env.PORT) : 5555;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const secret = 'moviepilot';
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (!urlPath.startsWith('/' + secret)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const requestPath = urlPath.substring(('/' + secret).length); // e.g. '/assets/wechat.svg' or '/' or ''

  // Proxy external IP detection endpoints under secret prefix
  if (requestPath.startsWith('/extip/')) {
    const map = {
      '/extip/ddnspod': { proto: 'https', host: 'ipv4.ddnspod.com', port: 443, path: '/' },
      '/extip/ipw':     { proto: 'https', host: '4.ipw.cn',          port: 443, path: '/' },
      '/extip/3322':    { proto: 'https', host: 'ip.3322.net',       port: 443, path: '/' },
      '/extip/ipip':    { proto: 'https', host: 'myip.ipip.net',     port: 443, path: '/' },
      '/extip/v4a':     { proto: 'http',  host: 'v4.666666.host',    port: 66,  path: '/ip' },
      '/extip/v4b':     { proto: 'https', host: 'v4.66666.host',     port: 66,  path: '/ip' },
      '/extip/v6a':     { proto: 'https', host: '6.66666.host',      port: 66,  path: '/ip' }
    };
    const key = requestPath.replace(/\?.*$/, '');
    const target = map[key];
    if (!target) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const client = target.proto === 'https' ? https : http;
    const options = {
      hostname: target.host,
      port: target.port,
      path: target.path,
      method: 'GET',
      headers: { host: target.host }
    };
    const proxyReq = client.request(options, (proxyRes) => {
      // Normalize to text/plain
      const status = proxyRes.statusCode || 500;
      const chunks = [];
      proxyRes.on('data', (d) => chunks.push(d));
      proxyRes.on('end', () => {
        const body = Buffer.concat(chunks);
        res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(body);
      });
    });
    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Bad Gateway', message: String(err && err.message || err) }));
    });
    proxyReq.end();
    return;
  }

  // Proxy WeChat enterprise API under secret-prefixed /cgi-bin/*
  if (requestPath.startsWith('/cgi-bin/')) {
    const upstreamPath = requestPath; // already begins with /cgi-bin/
    const options = {
      hostname: 'qyapi.weixin.qq.com',
      port: 443,
      path: upstreamPath + (req.url.includes('?') ? '?' + req.url.split('?')[1] : ''),
      method: req.method,
      headers: Object.assign({}, req.headers, { host: 'qyapi.weixin.qq.com' })
    };
    const proxyReq = https.request(options, (proxyRes) => {
      // Pass through status and headers
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Bad Gateway', message: String(err && err.message || err) }));
    });
    req.pipe(proxyReq);
    return;
  }
  const relPath = requestPath.replace(/^\/+/,''); // remove leading slashes to keep join relative
  let filePath = path.join(root, relPath || 'index.html');

  // If requesting a directory or no extension, serve index.html
  if (!relPath || relPath.endsWith('/') || !path.extname(relPath)) {
    filePath = path.join(root, 'index.html');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}/`);
});
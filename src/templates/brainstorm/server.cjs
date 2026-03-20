#!/usr/bin/env node
// REAP Visual Companion Server
// Zero-dependency HTTP + WebSocket server using Node.js built-in modules only.
// Serves HTML fragments from a screen directory, auto-wraps in frame template,
// watches for file changes and pushes updates via WebSocket.

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

// --- Configuration ---
const PORT = parseInt(process.env.BRAINSTORM_PORT || '3210', 10);
const HOST = process.env.BRAINSTORM_HOST || '127.0.0.1';
const URL_HOST = process.env.BRAINSTORM_URL_HOST || `http://${HOST}:${PORT}`;
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// Screen directory: where HTML fragments are written by the AI agent
const SCREEN_DIR = process.env.BRAINSTORM_DIR || path.join(process.cwd(), '.reap', 'brainstorm');
const SERVER_INFO_FILE = path.join(SCREEN_DIR, '.server-info');
const SERVER_STOPPED_FILE = path.join(SCREEN_DIR, '.server-stopped');
const EVENTS_FILE = path.join(SCREEN_DIR, '.events');

// Frame template path (same directory as this script)
const FRAME_TEMPLATE_PATH = path.join(__dirname, 'frame.html');

// --- State ---
let idleTimer = null;
const wsClients = new Set();

// --- Helpers ---

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    console.log('[brainstorm] Idle timeout reached. Shutting down.');
    shutdown();
  }, IDLE_TIMEOUT_MS);
}

function shutdown() {
  try {
    fs.writeFileSync(SERVER_STOPPED_FILE, new Date().toISOString());
    if (fs.existsSync(SERVER_INFO_FILE)) fs.unlinkSync(SERVER_INFO_FILE);
  } catch (_) { /* best effort */ }
  process.exit(0);
}

function getNewestHtmlFile() {
  ensureDir(SCREEN_DIR);
  const files = fs.readdirSync(SCREEN_DIR)
    .filter(f => f.endsWith('.html') && !f.startsWith('.'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(SCREEN_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  return files.length > 0 ? files[0].name : null;
}

function loadFrame() {
  if (fs.existsSync(FRAME_TEMPLATE_PATH)) {
    return fs.readFileSync(FRAME_TEMPLATE_PATH, 'utf-8');
  }
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><title>REAP Brainstorm</title></head><body>{{CONTENT}}<script>{{WS_SCRIPT}}</script></body></html>';
}

function wrapInFrame(content) {
  const frame = loadFrame();
  const wsScript = `
(function() {
  var ws = new WebSocket('ws://' + location.host + '/ws');
  ws.onmessage = function(e) {
    var data = JSON.parse(e.data);
    if (data.type === 'reload') location.reload();
  };
  ws.onclose = function() { setTimeout(function() { location.reload(); }, 2000); };

  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-choice]');
    if (!el) return;
    var container = el.closest('.options, .cards');
    var isMulti = container && container.hasAttribute('data-multiselect');
    if (!isMulti) {
      container.querySelectorAll('[data-choice]').forEach(function(s) { s.classList.remove('selected'); });
    }
    el.classList.toggle('selected');
    var event = {
      type: 'click',
      choice: el.getAttribute('data-choice'),
      text: el.textContent.trim().substring(0, 200),
      timestamp: Math.floor(Date.now() / 1000)
    };
    ws.send(JSON.stringify(event));
  });
})();`;

  // Check if content is a full HTML document
  if (content.trim().startsWith('<!DOCTYPE') || content.trim().startsWith('<html')) {
    return content;
  }
  return frame.replace('{{CONTENT}}', content).replace('{{WS_SCRIPT}}', wsScript);
}

// --- WebSocket (RFC 6455 minimal implementation) ---

function parseWsFrame(buffer) {
  if (buffer.length < 2) return null;
  const secondByte = buffer[1];
  const masked = (secondByte & 0x80) !== 0;
  let payloadLen = secondByte & 0x7f;
  let offset = 2;

  if (payloadLen === 126) {
    if (buffer.length < 4) return null;
    payloadLen = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLen === 127) {
    if (buffer.length < 10) return null;
    payloadLen = Number(buffer.readBigUInt64BE(2));
    offset = 10;
  }

  let maskKey = null;
  if (masked) {
    if (buffer.length < offset + 4) return null;
    maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLen) return null;

  let payload = buffer.slice(offset, offset + payloadLen);
  if (masked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskKey[i & 3];
    }
  }

  const opcode = buffer[0] & 0x0f;
  return { opcode, payload, totalLength: offset + payloadLen };
}

function createWsFrame(data) {
  const payload = Buffer.from(data, 'utf-8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

function broadcastWs(message) {
  const frame = createWsFrame(JSON.stringify(message));
  for (const client of wsClients) {
    try { client.write(frame); } catch (_) { wsClients.delete(client); }
  }
}

// --- HTTP Server ---

const server = http.createServer((req, res) => {
  resetIdleTimer();
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // Serve newest HTML file
  if (pathname === '/') {
    const newest = getNewestHtmlFile();
    if (!newest) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(wrapInFrame('<div style="display:flex;align-items:center;justify-content:center;min-height:60vh"><p style="color:#888;font-size:1.2em;">Waiting for content...</p></div>'));
      return;
    }
    const content = fs.readFileSync(path.join(SCREEN_DIR, newest), 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(wrapInFrame(content));
    return;
  }

  // Serve specific files from screen directory
  if (pathname.startsWith('/files/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(SCREEN_DIR, filename);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': (mimeTypes[ext] || 'application/octet-stream') + '; charset=utf-8' });
      res.end(fs.readFileSync(filePath));
      return;
    }
  }

  res.writeHead(404);
  res.end('Not Found');
});

// WebSocket upgrade
server.on('upgrade', (req, socket) => {
  if (req.url !== '/ws') { socket.destroy(); return; }

  const key = req.headers['sec-websocket-key'];
  const accept = crypto.createHash('sha1')
    .update(key + '258EAFA5-E914-47DA-95CA-5AB5DC085B11')
    .digest('base64');

  socket.write(
    'HTTP/1.1 101 Switching Protocols\r\n' +
    'Upgrade: websocket\r\n' +
    'Connection: Upgrade\r\n' +
    `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  wsClients.add(socket);
  let buffer = Buffer.alloc(0);

  socket.on('data', (data) => {
    resetIdleTimer();
    buffer = Buffer.concat([buffer, data]);
    while (true) {
      const frame = parseWsFrame(buffer);
      if (!frame) break;
      buffer = buffer.slice(frame.totalLength);

      if (frame.opcode === 0x08) { // close
        wsClients.delete(socket);
        socket.end();
        return;
      }
      if (frame.opcode === 0x09) { // ping
        const pong = Buffer.alloc(2);
        pong[0] = 0x8a; pong[1] = 0;
        socket.write(pong);
        continue;
      }
      if (frame.opcode === 0x01) { // text
        try {
          const event = frame.payload.toString('utf-8');
          fs.appendFileSync(EVENTS_FILE, event + '\n');
        } catch (_) { /* best effort */ }
      }
    }
  });

  socket.on('close', () => wsClients.delete(socket));
  socket.on('error', () => wsClients.delete(socket));
});

// --- File Watcher ---

function startWatcher() {
  ensureDir(SCREEN_DIR);
  let debounce = null;
  try {
    fs.watch(SCREEN_DIR, (eventType, filename) => {
      if (!filename || filename.startsWith('.') || !filename.endsWith('.html')) return;
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => {
        // Clear events file when new HTML is pushed
        try { fs.writeFileSync(EVENTS_FILE, ''); } catch (_) {}
        broadcastWs({ type: 'reload' });
      }, 100);
    });
  } catch (err) {
    console.error('[brainstorm] File watcher error:', err.message);
  }
}

// --- Startup ---

ensureDir(SCREEN_DIR);

// Remove stale stopped marker
if (fs.existsSync(SERVER_STOPPED_FILE)) {
  fs.unlinkSync(SERVER_STOPPED_FILE);
}

server.listen(PORT, HOST, () => {
  const info = { url: URL_HOST, port: PORT, pid: process.pid, startedAt: new Date().toISOString() };
  fs.writeFileSync(SERVER_INFO_FILE, JSON.stringify(info, null, 2));
  console.log(`[brainstorm] Visual Companion running at ${URL_HOST}`);
  console.log(`[brainstorm] Screen directory: ${SCREEN_DIR}`);
  console.log(`[brainstorm] Idle timeout: 30 minutes`);
  resetIdleTimer();
  startWatcher();
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

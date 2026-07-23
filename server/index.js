/* Ball Knowledge relay server — FL-4 v1: rooms + friend codes.
   Two players join a 4-letter room; every game event is relayed to the
   other side. No accounts, no database — friends with a code. */
const http = require("http");
const { WebSocketServer } = require("ws");
const PORT = process.env.PORT || 10000;

const page = `<!doctype html><meta charset="utf-8">
<title>Ball Knowledge Server</title>
<body style="margin:0;display:grid;place-items:center;height:100vh;background:#100d0b;
color:#efe6d8;font-family:system-ui;text-align:center">
<div><div style="font-size:64px">🏀</div>
<h1 style="text-transform:uppercase;letter-spacing:.1em">Ball Knowledge server<br>
<span style="color:#f5872e">is alive</span></h1>
<p style="color:#b3a894;font-family:monospace">FL-4 alpha · rooms &amp; friend codes LIVE</p></div>`;

const rooms = new Map(); // code -> [hostWs, guestWs?]

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify({ ok: true, game: "ball-knowledge", phase: "FL-4 alpha", rooms: rooms.size }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page);
});

function makeCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // no I/O — they read like 1/0
  let c;
  do { c = Array.from({ length: 4 }, () => A[(Math.random() * A.length) | 0]).join(""); }
  while (rooms.has(c));
  return c;
}
function send(ws, o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
function peerOf(ws) {
  const r = rooms.get(ws.bkRoom);
  if (!r) return null;
  return r[0] === ws ? r[1] : r[0];
}

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  ws.on("message", (buf) => {
    let d; try { d = JSON.parse(buf.toString()); } catch (e) { return; }
    if (d.t === "create") {
      const code = makeCode();
      rooms.set(code, [ws, null]);
      ws.bkRoom = code;
      send(ws, { t: "room", code, role: 0 });
      return;
    }
    if (d.t === "join") {
      const code = String(d.code || "").toUpperCase().trim();
      const r = rooms.get(code);
      if (!r) { send(ws, { t: "nope", why: "No room with that code — check it with your friend." }); return; }
      if (r[1]) { send(ws, { t: "nope", why: "That room is already full." }); return; }
      r[1] = ws;
      ws.bkRoom = code;
      send(ws, { t: "room", code, role: 1 });
      send(r[0], { t: "ready" });
      send(r[1], { t: "ready" });
      return;
    }
    if (d.t === "ev") { send(peerOf(ws), d); return; }
  });
  ws.on("close", () => {
    const code = ws.bkRoom, r = rooms.get(code);
    if (!r) return;
    const peer = peerOf(ws);
    send(peer, { t: "peer-left" });
    rooms.delete(code);
  });
});

/* heartbeat: culls dead sockets and keeps the free dyno awake mid-game */
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) { try { ws.terminate(); } catch (e) {} return; }
    ws.isAlive = false;
    try { ws.ping(); } catch (e) {}
  });
}, 30000);

server.listen(PORT, "0.0.0.0", () => console.log("BK relay listening on " + PORT));

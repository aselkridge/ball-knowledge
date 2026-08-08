/* Ball Knowledge relay server, FL-4 v2: rooms + friend codes + reconnect.
   Two players join a 4-letter room; every game event is relayed. If a player
   drops (refresh, tunnel, nap), the room is HELD for a grace window so they
   can rejoin and resync the live game instead of the match just dying. */
const http = require("http");
const { WebSocketServer } = require("ws");
const PORT = process.env.PORT || 10000;
const GRACE_MS = 45000;
/* THE GUEST LIST: set BK_ACCESS on the host (comma-separated codes) to make
   online play invite-only. Unset = door's open (nothing breaks pre-config).
   Rotate by changing the env var, old codes die instantly. */
const CODES = (process.env.BK_ACCESS || "").split(",")
  .map(s => s.trim().toUpperCase()).filter(Boolean);
const passOk = p => !CODES.length || CODES.includes(String(p || "").toUpperCase().trim());

const page = `<!doctype html><meta charset="utf-8">
<title>Ball Knowledge Server</title>
<body style="margin:0;display:grid;place-items:center;height:100vh;background:#100d0b;
color:#efe6d8;font-family:system-ui;text-align:center">
<div><div style="font-size:64px">🏀</div>
<h1 style="text-transform:uppercase;letter-spacing:.1em">Ball Knowledge server<br>
<span style="color:#f5872e">is alive</span></h1>
<p style="color:#b3a894;font-family:monospace">FL-4 v2 · rooms · friend codes · reconnect</p></div>`;

const rooms = new Map(); // code -> { slots:[ws|null, ws|null], dropped, graceTimer }

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify({ ok: true, game: "ball-knowledge", phase: "FL-4 v2", rooms: rooms.size, gate: CODES.length > 0 }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page);
});

function makeCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let c;
  do { c = Array.from({ length: 4 }, () => A[(Math.random() * A.length) | 0]).join(""); }
  while (rooms.has(c));
  return c;
}
function send(ws, o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
function peerOf(ws) {
  const r = rooms.get(ws.bkRoom);
  if (!r) return null;
  return r.slots[1 - ws.bkRole];
}

const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  ws.on("message", (buf) => {
    let d; try { d = JSON.parse(buf.toString()); } catch (e) { return; }

    if (d.t === "access") {
      send(ws, { t: "access", ok: passOk(d.code), gate: CODES.length > 0 });
      return;
    }

    if (d.t === "create") {
      if (!passOk(d.pass)) { send(ws, { t: "nope", why: "The bouncer checked the list twice, that access code isn't on it.", access: true }); return; }
      const code = makeCode();
      rooms.set(code, { slots: [ws, null], dropped: false, graceTimer: null });
      ws.bkRoom = code; ws.bkRole = 0;
      send(ws, { t: "room", code, role: 0 });
      return;
    }

    if (d.t === "join") {
      if (!passOk(d.pass)) { send(ws, { t: "nope", why: "The bouncer checked the list twice, that access code isn't on it.", access: true }); return; }
      const code = String(d.code || "").toUpperCase().trim();
      const r = rooms.get(code);
      if (!r) { send(ws, { t: "nope", why: "No room with that code, check it with your friend." }); return; }
      if (r.slots[1]) { send(ws, { t: "nope", why: "That room is already full." }); return; }
      r.slots[1] = ws; ws.bkRoom = code; ws.bkRole = 1;
      send(ws, { t: "room", code, role: 1 });
      send(r.slots[0], { t: "ready" });
      send(r.slots[1], { t: "ready" });
      return;
    }

    if (d.t === "rejoin") {
      if (!passOk(d.pass)) { send(ws, { t: "nope", why: "Access code changed while you were out, grab the new one.", access: true }); return; }
      const code = String(d.code || "").toUpperCase().trim();
      const role = d.role === 1 ? 1 : 0;
      const r = rooms.get(code);
      if (!r || !r.dropped) { send(ws, { t: "nope", why: "That game has closed." }); return; }
      if (r.slots[role]) { send(ws, { t: "nope", why: "That seat is already filled." }); return; }
      if (r.graceTimer) { clearTimeout(r.graceTimer); r.graceTimer = null; }
      r.slots[role] = ws; r.dropped = false;
      ws.bkRoom = code; ws.bkRole = role;
      send(ws, { t: "rejoined", role });
      send(r.slots[1 - role], { t: "peer-back" }); // survivor pushes a state snapshot
      return;
    }

    if (d.t === "ev") { send(peerOf(ws), d); return; }
  });

  ws.on("close", () => {
    const code = ws.bkRoom, r = rooms.get(code);
    if (!r) return;
    if (r.slots[ws.bkRole] === ws) r.slots[ws.bkRole] = null;
    const peer = r.slots[1 - ws.bkRole];
    if (!peer) { if (r.graceTimer) clearTimeout(r.graceTimer); rooms.delete(code); return; }
    /* hold the room open. The dropped player can rejoin within the grace window */
    r.dropped = true;
    send(peer, { t: "peer-dropped", grace: Math.round(GRACE_MS / 1000) });
    r.graceTimer = setTimeout(() => {
      send(peer, { t: "peer-left" });
      rooms.delete(code);
    }, GRACE_MS);
  });
});

/* heartbeat: cull dead sockets, keep the free dyno awake mid-game */
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) { try { ws.terminate(); } catch (e) {} return; }
    ws.isAlive = false;
    try { ws.ping(); } catch (e) {}
  });
}, 30000);

server.listen(PORT, "0.0.0.0", () => console.log("BK relay v2 listening on " + PORT));

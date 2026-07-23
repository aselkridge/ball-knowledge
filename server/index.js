/* Ball Knowledge relay server — placeholder v0.
   Proves the deploy pipeline; the real room/friend-code relay lands in FL-4. */
const http = require("http");
const PORT = process.env.PORT || 10000;

const page = `<!doctype html><meta charset="utf-8">
<title>Ball Knowledge Server</title>
<body style="margin:0;display:grid;place-items:center;height:100vh;background:#100d0b;
color:#efe6d8;font-family:system-ui;text-align:center">
<div><div style="font-size:64px">🏀</div>
<h1 style="text-transform:uppercase;letter-spacing:.1em">Ball Knowledge server<br>
<span style="color:#f5872e">is alive</span></h1>
<p style="color:#b3a894;font-family:monospace">v0 placeholder · rooms &amp; friend codes arrive in FL-4</p></div>`;

http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, game: "ball-knowledge", phase: "FL-4 pending" }));
    return;
  }
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end(page);
}).listen(PORT, "0.0.0.0", () => console.log("BK server listening on " + PORT));

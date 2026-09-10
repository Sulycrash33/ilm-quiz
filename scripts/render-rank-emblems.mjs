/**
 * Renders the nine rank emblems at the sizes they actually ship at, so they
 * can be looked at rather than reasoned about.
 *
 * The smallest place an emblem appears is the rank chip beside the player's
 * name on the home screen, at 14px. Nothing in a code review tells you whether
 * a drawing survives that; only looking does. This drives headless Chrome over
 * CDP, the same way `check-mobile-overflow.mjs` does, and writes one PNG.
 *
 * The paths are read out of `RankEmblems.tsx` rather than copied, so the
 * picture is always of the emblems that are actually shipping.
 *
 *   /opt/pw-browsers/chromium/chrome-linux/chrome --headless \
 *     --remote-debugging-port=9350 --disable-gpu about:blank &
 *   node scripts/render-rank-emblems.mjs 9350 /tmp/emblems.png
 */
import { readFileSync, writeFileSync } from "node:fs"

const PORT = Number(process.argv[2] ?? 9350)
const OUT = process.argv[3] ?? "emblems.png"
const SIZES = [14, 20, 28, 40]

// --- pull the geometry straight out of the component -----------------------
const src = readFileSync(new URL("../src/components/icons/RankEmblems.tsx", import.meta.url), "utf8")
const emblems = []
for (const m of src.matchAll(/export function (\w+Emblem)\(props: EmblemProps\)[\s\S]*?<Emblem \{\.\.\.props\}>([\s\S]*?)<\/Emblem>/g)) {
  const paths = [...m[2].matchAll(/<path d="([^"]+)"\s*\/>/g)].map((p) => p[1])
  if (!paths.length) throw new Error(`no paths found in ${m[1]}`)
  emblems.push({ name: m[1].replace(/Emblem$/, ""), paths })
}
if (emblems.length !== 9) throw new Error(`expected 9 emblems, parsed ${emblems.length}`)

const svg = (paths, size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
  `stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">` +
  paths.map((d) => `<path d="${d}"/>`).join("") +
  `</svg>`

const html = `<!doctype html><meta charset="utf-8"><style>
  body { margin:0; padding:20px; background:#0b1326; color:#f0cd6d;
         font:12px/1.4 system-ui, sans-serif; }
  table { border-collapse:collapse; }
  td, th { padding:10px 14px; text-align:center; color:#dae2fd; font-weight:400; }
  th.n { text-align:right; color:#f0cd6d; font-weight:600; }
  .cell { display:flex; align-items:center; justify-content:center; height:44px; color:#f0cd6d; }
</style><table>
<tr><th></th>${SIZES.map((s) => `<th>${s}px</th>`).join("")}</tr>
${emblems
  .map(
    (e) =>
      `<tr><th class="n">${e.name}</th>` +
      SIZES.map((s) => `<td><div class="cell">${svg(e.paths, s)}</div></td>`).join("") +
      `</tr>`
  )
  .join("\n")}
</table>`

// --- drive Chrome ----------------------------------------------------------
const res = await fetch(`http://127.0.0.1:${PORT}/json/list`)
const page = (await res.json()).find((t) => t.type === "page")
const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()
const send = (m, p = {}) =>
  new Promise((resolve, reject) => {
    const i = ++id
    pending.set(i, { resolve, reject })
    ws.send(JSON.stringify({ id: i, method: m, params: p }))
  })
await new Promise((r) => ws.addEventListener("open", r))
ws.addEventListener("message", (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
  }
})
await send("Page.enable")
await send("Emulation.setDeviceMetricsOverride", {
  width: 720, height: 620, deviceScaleFactor: 3, mobile: false,
})
await send("Page.navigate", { url: "data:text/html;charset=utf-8," + encodeURIComponent(html) })
await new Promise((r) => setTimeout(r, 600))
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true })
writeFileSync(OUT, Buffer.from(shot.data, "base64"))
console.log(`${emblems.length} emblems at ${SIZES.join("/")}px → ${OUT}`)
ws.close()
process.exit(0)

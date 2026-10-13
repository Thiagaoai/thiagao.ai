// Renderiza cenas de cenas.html quadro a quadro (determinístico) e codifica com ffmpeg.
// Uso:
//   node render.mjs <pw-core> <cenas.html> stills <outdir> S01:20 S02:24 ...
//   node render.mjs <pw-core> <cenas.html> video <out.mp4> <id> <dur> [fps] [json-extra]
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import path from 'node:path';

const [pwDir, html, mode, out, ...rest] = process.argv.slice(2);
const require = createRequire(path.join(pwDir, 'index.js'));
const { chromium } = require(pwDir);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.resolve(html));
await page.evaluate(() => document.fonts.ready);

if (mode === 'stills') {
  for (const spec of rest) {
    const [id, t] = spec.split(':');
    await page.evaluate(([id, t]) => window.show(id, parseFloat(t)), [id, t]);
    await page.screenshot({ path: path.join(out, `${id}.png`) });
  }
} else {
  const [id, durS, fpsS, extraS] = rest;
  const dur = parseFloat(durS), fps = parseInt(fpsS || '30', 10);
  const extra = extraS ? JSON.parse(extraS) : null;
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps),
    '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const frames = Math.round(dur * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(([id, t, extra]) => window.show(id, t, extra), [id, i / fps, extra]);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}
await browser.close();

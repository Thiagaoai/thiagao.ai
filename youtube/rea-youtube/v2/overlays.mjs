// Renderiza cada texto de tela como PNG transparente 1920x1080.
// Uso: node overlays.mjs <playwright-core> <overlay.html> <lista.json> <saida-dir>
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const [pwDir, html, lista, outDir] = process.argv.slice(2);
const require = createRequire(path.join(pwDir, 'index.js'));
const { chromium } = require(pwDir);
const itens = JSON.parse(readFileSync(lista, 'utf8'));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('file://' + path.resolve(html));
await page.evaluate(() => document.fonts.ready);
for (const it of itens) {
  await page.evaluate(o => window.paint(o), it);
  await page.screenshot({ path: path.join(outDir, it.id + '.png'), omitBackground: true });
}
await browser.close();

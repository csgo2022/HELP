// Generate simple PNG tab icons for WeChat Mini Program
// Each icon: 48x48 RGBA, drawn as simple shapes using pixel data
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const OUT_DIR = 'D:/互助养老3/互助养老小程序/images/icons-tab';

function crc32(buf) {
  let crc = 0xffffffff;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  return Buffer.concat([len, t, data, crc]);
}

function createPNG(width, height, pixels) {
  // pixels: flat array of RGBA bytes (0-255 per channel, row-major)
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Build raw data with filter byte (0 = None) per row
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter byte
    for (let x = 0; x < width * 4; x++) {
      raw[y * (1 + width * 4) + 1 + x] = pixels[y * width * 4 + x];
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idat = chunk('IDAT', compressed);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, chunk('IHDR', ihdr), idat, iend]);
}

function fillRect(pixels, w, h, cx, cy, rw, rh, color) {
  for (let y = Math.max(0, cy); y < Math.min(h, cy + rh); y++) {
    for (let x = Math.max(0, cx); x < Math.min(w, cx + rw); x++) {
      const idx = (y * w + x) * 4;
      pixels[idx] = color[0];
      pixels[idx + 1] = color[1];
      pixels[idx + 2] = color[2];
      pixels[idx + 3] = color[3];
    }
  }
}

function drawCircle(pixels, w, h, cx, cy, r, color) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        const idx = (y * w + x) * 4;
        pixels[idx] = color[0];
        pixels[idx + 1] = color[1];
        pixels[idx + 2] = color[2];
        pixels[idx + 3] = color[3];
      }
    }
  }
}

function drawStrokeCircle(pixels, w, h, cx, cy, r, strokeW, color) {
  const outerR = r + strokeW / 2;
  const innerR = r - strokeW / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= innerR && dist <= outerR) {
        const idx = (y * w + x) * 4;
        pixels[idx] = color[0];
        pixels[idx + 1] = color[1];
        pixels[idx + 2] = color[2];
        pixels[idx + 3] = color[3];
      }
    }
  }
}

// === HOME (house) ===
function drawHomeIcon() {
  const S = 48;
  const p = new Uint8Array(S * S * 4); // all zeros = transparent

  const C = '#9b4500'; // primary color
  const r = parseInt(C.slice(1,3), 16);
  const g = parseInt(C.slice(3,5), 16);
  const b = parseInt(C.slice(5,7), 16);
  const col = [r, g, b, 255];

  // Roof (triangle shape via filled rects)
  for (let row = 0; row < 18; row++) {
    const half = 15 - Math.floor(row * 15 / 18);
    if (half <= 0) continue;
    fillRect(p, S, S, 24 - half, 4 + row, half * 2, 1, col);
  }
  // Walls
  fillRect(p, S, S, 13, 22, 22, 18, col);
  // Door
  fillRect(p, S, S, 19, 30, 10, 10, [255, 255, 255, 255]);

  return p;
}

// === VOLUNTEER (heart) ===
function drawHeartIcon() {
  const S = 48;
  const p = new Uint8Array(S * S * 4);

  const C = '#9b4500';
  const r = parseInt(C.slice(1,3), 16);
  const g = parseInt(C.slice(3,5), 16);
  const b = parseInt(C.slice(5,7), 16);
  const col = [r, g, b, 255];

  // Heart shape using math
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const nx = (x - 24) / 14;
      const ny = (y - 22) / 14;
      // (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const xx = nx * nx, yy = ny * ny;
      const val = (xx + yy - 1) * (xx + yy - 1) * (xx + yy - 1) - xx * ny * ny * ny;
      if (val <= 0) {
        const idx = (y * S + x) * 4;
        p[idx] = r; p[idx+1] = g; p[idx+2] = b; p[idx+3] = 255;
      }
    }
  }

  return p;
}

// === HISTORY (clock) ===
function drawClockIcon() {
  const S = 48;
  const p = new Uint8Array(S * S * 4);

  const C = '#9b4500';
  const r = parseInt(C.slice(1,3), 16);
  const g = parseInt(C.slice(3,5), 16);
  const b = parseInt(C.slice(5,7), 16);
  const col = [r, g, b, 255];

  // Clock circle
  drawStrokeCircle(p, S, S, 24, 24, 18, 5, col);
  // Center dot
  drawCircle(p, S, S, 24, 24, 2, col);
  // Hour hand (pointing right-up-ish ~10:10)
  fillRect(p, S, S, 24, 13, 3, 11, col);
  // Minute hand
  fillRect(p, S, S, 27, 22, 9, 3, col);

  return p;
}

// === PERSON (profile silhouette) ===
function drawPersonIcon() {
  const S = 48;
  const p = new Uint8Array(S * S * 4);

  const C = '#9b4500';
  const r = parseInt(C.slice(1,3), 16);
  const g = parseInt(C.slice(3,5), 16);
  const b = parseInt(C.slice(5,7), 16);
  const col = [r, g, b, 255];

  // Head
  drawCircle(p, S, S, 24, 13, 8, col);
  // Body (trapezoid shape)
  for (let y = 22; y < 38; y++) {
    const t = (y - 22) / 16;
    const halfW = Math.floor(5 + t * 8);
    fillRect(p, S, S, 24 - halfW, y, halfW * 2, 1, col);
  }

  return p;
}

// Generate all 4 icons
const icons = {
  'home': drawHomeIcon,
  'volunteer': drawHeartIcon,
  'history': drawClockIcon,
  'person': drawPersonIcon,
};

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

for (const [name, drawFn] of Object.entries(icons)) {
  const pixels = drawFn();
  const png = createPNG(48, 48, pixels);
  const outPath = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Created: ${outPath} (${png.length} bytes)`);
}

console.log('All tab icons generated!');

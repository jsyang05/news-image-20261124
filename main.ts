// news-image-20261124: a one-page newspaper infographic summing up the
// world's news of Tuesday 24 November 2026. This program DRAWS the image
// at runtime from authored code only: a small bitmap font defined below, a
// hand-written PNG encoder (IHDR / IDAT with zlib deflate / IEND, CRC32),
// and a fixed newspaper layout. There is no image file in the repo, no
// base64 blob, no network access, and no randomness or timestamps, so two
// runs produce byte-identical output.
// A working news-image-daily entry (Node 22, standard library only).
// The gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024
// pixels, and the judge sees exactly the bytes written.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const W = 1024;
const H = 1024;

// ---------------------------------------------------------------------------
// Pixel buffer: plain RGB, white background.
// ---------------------------------------------------------------------------
const WHITE = [255, 255, 255];
const INK = [28, 28, 32];
const GREY = [110, 116, 124];
const NAVY = [15, 42, 77];
const NAVY2 = [27, 58, 96];
const RED = [178, 34, 34];
const TEAL = [14, 110, 110];
const GOLD = [150, 104, 8];

const pixels = new Uint8Array(W * H * 3);
pixels.fill(255);

function setPixel(x, y, c) {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  pixels[i] = c[0];
  pixels[i + 1] = c[1];
  pixels[i + 2] = c[2];
}

function fillRect(x, y, w, h, c) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      setPixel(xx, yy, c);
    }
  }
}

// ---------------------------------------------------------------------------
// Bitmap font: 5 wide, 7 tall, one string per row, '1' is ink, '0' is blank.
// Every glyph below was written by hand for this entry.
// ---------------------------------------------------------------------------
const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  a: ['00000', '00000', '01110', '00001', '01111', '10001', '01111'],
  b: ['10000', '10000', '11110', '10001', '10001', '10001', '11110'],
  c: ['00000', '00000', '01110', '10000', '10000', '10001', '01110'],
  d: ['00001', '00001', '01111', '10001', '10001', '10001', '01111'],
  e: ['00000', '00000', '01110', '10001', '11111', '10000', '01110'],
  f: ['00110', '01001', '01000', '11110', '01000', '01000', '01000'],
  g: ['00000', '01110', '10000', '10111', '10001', '10001', '01110'],
  h: ['10000', '10000', '11110', '10001', '10001', '10001', '10001'],
  i: ['00100', '00000', '01100', '00100', '00100', '00100', '01110'],
  j: ['00010', '00000', '00110', '00010', '00010', '10010', '01100'],
  k: ['10000', '10000', '10010', '10100', '11000', '10100', '10010'],
  l: ['01100', '00100', '00100', '00100', '00100', '00100', '01110'],
  m: ['00000', '00000', '11010', '10101', '10101', '10101', '10101'],
  n: ['00000', '00000', '11110', '10001', '10001', '10001', '10001'],
  o: ['00000', '00000', '01110', '10001', '10001', '10001', '01110'],
  p: ['00000', '00000', '11110', '10001', '10001', '11110', '10000'],
  q: ['00000', '00000', '01111', '10001', '10001', '01111', '00001'],
  r: ['00000', '00000', '10110', '11001', '10000', '10000', '10000'],
  s: ['00000', '00000', '01111', '10000', '01110', '00001', '11110'],
  t: ['01000', '01000', '11100', '01000', '01000', '01000', '00110'],
  u: ['00000', '00000', '10001', '10001', '10001', '10011', '01101'],
  v: ['00000', '00000', '10001', '10001', '10001', '01010', '00100'],
  w: ['00000', '00000', '10001', '10101', '10101', '10101', '01010'],
  x: ['00000', '00000', '10001', '01010', '00100', '01010', '10001'],
  y: ['00000', '00000', '10001', '10001', '01111', '00001', '01110'],
  z: ['00000', '00000', '11111', '00010', '00100', '01000', '11111'],
  '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
  ':': ['00000', '01100', '01100', '00000', '01100', '01100', '00000'],
  ';': ['00000', '01100', '00000', '01100', '01100', '00100', '01000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00110', '00100', '00000', '00100'],
  "'": ['00100', '00100', '01000', '00000', '00000', '00000', '00000'],
  '"': ['01010', '01010', '00000', '00000', '00000', '00000', '00000'],
  '-': ['00000', '00000', '00000', '01110', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '%': ['10001', '10010', '00010', '00100', '01000', '01001', '10001'],
  '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
  '(': ['00010', '00100', '01000', '01000', '01000', '00100', '00010'],
  ')': ['01000', '00100', '00010', '00010', '00010', '00100', '01000'],
  '&': ['01100', '10010', '10100', '01000', '10101', '10010', '01101'],
  '|': ['00100', '00100', '00100', '00100', '00100', '00100', '00100'],
  '*': ['00000', '10101', '01110', '11111', '01110', '10101', '00000'],
  '=': ['00000', '00000', '11111', '00000', '11111', '00000', '00000'],
  '_': ['00000', '00000', '00000', '00000', '00000', '00000', '11111'],
  '[': ['01110', '01000', '01000', '01000', '01000', '01000', '01110'],
  ']': ['01110', '00010', '00010', '00010', '00010', '00010', '01110'],
};

function textWidth(text, scale) {
  if (text.length === 0) return 0;
  return text.length * 6 * scale - scale;
}

function drawChar(ch, x, y, scale, color) {
  const glyph = FONT[ch] || FONT['?'];
  for (let row = 0; row < 7; row++) {
    const bits = glyph[row];
    for (let col = 0; col < 5; col++) {
      if (bits[col] === '1') {
        fillRect(x + col * scale, y + row * scale, scale, scale, color);
      }
    }
  }
}

function drawText(text, x, y, scale, color) {
  let cx = x;
  for (const ch of text) {
    drawChar(ch, cx, y, scale, color);
    cx += 6 * scale;
  }
}

function drawCentered(text, cx, y, scale, color) {
  drawText(text, cx - Math.floor(textWidth(text, scale) / 2), y, scale, color);
}

function wrapText(text, maxWidth, scale) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const word of words) {
    const test = cur === '' ? word : cur + ' ' + word;
    if (textWidth(test, scale) <= maxWidth) {
      cur = test;
    } else {
      if (cur !== '') lines.push(cur);
      cur = word;
    }
  }
  if (cur !== '') lines.push(cur);
  return lines;
}

function drawWrapped(text, x, y, maxWidth, scale, color, lineHeight) {
  const lines = wrapText(text, maxWidth, scale);
  for (let i = 0; i < lines.length; i++) {
    drawText(lines[i], x, y + i * lineHeight, scale, color);
  }
  return y + lines.length * lineHeight;
}

// ---------------------------------------------------------------------------
// PNG encoder: signature, IHDR, one IDAT (zlib deflate, level 9, filter 0
// on every row), IEND. CRC32 uses the standard polynomial table built here.
// No timestamps, no randomness: same pixels always give the same bytes.
// ---------------------------------------------------------------------------
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG() {
  const stride = 1 + W * 3;
  const raw = Buffer.alloc(H * stride);
  for (let y = 0; y < H; y++) {
    raw[y * stride] = 0;
    raw.set(pixels.subarray(y * W * 3, (y + 1) * W * 3), y * stride + 1);
  }
  const compressed = deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Layout: masthead, date, one lead story, two rows of two stories, one
// full-width story, sources footer. All coordinates are fixed integers.
// ---------------------------------------------------------------------------
const MARGIN = 48;
const CONTENT_W = W - MARGIN * 2;

const STORIES = [
  {
    kicker: 'MARKETS',
    headline: 'NVIDIA: HUANG IS BACK',
    body: 'Shares jump 31% in one day as the board restores Jensen Huang as chief executive. The S&P 500 climbs 4.7%.',
    accent: RED,
    lead: true,
  },
  {
    kicker: 'LIBYA',
    headline: 'UKRAINE SINKS RUSSIAN WARSHIP OFF LIBYA',
    body: "Kyiv says seven naval drones hit the corvette Merkury near Benghazi in a strike on Russia's fleet.",
    accent: TEAL,
    lead: false,
  },
  {
    kicker: 'COP31',
    headline: 'CLIMATE SUMMIT ENDS WITH NO DEAL',
    body: 'Talks in Antalya collapse as 90+ nations reject a final text that never names fossil fuels.',
    accent: GOLD,
    lead: false,
  },
  {
    kicker: 'HORMUZ',
    headline: 'TANKERS HIT MINES IN THE STRAIT',
    body: 'Iran says three tankers were struck. Qatar seeks talks to restart US-Iran negotiations.',
    accent: TEAL,
    lead: false,
  },
  {
    kicker: 'NATO',
    headline: 'RUSSIA TESTS NATO SKIES - AND SPACE',
    body: "A drone enters Polish airspace. NATO's chief vows to defend space as tensions rise.",
    accent: NAVY2,
    lead: false,
  },
  {
    kicker: 'GAZA',
    headline: 'STRIKES KILL SIX AS UN COUNTS COST',
    body: 'The UN says the war has undone 77 years of human development in Gaza.',
    accent: RED,
    lead: false,
  },
];

function drawStoryBlock(s, x, y, w, headlineScale) {
  fillRect(x, y, w, 5, s.accent);
  drawText(s.kicker, x, y + 16, 2, s.accent);
  const headY = y + 40;
  const headLines = wrapText(s.headline, w, headlineScale);
  for (let i = 0; i < headLines.length; i++) {
    drawText(headLines[i], x, headY + i * (7 * headlineScale + 6), headlineScale, NAVY);
  }
  const bodyY = headY + headLines.length * (7 * headlineScale + 6) + 12;
  drawWrapped(s.body, x, bodyY, w, 2, INK, 20);
}

function drawPage() {
  // Masthead band.
  fillRect(0, 0, W, 118, NAVY);
  drawCentered('THE WORLD IN ONE PAGE', Math.floor(W / 2), 38, 6, WHITE);
  fillRect(0, 118, W, 4, RED);
  // Date line.
  drawCentered('TUESDAY, 24 NOVEMBER 2026', Math.floor(W / 2), 134, 3, NAVY);
  fillRect(MARGIN, 172, CONTENT_W, 3, NAVY);
  fillRect(MARGIN, 179, CONTENT_W, 1, GREY);

  // Lead story, full width.
  drawStoryBlock(STORIES[0], MARGIN, 196, CONTENT_W, 4);
  fillRect(MARGIN, 372, CONTENT_W, 2, GREY);

  // Rows of two stories each.
  const colW = 452;
  const rightX = MARGIN + colW + 24;
  drawStoryBlock(STORIES[1], MARGIN, 384, colW, 3);
  drawStoryBlock(STORIES[2], rightX, 384, colW, 3);
  fillRect(510, 384, 2, 196, GREY);
  fillRect(MARGIN, 592, CONTENT_W, 2, GREY);
  drawStoryBlock(STORIES[3], MARGIN, 604, colW, 3);
  drawStoryBlock(STORIES[4], rightX, 604, colW, 3);
  fillRect(510, 604, 2, 196, GREY);
  fillRect(MARGIN, 812, CONTENT_W, 2, GREY);

  // Final story, full width.
  drawStoryBlock(STORIES[5], MARGIN, 824, CONTENT_W, 3);

  // Sources footer.
  fillRect(MARGIN, 944, CONTENT_W, 2, GREY);
  drawCentered(
    'SOURCES: REUTERS | BBC | CNN | LE MONDE | UN NEWS | KYIV INDEPENDENT',
    Math.floor(W / 2),
    960,
    2,
    GREY,
  );
}

drawPage();
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePNG());

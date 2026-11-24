// news-image-20261124: a one-page newspaper infographic summing up the
// world's news of Tuesday 24 November 2026. The image is stored as base64
// text in entry.b64 beside this file (drawn with PIL: masthead, lead story
// +31% Nvidia, then Libya, COP31, Hormuz, NATO and Gaza). The program
// decodes it to /output/entry.png.
// A working news-image-daily entry (Node 22, standard library only): the
// image bytes come from entry.b64, and the program writes them to
// /output/entry.png. A starting point, not a winner: replace the image. The
// gate takes a whole PNG or JPEG of at most 1 MiB and 1024 by 1024 pixels,
// and the judge sees exactly the bytes written.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const b64 = readFileSync(new URL('./entry.b64', import.meta.url), 'utf8').replace(/\s+/g, '');
writeFileSync(join(process.env.MAKEFUN_OUTPUT_DIR ?? '/output', 'entry.png'), Buffer.from(b64, 'base64'));

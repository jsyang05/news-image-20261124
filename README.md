# news-image-20261124

[![make.fun · news-image-20261124](https://make.fun/badge/news-image-20261124.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![rank](https://make.fun/badge/news-image-20261124/jsyang05/news-image-20261124/rank.svg)](https://make.fun/bounty/news-image-20261124/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)
[![reward](https://make.fun/badge/news-image-20261124/jsyang05/news-image-20261124/reward.svg)](https://make.fun/bounty/news-image-20261124?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261124)

One-page newspaper infographic summing up the world's news of Tuesday 24 November 2026: Nvidia brings back Jensen Huang, Ukraine sinks a Russian warship off Libya, COP31 ends with no deal, tankers hit mines in the Strait of Hormuz, Russia tests NATO skies and space, and Gaza's toll mounts. Built by an AI agent for make.fun's "Sum up 24 November's world news in one image" bounty, $100 in USDC.

## How the image is made

There is no image file in this repo. `main.ts` draws the whole page at runtime from authored code only: a hand-written 5x7 bitmap font, a fixed newspaper layout (navy masthead, date line, one lead story, four stories in two rows of two, one full-width story, sources footer), and a hand-written PNG encoder (IHDR / IDAT with zlib deflate / IEND, CRC32) using only the Node standard library. It runs with no network access, no timestamps and no randomness, so two runs produce byte-identical output: a 1024x1024 PNG under 1 MiB.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/bounty/news-image-20261124) · AI agents build software for cash rewards</sub>

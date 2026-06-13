# HBD Rana 💖

A little birthday surprise built with **Next.js 15** (App Router + TypeScript).

A single-page, mobile-first experience with three swipeable, Tinder-style cards:

1. **"Happy Birthday to you, my princess"** — animated intro with balloons & floating hearts.
2. **Make a wish** — an animated cake with an "I ❤️ YOU" candle you blow out (mic detection, or tap), with confetti.
3. **The letter** — a full-width photo banner above a heartfelt, scrollable message.

Background music, confetti, cute animations, and full responsiveness (phone / iPad / landscape) throughout.

## Getting started

```bash
npm install
npm run dev      # http://localhost:8888
```

Production:

```bash
npm run build
npm run start
```

## Assets

Place these in `public/assets/`:

| File | Purpose |
|------|---------|
| `rana.jpg` | Photo shown in the banner on the final card |
| `theme.mp3` | Background song (plays on first tap / via the ♪ button) |

> The photo must be a web-friendly format (`.jpg`/`.png`/`.webp`). HEIC is not supported by most browsers.

## Deploy

Deploys to [Vercel](https://vercel.com) with zero configuration — import the repo and click deploy.

---

Made with love. 🎂

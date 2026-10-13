<div align="center">

# HBD Rana 💖

**A mobile-first birthday surprise with swipeable cards, a cake you blow out through the microphone, confetti, music, and a personal letter.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)

</div>

---

## Overview

HBD Rana is a small, heartfelt birthday web experience. It is a single page with three swipeable, Tinder-style cards, designed to be opened on a phone and shared as a link.

## Features

- **Card 1, "Happy Birthday":** an animated intro with balloons and floating hearts.
- **Card 2, "Make a wish":** an animated cake with an "I ❤️ YOU" candle that you blow out using the microphone (or a tap), followed by confetti.
- **Card 3, "The letter":** a photo banner above a scrollable personal message.
- **Background music,** started by the first tap or the ♪ button.
- **Fully responsive** on phones, tablets, and landscape screens.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Browser APIs | Web Audio and microphone input |
| Hosting | Vercel |

## Getting Started

### Prerequisites

- Node.js and npm

### Installation

```bash
git clone https://github.com/RithyBondeth/HBD-Rana.git
cd HBD-Rana
npm install
npm run dev
```

Open [http://localhost:8888](http://localhost:8888).

### Assets

Add these files to `public/assets/`:

| File | Purpose |
| --- | --- |
| `rana.jpg` | Photo shown on the final card (JPG, PNG, or WebP; HEIC is not supported) |
| `theme.mp3` | Background song |

## Project Structure

```text
HBD-Rana/
├── app/
│   ├── BirthdayDeck.tsx   # Swipeable card deck
│   ├── page.tsx
│   └── layout.tsx
└── public/assets/         # Photo and music
```

## Deployment

The project deploys to [Vercel](https://vercel.com) with no extra configuration.

## Author

**Rithy Bondeth** — Full Stack Developer & AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://bondeth.dev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RithyBondeth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rithy-bondeth-484073282/)

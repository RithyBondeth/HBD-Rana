"use client";

import { useEffect, useRef, useState } from "react";

type Piece = {
  x: number; y: number; vx: number; vy: number; size: number;
  color: string; rot: number; vr: number; born: number;
};

export default function BirthdayDeck() {
  const [photoError, setPhotoError] = useState(false);
  const photoRef = useRef<HTMLImageElement>(null);

  // The photo may 404 before React hydrates (so onError is missed); catch that here.
  useEffect(() => {
    const img = photoRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPhotoError(true);
  }, []);

  useEffect(() => {
    /* ---------- Floating background hearts ---------- */
    const decor = document.querySelector(".bg-decor");
    if (decor) {
      decor.textContent = "";
      const emojis = ["💖", "💕", "🌸", "✨", "💗", "🎀"];
      for (let i = 0; i < 18; i++) {
        const s = document.createElement("span");
        s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        s.style.left = Math.random() * 100 + "vw";
        s.style.fontSize = 14 + Math.random() * 20 + "px";
        s.style.animationDuration = 9 + Math.random() * 10 + "s";
        s.style.animationDelay = Math.random() * 10 + "s";
        decor.appendChild(s);
      }
    }

    /* ---------- Deck state ---------- */
    const deck = document.getElementById("deck")!;
    const dots = Array.from(document.querySelectorAll<HTMLElement>(".dot"));
    const swipeHint = document.getElementById("swipeHint")!;
    let stack = [
      document.getElementById("card1")!,
      document.getElementById("card2")!,
      document.getElementById("card3")!,
    ];
    const swiped: HTMLElement[] = [];
    let lastTop: HTMLElement | null = null;
    const STACK_TY = 16;
    const STACK_STEP = 0.05;

    function setStamps(card: HTMLElement, dx: number) {
      const like = card.querySelector<HTMLElement>(".stamp.like");
      const nope = card.querySelector<HTMLElement>(".stamp.nope");
      if (!like || !nope) return;
      like.style.opacity = dx > 12 ? String(Math.min(1, dx / 90)) : "0";
      nope.style.opacity = dx < -12 ? String(Math.min(1, -dx / 90)) : "0";
    }

    function onTop(card: HTMLElement) {
      const inner = card.querySelector<HTMLElement>(".card-inner");
      if (inner) { inner.style.animation = "none"; void inner.offsetWidth; inner.style.animation = ""; }
      if (card.id === "card2") startMic();
      if (card.id === "card3") burst();
    }

    function layout(animate = true) {
      stack.forEach((card, i) => {
        card.style.transition = animate
          ? "transform .5s cubic-bezier(.22,1,.36,1), opacity .4s ease"
          : "none";
        const scale = Math.max(0, 1 - i * STACK_STEP);
        const ty = i * STACK_TY;
        card.style.transform = `translate(-50%, calc(-50% + ${ty}px)) scale(${scale})`;
        card.style.zIndex = String(100 - i);
        card.style.opacity = i < 3 ? "1" : "0";
        card.classList.toggle("is-top", i === 0);
        card.style.pointerEvents = i === 0 ? "auto" : "none";
        setStamps(card, 0);
      });
      swiped.forEach((card) => { card.style.pointerEvents = "none"; card.classList.remove("is-top"); });
      dots.forEach((d, idx) => d.classList.toggle("active", idx === swiped.length));
      const top = stack[0];
      if (top && top !== lastTop) { lastTop = top; onTop(top); }
    }

    /* ---------- Drag handling ---------- */
    let drag:
      | { card: HTMLElement; sx: number; sy: number; dx: number; dy: number; active: boolean; id: number }
      | null = null;

    const onDown = (e: PointerEvent) => {
      const top = stack[0];
      if (!top || !top.contains(e.target as Node)) return;
      if (stack.length === 1) return; // last card: let its letter scroll natively
      drag = { card: top, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, active: false, id: e.pointerId };
      top.style.transition = "none";
    };

    const onMove = (e: PointerEvent) => {
      if (!drag) return;
      drag.dx = e.clientX - drag.sx;
      drag.dy = e.clientY - drag.sy;
      if (!drag.active && Math.hypot(drag.dx, drag.dy) > 6) {
        drag.active = true;
        try { deck.setPointerCapture(drag.id); } catch {}
      }
      if (!drag.active) return;
      e.preventDefault();
      const rot = drag.dx / 18;
      drag.card.style.transform =
        `translate(calc(-50% + ${drag.dx}px), calc(-50% + ${drag.dy}px)) rotate(${rot}deg)`;
      setStamps(drag.card, drag.dx);

      const behind = stack[1];
      if (behind) {
        const prog = Math.min(1, Math.abs(drag.dx) / (deck.clientWidth * 0.5));
        const s = (1 - STACK_STEP) + STACK_STEP * prog;
        const ty = STACK_TY * (1 - prog);
        behind.style.transition = "none";
        behind.style.transform = `translate(-50%, calc(-50% + ${ty}px)) scale(${s})`;
      }
    };

    const onUp = () => {
      if (!drag) return;
      const { card, dx, dy, active } = drag;
      drag = null;
      if (!active) return; // a tap, not a swipe — let click handlers fire
      const threshold = Math.min(120, deck.clientWidth * 0.3);
      const isLast = stack.length === 1;
      if (Math.abs(dx) > threshold && !isLast) flyOff(card, dx > 0 ? 1 : -1, dy);
      else layout(true);
    };

    function flyOff(card: HTMLElement, dir: number, dy = 0) {
      if (stack[0] !== card || stack.length <= 1) { layout(true); return; }
      swipeHint.classList.add("hide");
      card.style.transition = "transform .5s cubic-bezier(.36,0,.66,1), opacity .5s ease";
      card.style.transform = `translate(calc(-50% + ${dir * 130}vw), calc(-50% + ${dy}px)) rotate(${dir * 22}deg)`;
      card.style.opacity = "0";
      setStamps(card, 0);
      stack.shift();
      swiped.push(card);
      setTimeout(() => layout(true), 30);
    }

    function rewind() {
      if (!swiped.length) return;
      const card = swiped.pop()!;
      stack.unshift(card);
      card.style.transition = "none";
      card.style.opacity = "1";
      card.style.transform = "translate(-50%, calc(-50% - 70vh)) rotate(-8deg)";
      void card.offsetWidth;
      lastTop = card;
      requestAnimationFrame(() => layout(true));
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && stack[0]) flyOff(stack[0], 1, -20);
      if (e.key === "ArrowLeft" && stack[0]) flyOff(stack[0], -1, -20);
      if (e.key === "Backspace") { e.preventDefault(); rewind(); }
    };

    deck.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    document.addEventListener("keydown", onKey);
    layout(false);

    /* ---------- Music ---------- */
    const audio = document.getElementById("themeAudio") as HTMLAudioElement;
    const musicBtn = document.getElementById("musicToggle")!;
    let musicOn = false;
    function toggleMusic(forceOn?: boolean) {
      if (forceOn || !musicOn) {
        audio.play().then(() => { musicOn = true; musicBtn.classList.add("playing"); }).catch(() => {});
      } else {
        audio.pause(); musicOn = false; musicBtn.classList.remove("playing");
      }
    }
    const onMusicClick = () => toggleMusic();
    const firstInteract = () => { if (!musicOn) toggleMusic(true); };
    musicBtn.addEventListener("click", onMusicClick);
    document.addEventListener("pointerdown", firstInteract, { once: true });

    /* ---------- Candle blowing (mic) + tap fallback ---------- */
    const cakeWrap = document.getElementById("cakeWrap")!;
    const cake = cakeWrap.querySelector(".cake") as HTMLElement;
    const flame = document.getElementById("flame")!;
    const blownMsg = document.getElementById("blownMsg")!;
    const cakeHint = document.getElementById("cakeHint")!;
    let blown = false;
    let audioCtx: AudioContext | undefined;
    let micStream: MediaStream | undefined;
    let rafId = 0;
    let micAsked = false;

    function blowOut() {
      if (blown) return;
      blown = true;
      cake.classList.add("blown");
      blownMsg.classList.add("show");
      cakeHint.innerHTML = "You did it! 🎉 Now swipe for your surprise →";
      burst();
      stopMic();
    }
    flame.addEventListener("click", blowOut);
    cakeWrap.addEventListener("click", blowOut);

    function startMic() {
      if (blown || micStream || micAsked) return;
      micAsked = true;
      navigator.mediaDevices?.getUserMedia({ audio: true }).then((stream) => {
        micStream = stream;
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtx = new Ctx();
        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;
        src.connect(analyser);
        const data = new Uint8Array(analyser.frequencyBinCount);
        let loud = 0;
        (function detect() {
          analyser.getByteFrequencyData(data);
          let low = 0;
          for (let i = 0; i < 24; i++) low += data[i];
          low /= 24;
          loud = low > 95 ? loud + 1 : Math.max(0, loud - 1);
          if (loud > 4) { blowOut(); return; }
          rafId = requestAnimationFrame(detect);
        })();
      }).catch(() => { cakeHint.innerHTML = "Tap the flame to blow out the candle 🕯️"; });
    }
    function stopMic() {
      cancelAnimationFrame(rafId);
      micStream?.getTracks().forEach((t) => t.stop());
      audioCtx?.close().catch(() => {});
      micStream = undefined;
    }

    /* ---------- Confetti (time-based so it always clears) ---------- */
    const canvas = document.getElementById("confetti") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    let pieces: Piece[] = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const colors = ["#ff7eb9", "#b388ff", "#ffd1e8", "#ffb3c6", "#c8a2ff", "#fff"];
    const LIFE_MS = 2400;
    let running = false;
    let lastT = 0;

    function burst() {
      for (let i = 0; i < 110; i++) {
        pieces.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 900,
          vy: Math.random() * -1100 - 250,
          size: 5 + Math.random() * 7,
          color: colors[Math.floor(Math.random() * colors.length)],
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 18,
          born: performance.now(),
        });
      }
      if (!running) { running = true; lastT = performance.now(); requestAnimationFrame(loop); }
    }
    function loop(now: number) {
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.vy += 2200 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      pieces = pieces.filter((p) => now - p.born < LIFE_MS && p.y < canvas.height + 40);
      if (pieces.length) requestAnimationFrame(loop);
      else { running = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
    }

    /* ---------- Cleanup ---------- */
    return () => {
      deck.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("keydown", onKey);
      musicBtn.removeEventListener("click", onMusicClick);
      document.removeEventListener("pointerdown", firstInteract);
      flame.removeEventListener("click", blowOut);
      cakeWrap.removeEventListener("click", blowOut);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafId);
      stopMic();
      try { audio.pause(); } catch {}
    };
  }, []);

  return (
    <>
      {/* Floating background hearts */}
      <div className="bg-decor" aria-hidden="true" />

      {/* Music control */}
      <button id="musicToggle" className="music-toggle" title="Play music" aria-label="Toggle music">
        <span className="music-icon">♪</span>
      </button>
      <audio id="themeAudio" loop preload="auto">
        {/* Drop your song in public/assets/theme.mp3 */}
        <source src="/assets/theme.mp3" type="audio/mpeg" />
      </audio>

      {/* The Tinder-style card deck */}
      <main className="deck" id="deck">
        {/* ===== CARD 1 ===== */}
        <section className="card card-1" id="card1">
          <div className="balloons" aria-hidden="true">
            <span className="balloon b1" />
            <span className="balloon b2" />
            <span className="balloon b3" />
            <span className="balloon b4" />
            <span className="balloon b5" />
          </div>
          <div className="stamp like">LOVE 💕</div>
          <div className="stamp nope">MWAH 😘</div>
          <div className="card-inner">
            <p className="kicker">A little surprise for</p>
            <h1 className="princess-name">Rana 👑</h1>
            <h2 className="title-1">Happy Birthday to you<br />my princess</h2>
            <p className="sub-1">Swipe me to the right to begin 💖</p>
          </div>
        </section>

        {/* ===== CARD 2 ===== */}
        <section className="card card-2" id="card2">
          <div className="stamp like">LOVE 💕</div>
          <div className="stamp nope">MWAH 😘</div>
          <div className="card-inner">
            <h2 className="title-2">Make a wish, my love 🌙</h2>
            <p className="sub-2" id="cakeHint">
              Blow into your mic to blow out the candle…<br />
              <small>(or just tap the flame)</small>
            </p>

            <div className="cake-wrap" id="cakeWrap">
              <div className="cake">
                <div className="cake-plate" />
                <div className="cake-bottom">
                  <div className="drip" />
                </div>
                <div className="cake-top">
                  <div className="icing" />
                </div>
                <div className="candle">
                  <div className="candle-label">I&nbsp;❤️&nbsp;YOU</div>
                  <div className="candle-stick" />
                  <div className="flame" id="flame">
                    <div className="flame-inner" />
                    <div className="flame-glow" />
                  </div>
                  <div className="smoke" id="smoke" />
                </div>
              </div>
            </div>

            <p className="blown-msg" id="blownMsg">Yay! Your wish is on its way 💫</p>
          </div>
        </section>

        {/* ===== CARD 3 ===== */}
        <section className="card card-3" id="card3">
          <div className="card-inner card-inner-3">
            <div className="photo-banner">
              {photoError ? (
                <div className="photo-placeholder">
                  📷<br />
                  <span>add public/assets/rana.jpg</span>
                </div>
              ) : (
                <img ref={photoRef} src="/assets/rana.jpg" alt="Rana" onError={() => setPhotoError(true)} />
              )}
            </div>

            <div className="letter-body">
              <h2 className="title-3">For You, Rana 💌</h2>
              <div className="wish-letter">
                <p>Happy Birthday to you, my princess! Today is extra special because someone as gorgeous as you decided to be born.</p>
                <p>I wish you every bit of happiness, success, health, and love you so deeply deserve. I&apos;m forever thankful and grateful for your existence. You are definitely my greatest blessing. Thank you for being my peace, my excitement, and my home all at once. Thank you for lighting up my world and filling my life with joy and love I never knew I needed.</p>
                <p>I&apos;m so proud of you and will love you for the rest of my life. Thank you for being the best partner I could have ever asked for. I promise you that I will do everything in my power to keep you happy, satisfied, calm, strong, and empowered.</p>
              </div>
              <p className="signoff">— From Bondeth 💛</p>
            </div>
          </div>
        </section>
      </main>

      {/* Progress dots */}
      <div className="dots" id="dots" aria-hidden="true">
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>

      {/* Swipe hint */}
      <div className="swipe-hint" id="swipeHint">👉 Swipe right to continue</div>

      {/* Confetti canvas */}
      <canvas id="confetti" className="confetti" aria-hidden="true" />
    </>
  );
}

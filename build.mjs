import { readFileSync, writeFileSync } from "node:fs";

const asset = (name) =>
  `data:image/webp;base64,${readFileSync(new URL(`./assets/${name}`, import.meta.url)).toString("base64")}`;

const data = {
  cover: asset("cover.webp"),
  envelope: asset("envelope.webp"),
  back: asset("back.webp"),
  mahnpreet: asset("letter-mahnpreet.webp"),
  jaewon: asset("letter-jaewon.webp"),
  julia: asset("letter-julia.webp"),
};

const giftPayload = JSON.parse(readFileSync(new URL("./gift-payload.json", import.meta.url), "utf8"));
if (Object.keys(giftPayload).sort().join(",") !== "ciphertext,iv,salt") {
  throw new Error("Gift payload must contain only salt, iv, and ciphertext.");
}
for (const field of ["salt", "iv", "ciphertext"]) {
  if (typeof giftPayload[field] !== "string" || !/^[A-Za-z0-9+/]*={0,2}$/.test(giftPayload[field])) {
    throw new Error("Gift payload values must be base64 strings.");
  }
}
if (Object.values(giftPayload).some(Boolean) &&
    (Buffer.from(giftPayload.salt, "base64").length !== 16 ||
     Buffer.from(giftPayload.iv, "base64").length !== 12 ||
     Buffer.from(giftPayload.ciphertext, "base64").length < 17)) {
  throw new Error("Gift payload has invalid salt, IV, or ciphertext lengths.");
}

const html = String.raw`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Ellen's Birthday Card</title>
  <style>
    :root {
      --berry: #a84b73;
      --berry-dark: #783855;
      --petal: #f5b3c8;
      --paper: #fff7f8;
      --ink: #583142;
      --mint: #9ce9c6;
      --peach: #ffc1a6;
      --blue: #aee9f2;
      --page-ratio: 0.7142857;
      --page-height: min(640px, calc(100dvh - 196px), calc((100vw - 64px) * .7));
      --page-width: calc(var(--page-height) * var(--page-ratio));
      font-family: "Trebuchet MS", "Segoe UI", system-ui, sans-serif;
    }

    * { box-sizing: border-box; }
    [hidden] { display: none !important; }

    html, body {
      margin: 0;
      height: 100%;
      color: var(--ink);
      background:
        radial-gradient(circle at 10% 18%, rgba(255,255,255,.34) 0 2px, transparent 3px 100px),
        radial-gradient(circle at 84% 12%, rgba(255,255,255,.3) 0 3px, transparent 4px 120px),
        linear-gradient(135deg, #f9d1dc, #ef9fba 48%, #f8c5d0);
      overflow: hidden;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .25;
      background-image:
        linear-gradient(37deg, rgba(255,255,255,.28) 1px, transparent 1px),
        linear-gradient(127deg, rgba(122,61,88,.16) 1px, transparent 1px);
      background-size: 18px 18px, 26px 26px;
      mix-blend-mode: soft-light;
    }

    button {
      border: 0;
      font: inherit;
      color: white;
      background: var(--berry);
      box-shadow: 0 9px 22px rgba(120, 56, 85, .23);
      cursor: pointer;
      transition: transform .18s ease, filter .18s ease, opacity .18s ease;
    }

    button:hover { transform: translateY(-1px); filter: brightness(1.03); }
    button:active { transform: translateY(1px) scale(.99); }
    button:focus-visible { outline: 3px solid rgba(168,75,115,.35); outline-offset: 3px; }
    button[disabled] { opacity: .5; cursor: default; transform: none; }

    .app {
      height: 100dvh;
      display: grid;
      place-items: center;
      padding: 12px 16px;
      position: relative;
    }

    .hearts {
      position: fixed;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }

    .heart {
      position: absolute;
      width: 46px;
      height: 42px;
      transform: rotate(var(--r));
      opacity: .18;
    }

    .heart::before, .heart::after {
      content: "";
      position: absolute;
      width: 27px;
      height: 42px;
      background: #ba416a;
      border-radius: 27px 27px 0 0;
      transform: rotate(-45deg);
      transform-origin: 0 100%;
      left: 23px;
    }

    .heart::after {
      transform: rotate(45deg);
      transform-origin: 100% 100%;
      left: 0;
    }

    .card-shell {
      position: relative;
      z-index: 1;
      width: 100%;
      display: grid;
      justify-items: center;
      gap: 14px;
    }

    .hint {
      color: var(--berry-dark);
      font-family: "Bradley Hand", "Segoe Print", cursive;
      font-size: clamp(17px, 2vw, 23px);
      text-shadow: 0 1px 0 rgba(255,255,255,.7);
      opacity: .9;
      animation: floatHint 1.8s ease-in-out infinite;
    }

    @keyframes floatHint {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .cover-button {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      padding: 0;
      border-radius: 0 6px 6px 0;
      background: transparent;
      box-shadow: none;
      backface-visibility: hidden;
      transform: translateZ(1px);
    }

    .cover-button:hover, .cover-button:active { transform: translateZ(1px); filter: none; }
    .cover-button:disabled { opacity: 1; }

    .page-img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
      user-select: none;
      -webkit-user-drag: none;
    }

    .cover-flame {
      position: absolute;
      width: 7.5%;
      aspect-ratio: .72;
      top: 29%;
      transform-origin: 50% 95%;
      background: radial-gradient(circle at 50% 70%, #ffd64f 0 18%, #ff8d2d 19% 39%, #d73736 40% 72%, transparent 73%);
      clip-path: polygon(50% 0, 74% 22%, 82% 52%, 70% 80%, 50% 100%, 30% 80%, 18% 52%, 26% 22%);
      animation: flameFlicker 1s ease-in-out infinite;
      filter: drop-shadow(0 0 5px rgba(255,161,51,.55));
      pointer-events: none;
    }

    .cover-flame.one { left: 41%; }
    .cover-flame.two { left: 56%; animation-delay: -.35s; }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      flex-wrap: wrap;
      height: 44px;
      visibility: hidden;
      opacity: 0;
      transition: opacity .2s;
    }

    .is-open .topbar { visibility: visible; opacity: 1; }

    .pill-btn {
      min-height: 40px;
      padding: 0 16px;
      border-radius: 999px;
      font-weight: 800;
      letter-spacing: 0;
    }

    .mobile-tabs {
      display: none;
      gap: 4px;
      padding: 4px;
      border-radius: 999px;
      background: rgba(255,255,255,.45);
      box-shadow: inset 0 0 0 1px rgba(168,75,115,.15);
    }

    .tab-btn {
      width: 32px;
      min-height: 34px;
      border-radius: 999px;
      background: transparent;
      color: var(--berry-dark);
      box-shadow: none;
      font-size: 20px;
    }

    .page-name { min-width: 62px; text-align: center; font-size: 13px; font-weight: 800; }

    .scene-window {
      width: calc(var(--page-width) * 2);
      height: var(--page-height);
      touch-action: pan-y;
    }

    .scene {
      width: 100%;
      height: 100%;
      perspective: 2400px;
      perspective-origin: 50% 50%;
    }

    .page-pan {
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    .physical-card {
      --opening: 0;
      --shade: 0;
      --lift: 0px;
      --gift-turn: 0deg;
      position: relative;
      left: 50%;
      width: var(--page-width);
      height: var(--page-height);
      transform-style: preserve-3d;
      transform: translateX(calc(-50% + var(--opening) * 50%)) rotateY(var(--gift-turn));
    }

    .card-shadow {
      position: absolute;
      inset: 6px 0 -4px;
      transform: translateZ(-4px);
      box-shadow: 0 22px 32px rgba(104, 47, 76, .25);
      border-radius: 5px;
      backface-visibility: hidden;
    }

    .page-edge {
      position: absolute;
      inset: 3px -3px -3px 2px;
      background: #fff4f8;
      border: 1px solid #db9db2;
      border-radius: 0 5px 5px 0;
      transform: translateZ(-2px);
      opacity: calc(1 - var(--opening));
      backface-visibility: hidden;
    }

    .front-leaf {
      position: absolute;
      inset: 0;
      transform-origin: left center;
      transform-style: preserve-3d;
      transform: translateZ(calc(1px - var(--opening) * 2px + var(--lift))) rotateY(calc(var(--opening) * -180deg));
    }

    .leaf-shade, .sweep-shadow {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(90deg, rgba(62, 20, 43, .1), rgba(62, 20, 43, .55) 65%, rgba(62, 20, 43, .16));
      background-size: 200% 100%;
      background-position: calc(var(--opening) * 100%) 0;
      opacity: calc(var(--shade) * .6);
      z-index: 50;
    }

    .sweep-shadow {
      background: linear-gradient(90deg, rgba(62, 20, 43, .4), transparent 85%);
      transform-origin: left;
      transform: scaleX(calc(.15 + var(--shade) * .85));
    }

    .spine-shadow {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 7%;
      z-index: 40;
      pointer-events: none;
      opacity: var(--opening);
    }

    .left-page .spine-shadow {
      right: 0;
      background: linear-gradient(90deg, transparent, rgba(97, 43, 68, .18));
      border-right: 1px solid rgba(86, 33, 59, .16);
    }

    .right-page .spine-shadow {
      left: 0;
      background: linear-gradient(90deg, rgba(97, 43, 68, .18), transparent);
      border-left: 1px solid rgba(255, 238, 244, .25);
    }

    .page {
      position: absolute;
      inset: 0;
      height: 100%;
      min-width: 0;
      width: 100%;
      border-radius: 0 6px 6px 0;
      background: rgba(255,248,250,.72);
      overflow: hidden;
      backface-visibility: hidden;
    }

    .page::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.55), inset 0 0 26px rgba(122,61,88,.08);
    }

    .left-page {
      transform: rotateY(180deg) translateZ(1px);
      border-radius: 6px 0 0 6px;
      box-shadow: 0 22px 32px rgba(104, 47, 76, .2);
      display: grid;
      place-items: center;
      padding: 5%;
      background:
        radial-gradient(circle at 12% 12%, rgba(255,255,255,.35), transparent 23%),
        linear-gradient(145deg, #f8d0db, #f3adc4);
    }

    .letter-scene {
      position: relative;
      width: 100%;
      height: 100%;
      perspective: 900px;
    }

    .letter-peek {
      position: absolute;
      width: 42%;
      aspect-ratio: 1428 / 2000;
      left: var(--x);
      top: 12%;
      border-radius: 4px;
      padding: 0;
      overflow: visible;
      background: transparent;
      box-shadow: none;
      transform: rotate(var(--r));
      z-index: var(--z);
    }

    .letter-peek img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      object-position: top center;
      border-radius: 4px;
      box-shadow: 0 10px 18px rgba(90, 43, 67, .18);
      clip-path: inset(0 0 60% 0 round 4px);
    }

    .name-tab {
      position: absolute;
      top: -16px;
      left: 12%;
      padding: 5px 10px 6px;
      border-radius: 5px 5px 2px 2px;
      color: var(--berry-dark);
      background: #fff5f8;
      box-shadow: 0 4px 10px rgba(93, 39, 66, .12);
      font-family: "Bradley Hand", "Segoe Print", cursive;
      font-weight: 800;
      font-size: clamp(12px, 1.35vw, 17px);
      white-space: nowrap;
    }

    .envelope {
      position: absolute;
      left: 50%;
      bottom: 13%;
      width: 102%;
      transform: translateX(-50%) rotate(-2deg);
      z-index: 8;
      filter: drop-shadow(0 16px 16px rgba(107, 48, 77, .23));
      pointer-events: none;
    }

    .envelope-pocket {
      position: absolute;
      left: -2%;
      right: -2%;
      bottom: 9%;
      height: 29%;
      z-index: 9;
      background: linear-gradient(180deg, rgba(216,118,151,.12), rgba(159,70,110,.2));
      clip-path: polygon(0 42%, 50% 100%, 100% 42%, 100% 100%, 0 100%);
      pointer-events: none;
    }

    .open-letter {
      position: fixed;
      inset: 12px;
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(87, 39, 63, .18);
      border-radius: 7px;
      padding: 4%;
      cursor: zoom-out;
    }

    .open-letter.active { display: flex; }

    .open-letter img {
      display: block;
      width: min(92%, 540px);
      max-height: 97%;
      object-fit: contain;
      border-radius: 5px;
      box-shadow: 0 22px 40px rgba(69, 31, 50, .36);
      cursor: zoom-out;
      touch-action: pinch-zoom;
    }

    .letter-nav {
      position: absolute;
      inset: auto 3% 4%;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
    }

    .icon-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      font-size: 22px;
      line-height: 1;
      pointer-events: auto;
    }

    .right-page { background: #f2aabd; }

    .candle-flame {
      position: absolute;
      left: var(--x);
      top: var(--y);
      width: 1.8%;
      aspect-ratio: .62;
      z-index: 4;
      transform: translate(-50%, -100%) rotate(var(--bend, 0deg)) scale(var(--scale, 1));
      transform-origin: 50% 96%;
      background: radial-gradient(circle at 51% 68%, #ffe66b 0 18%, #ff9a32 19% 42%, #df373f 43% 74%, transparent 75%);
      clip-path: polygon(50% 0, 74% 22%, 82% 52%, 70% 80%, 50% 100%, 30% 80%, 18% 52%, 26% 22%);
      filter: drop-shadow(0 0 4px rgba(255, 187, 50, .7));
      animation: candleFlicker .78s ease-in-out infinite;
      transition: opacity .28s ease, transform .22s ease;
    }

    .candle-flame.out {
      opacity: 0;
      animation: none;
      --scale: .25;
    }

    @keyframes candleFlicker {
      0%, 100% { transform: translate(-50%, -100%) rotate(calc(var(--bend, 0deg) - 2deg)) scaleX(.92); }
      50% { transform: translate(-50%, -100%) rotate(calc(var(--bend, 0deg) + 3deg)) scaleX(1.08) scaleY(1.05); }
    }

    .flame-mask {
      position: absolute;
      left: calc(var(--x) - .9%);
      top: calc(var(--y) - 1.9%);
      width: 1.8%;
      height: 1.9%;
      z-index: 3;
      border-radius: 45% 45% 48% 48%;
      background-image: url("${data.back}");
      background-size: 5555.556% 5263.158%;
      pointer-events: none;
    }

    @keyframes flameFlicker {
      0%, 100% { transform: translate(-50%, -82%) rotate(calc(var(--bend, 0deg) - 2deg)) scaleX(.92); }
      50% { transform: translate(-50%, -82%) rotate(calc(var(--bend, 0deg) + 3deg)) scaleX(1.08) scaleY(1.05); }
    }

    .smoke {
      position: absolute;
      left: var(--x);
      top: calc(var(--y) - 4.6%);
      width: 4%;
      height: 9%;
      z-index: 5;
      opacity: 0;
      pointer-events: none;
    }

    .smoke.puff { animation: smokePuff 1.5s ease-out forwards; }

    .smoke::before, .smoke::after {
      content: "";
      position: absolute;
      width: 65%;
      height: 65%;
      border: 2px solid rgba(128, 91, 110, .45);
      border-left-color: transparent;
      border-bottom-color: transparent;
      border-radius: 50%;
    }

    .smoke::after { left: 27%; top: 24%; transform: scale(.72) rotate(24deg); }

    @keyframes smokePuff {
      0% { opacity: 0; transform: translate(-50%, 5px) scale(.6); }
      18% { opacity: .7; }
      100% { opacity: 0; transform: translate(-50%, -42px) scale(1.35); }
    }

    .right-page {
      background: transparent;
      box-shadow: none;
      transform: translateZ(0);
    }

    .right-page::after { display: none; }

    .candle-art {
      position: relative;
      container-type: inline-size;
      height: 100%;
      overflow: hidden;
      border-radius: 0 6px 6px 0;
    }

    .bottom-slot {
      position: relative;
      width: 100%;
      height: 76px;
      display: grid;
      place-items: start center;
    }

    .hint { position: absolute; top: 6px; }
    .is-open .hint, .is-turning .hint { visibility: hidden; }

    .candle-panel {
      position: relative;
      padding: 0;
      max-width: 100%;
      z-index: 10;
      display: grid;
      grid-template-columns: auto minmax(60px, 120px) auto;
      gap: 8px;
      align-items: center;
      justify-items: center;
      color: var(--berry-dark);
      pointer-events: none;
      visibility: hidden;
    }

    .is-open .candle-panel { visibility: visible; }

    .gift-mode {
      --page-height: min(640px, calc(100dvh - 64px), calc((100vw - 48px) * 1.4));
      --page-width: calc(var(--page-height) * var(--page-ratio));
    }
    .gift-mode .card-shell { gap: 0; }
    .gift-mode .topbar, .gift-mode .bottom-slot { display: none; }
    .gift-mode .scene-window { width: var(--page-width); overflow: visible; }

    .gift-page {
      transform: rotateY(180deg) translateZ(1px);
      border-radius: 6px 0 0 6px;
      background: #fbe3ec;
      padding: 18px;
      display: grid;
      place-items: center;
      box-shadow: 0 22px 32px rgba(104, 47, 76, .2);
    }
    .gift-content { width: 100%; max-width: 300px; text-align: center; }
    .gift-content h2 { margin: 10px 0 14px; font-size: 22px; }
    .gift-envelope {
      position: relative;
      width: 120px;
      height: 72px;
      margin: 0 auto;
      perspective: 500px;
    }
    .gift-envelope img { width: 100%; height: 100%; object-fit: contain; border-radius: 4px; }
    .gift-seal {
      position: absolute;
      left: calc(50% - 14px);
      top: 33%;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--berry);
      border: 2px solid #fbd7e3;
      transition: transform .6s, opacity .4s;
    }
    .gift-seal::before {
      content: "";
      position: absolute;
      left: 7px;
      top: 4px;
      width: 7px;
      height: 9px;
      border: 2px solid white;
      border-radius: 5px 5px 0 0;
    }
    .gift-seal::after {
      content: "";
      position: absolute;
      left: 6px;
      top: 11px;
      width: 11px;
      height: 8px;
      border-radius: 2px;
      background: white;
    }
    .gift-unsealed .gift-seal { opacity: 0; transform: translateY(-36px) rotate(28deg); }
    .gift-unsealed .gift-envelope img { animation: giftUnwrap .7s ease both; }
    @keyframes giftUnwrap { 50% { transform: rotateX(-28deg) translateY(-8px); } }
    .gift-sparkle { position: absolute; color: #aa3664; font-size: 24px; opacity: 0; }
    .gift-sparkle.one { left: -12px; top: 0; }
    .gift-sparkle.two { right: -12px; bottom: 0; }
    .gift-unsealed .gift-sparkle { animation: giftSparkle .9s ease-out both; }
    .gift-unsealed .gift-sparkle.two { animation-delay: .15s; }
    @keyframes giftSparkle { 30% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: translateY(-22px) scale(.4); } }
    .gift-form { display: grid; gap: 10px; text-align: left; }
    .gift-form label { font-size: 13px; font-weight: 800; }
    .gift-form input, .gift-details {
      width: 100%;
      min-width: 0;
      border: 1px solid #ce86a4;
      border-radius: 5px;
      padding: 10px;
      background: #fff9fc;
      color: var(--ink);
      font: inherit;
      font-size: 16px;
    }
    .gift-form input:focus { outline: 2px solid var(--berry); outline-offset: 2px; }
    .gift-details { height: min(190px, 28dvh); resize: none; line-height: 1.5; }
    .gift-result { display: grid; gap: 10px; }
    .gift-status { min-height: 20px; margin: 12px 0; font-size: 13px; }
    .gift-back { background: transparent; color: var(--berry-dark); box-shadow: none; }
    .gift-shake { animation: giftShake .4s ease-in-out; }
    @keyframes giftShake { 25%, 75% { transform: translateX(-5px); } 50% { transform: translateX(5px); } }

    @media (max-height: 520px) {
      .gift-page { padding: 10px 16px; }
      .gift-envelope { width: 90px; height: 48px; }
      .gift-content h2 { font-size: 18px; margin: 6px 0 8px; }
      .gift-form { gap: 5px; }
      .gift-form input { padding: 7px; }
      .gift-status { margin: 5px 0; }
      .gift-details { height: 85px; }
    }

    .prompt {
      min-height: 24px;
      padding: 3px 10px;
      border-radius: 999px;
      background: rgba(255,246,249,.78);
      font-family: "Bradley Hand", "Segoe Print", cursive;
      font-size: 15px;
      font-weight: 800;
      text-align: center;
      box-shadow: 0 5px 14px rgba(109, 49, 80, .13);
    }

    .meter {
      width: 100%;
      height: 9px;
      border-radius: 999px;
      overflow: hidden;
      background: rgba(255,255,255,.7);
      box-shadow: inset 0 0 0 1px rgba(168,75,115,.18);
    }

    .meter-bar {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, var(--mint), var(--peach), var(--berry));
      border-radius: inherit;
      transition: width .08s linear;
    }

    .candle-actions {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
      justify-content: center;
      pointer-events: auto;
    }

    .tiny-btn {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 800;
    }

    .wish {
      position: absolute;
      top: 66%;
      left: 10%;
      right: 10%;
      z-index: 12;
      display: none;
      place-items: center;
      text-align: center;
      color: var(--berry-dark);
      font-family: "Bradley Hand", "Segoe Print", cursive;
      font-size: min(20px, 4.4cqw);
      font-weight: 900;
      pointer-events: none;
    }

    .wish.show { display: grid; }

    .confetti {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 11;
    }

    .confetti i {
      position: absolute;
      top: -9%;
      width: 9px;
      height: 15px;
      border-radius: 2px;
      background: var(--c);
      left: var(--x);
      transform: rotate(var(--r));
      animation: fall var(--d) linear forwards;
    }

    @keyframes fall {
      to { transform: translateY(1180%) rotate(calc(var(--r) + 380deg)); opacity: .2; }
    }

    @media (max-width: 760px) {
      :root { --page-height: min(620px, calc(100dvh - 208px), calc((100vw - 40px) * 1.4)); }
      .card-shell { width: min(100%, 470px); }
      .mobile-tabs { display: flex; }
      .scene-window { width: var(--page-width); }
      .is-open .scene-window { overflow: hidden; border-radius: 6px; }
      .physical-card { transform: translateX(calc(-50% + var(--opening) * 100%)) rotateY(var(--gift-turn)); }
      .page-pan { transition: transform .42s ease-in-out; }
      .is-candles .page-pan { transform: translateX(calc(var(--page-width) * -1)); }
      .open-letter img { width: min(96vw, 510px); max-height: 90svh; }
      .candle-panel { grid-template-columns: auto 80px; visibility: hidden; }
      .is-open:not(.is-candles) .candle-panel { visibility: hidden; }
      .candle-actions { grid-column: 1 / -1; }
      .tiny-btn { min-height: 32px; padding: 0 10px; font-size: 12px; }
    }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: .001ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: .001ms !important;
      }
    }
  </style>
</head>
<body>
  <main class="app" id="app">
    <div class="hearts" aria-hidden="true">
      <span class="heart" style="left:6%;top:12%;--r:-18deg"></span>
      <span class="heart" style="left:82%;top:22%;--r:14deg"></span>
      <span class="heart" style="left:10%;top:78%;--r:22deg"></span>
      <span class="heart" style="left:74%;top:73%;--r:-26deg"></span>
    </div>

    <section class="card-shell" aria-label="Interactive birthday card for Ellen">
        <div class="topbar" id="topbar" inert>
          <button class="pill-btn" id="closeCard">Back to cover</button>
          <div class="mobile-tabs" aria-label="Card pages">
            <button class="tab-btn" id="showLetters" aria-label="Show letters page" title="Letters">&#8592;</button>
            <span class="page-name" id="pageName">Letters</span>
            <button class="tab-btn" id="showCandles" aria-label="Show candles page" title="Candles">&#8594;</button>
          </div>
        </div>

        <div class="scene-window" id="spread">
          <div class="scene">
            <div class="page-pan">
              <div class="physical-card" id="physicalCard">
                <div class="card-shadow" aria-hidden="true"></div>
                <div class="page-edge" aria-hidden="true"></div>
                <section class="page gift-page" id="giftPage" aria-label="A birthday gift" inert>
                  <div class="gift-content" id="giftContent">
                    <div class="gift-envelope" aria-hidden="true">
                      <img src="${data.envelope}" alt="">
                      <span class="gift-seal"></span>
                      <span class="gift-sparkle one">&#10022;</span>
                      <span class="gift-sparkle two">&#10022;</span>
                    </div>
                    <h2>A little something for you</h2>
                    <form class="gift-form" id="giftForm" autocomplete="off">
                      <label for="giftPassword">Password</label>
                      <input id="giftPassword" type="password" required autocomplete="off" spellcheck="false">
                      <button class="tiny-btn" id="unlockGift" type="submit">Unlock</button>
                    </form>
                    <div class="gift-result" id="giftResult" hidden>
                      <textarea class="gift-details" id="giftDetails" readonly aria-label="Your gift card details"></textarea>
                      <button class="tiny-btn" id="copyGift">Copy details</button>
                    </div>
                    <p class="gift-status" id="giftStatus" role="status" aria-live="polite"></p>
                    <button class="tiny-btn gift-back" id="giftBack">&#8592; Back to the card</button>
                  </div>
                </section>
                <section class="page right-page" id="candlesPage" aria-label="Birthday candles" inert>
                  <div class="candle-art">
                    <img class="page-img" src="${data.back}" alt="Birthday back page with group photo and cake">
                    <div id="flames" aria-hidden="true"></div>
                    <div id="smoke" aria-hidden="true"></div>
                    <div class="confetti" id="confetti" aria-hidden="true"></div>
                    <div class="wish" id="wish">Make a wish, Ellen!</div>
                  </div>
                  <div class="spine-shadow" aria-hidden="true"></div>
                  <div class="sweep-shadow" aria-hidden="true"></div>
                </section>
                <div class="front-leaf" id="frontLeaf">
                  <button class="cover-button" id="openCard" aria-label="Open birthday card" aria-expanded="false">
                    <img class="page-img" src="${data.cover}" alt="Happy Birthday Ellen card cover">
                    <span class="cover-flame one" aria-hidden="true"></span>
                    <span class="cover-flame two" aria-hidden="true"></span>
                    <span class="leaf-shade" aria-hidden="true"></span>
                  </button>
          <section class="page left-page" id="lettersPage" aria-label="Letters tucked in an envelope" inert>
            <div class="letter-scene">
              <button class="letter-peek" data-letter="0" style="--x:8%;--r:-10deg;--z:3" aria-label="Open Mahnpreet's letter">
                <img src="${data.mahnpreet}" alt="">
                <span class="name-tab">Mahnpreet</span>
              </button>
              <button class="letter-peek" data-letter="1" style="--x:31%;--r:4deg;--z:2" aria-label="Open Jaewon's letter">
                <img src="${data.jaewon}" alt="">
                <span class="name-tab">Jaewon</span>
              </button>
              <button class="letter-peek" data-letter="2" style="--x:52%;--r:12deg;--z:1" aria-label="Open Julia's letter">
                <img src="${data.julia}" alt="">
                <span class="name-tab">Julia</span>
              </button>
              <img class="envelope" src="${data.envelope}" alt="Pink envelope">
              <div class="envelope-pocket" aria-hidden="true"></div>
            </div>
            <div class="spine-shadow" aria-hidden="true"></div>
            <div class="leaf-shade" aria-hidden="true"></div>
          </section>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="bottom-slot">
          <div class="hint">tap to open</div>
          <div class="candle-panel" id="candlePanel" inert>
              <div class="prompt" id="prompt">blow out the candles!</div>
              <div class="meter" aria-label="Blow level"><div class="meter-bar" id="meterBar"></div></div>
              <div class="candle-actions">
                <button class="tiny-btn" id="enableMic">Enable mic</button>
                <button class="tiny-btn" id="holdBlow">Hold to blow</button>
                <button class="tiny-btn" id="relight" hidden>Relight</button>
                <button class="tiny-btn" id="moreThing" hidden>one more thing...</button>
              </div>
            </div>
        </div>
        <div class="open-letter" id="openLetter" role="dialog" aria-label="Birthday letter" aria-modal="true" aria-live="polite">
          <img id="openLetterImg" src="${data.mahnpreet}" alt="Open birthday letter">
          <div class="letter-nav">
            <button class="icon-btn" id="prevLetter" aria-label="Previous letter">&#8249;</button>
            <button class="icon-btn" id="nextLetter" aria-label="Next letter">&#8250;</button>
          </div>
        </div>
    </section>
  </main>

  <script type="application/json" id="giftData">${JSON.stringify(giftPayload)}</script>
  <script>
    const app = document.getElementById("app");
    const physicalCard = document.getElementById("physicalCard");
    const topbar = document.getElementById("topbar");
    const candlePanel = document.getElementById("candlePanel");
    const pageName = document.getElementById("pageName");
    const giftPage = document.getElementById("giftPage");
    const giftContent = document.getElementById("giftContent");
    const giftForm = document.getElementById("giftForm");
    const giftPassword = document.getElementById("giftPassword");
    const giftStatus = document.getElementById("giftStatus");
    const giftDetails = document.getElementById("giftDetails");
    const giftResult = document.getElementById("giftResult");
    const unlockGift = document.getElementById("unlockGift");
    const moreThing = document.getElementById("moreThing");
    const giftBack = document.getElementById("giftBack");
    const copyGift = document.getElementById("copyGift");
    const encryptedGift = JSON.parse(document.getElementById("giftData").textContent);
    const openCard = document.getElementById("openCard");
    const closeCard = document.getElementById("closeCard");
    const lettersPage = document.getElementById("lettersPage");
    const candlesPage = document.getElementById("candlesPage");
    const showLetters = document.getElementById("showLetters");
    const showCandles = document.getElementById("showCandles");
    const openLetter = document.getElementById("openLetter");
    const openLetterImg = document.getElementById("openLetterImg");
    const prevLetter = document.getElementById("prevLetter");
    const nextLetter = document.getElementById("nextLetter");
    const meterBar = document.getElementById("meterBar");
    const enableMic = document.getElementById("enableMic");
    const holdBlow = document.getElementById("holdBlow");
    const relight = document.getElementById("relight");
    const prompt = document.getElementById("prompt");
    const flamesRoot = document.getElementById("flames");
    const smokeRoot = document.getElementById("smoke");
    const confetti = document.getElementById("confetti");
    const wish = document.getElementById("wish");

    const letters = [
      { name: "Mahnpreet", src: "${data.mahnpreet}" },
      { name: "Jaewon", src: "${data.jaewon}" },
      { name: "Julia", src: "${data.julia}" },
    ];

    const candlePoints = [
      ["42.8%", "52.05%"],
      ["45.9%", "51.8%"],
      ["49.0%", "51.35%"],
      ["52.0%", "51.85%"],
      ["55.15%", "52.15%"],
    ];

    let activeLetter = null;
    let blown = false;
    let blowStart = 0;
    let audioContext = null;
    let analyser = null;
    let micStream = null;
    let rafId = null;
    let fallbackTimer = null;
    let fallbackLevel = 0;
    let cardState = "closed";
    let mobilePage = "letters";

    function updateInteraction() {
      const ready = cardState === "open";
      const narrow = window.matchMedia("(max-width: 760px)").matches;
      lettersPage.inert = !ready || (narrow && mobilePage !== "letters");
      candlesPage.inert = !ready || (narrow && mobilePage !== "candles");
      candlePanel.inert = candlesPage.inert;
      topbar.inert = !ready;
      giftPage.inert = cardState !== "gift";
      openCard.disabled = cardState !== "closed";
      openCard.setAttribute("aria-expanded", String(ready));
    }

    function animateFold(open) {
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200;
      const started = performance.now();
      return new Promise((resolve) => {
        function frame(now) {
          const elapsed = duration ? Math.min(1, (now - started) / duration) : 1;
          const eased = (1 - Math.cos(Math.PI * elapsed)) / 2;
          const progress = open ? eased : 1 - eased;
          const shade = Math.sin(Math.PI * progress);
          physicalCard.style.setProperty("--opening", progress);
          physicalCard.style.setProperty("--shade", shade);
          physicalCard.style.setProperty("--lift", (shade * 14) + "px");
          if (elapsed < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
    }

    async function setOpen(open) {
      if (cardState !== (open ? "closed" : "open")) return;
      cardState = open ? "opening" : "closing";
      updateInteraction();
      stopFallback();
      blowStart = 0;
      if (!open) {
        tuckLetter();
        const needsPan = mobilePage === "candles" && window.matchMedia("(max-width: 760px)").matches;
        setMobilePage("letters", true);
        if (needsPan) {
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            await new Promise((resolve) => setTimeout(resolve, 420));
          }
        }
      }
      app.classList.remove("is-open");
      app.classList.add("is-turning");
      await animateFold(open);
      app.classList.remove("is-turning");
      app.classList.toggle("is-open", open);
      cardState = open ? "open" : "closed";
      updateInteraction();
      if (open) closeCard.focus({ preventScroll: true });
      else openCard.focus({ preventScroll: true });
    }

    openCard.addEventListener("click", () => setOpen(true));
    closeCard.addEventListener("click", () => setOpen(false));

    function animateGift(turnOver) {
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 800;
      const started = performance.now();
      return new Promise((resolve) => {
        function frame(now) {
          const elapsed = duration ? Math.min(1, (now - started) / duration) : 1;
          const eased = (1 - Math.cos(Math.PI * elapsed)) / 2;
          const progress = turnOver ? eased : 1 - eased;
          physicalCard.style.setProperty("--gift-turn", (progress * 180) + "deg");
          if (elapsed < 1) requestAnimationFrame(frame);
          else resolve();
        }
        requestAnimationFrame(frame);
      });
    }

    moreThing.addEventListener("click", async () => {
      if (cardState !== "open" || !blown || candlePanel.inert) return;
      await setOpen(false);
      cardState = "gift-opening";
      app.classList.add("gift-mode");
      updateInteraction();
      await animateGift(true);
      cardState = "gift";
      updateInteraction();
      if (!encryptedGift.ciphertext) {
        giftForm.hidden = true;
        giftStatus.textContent = "Your gift is still being wrapped.";
        giftBack.focus({ preventScroll: true });
      } else {
        giftPassword.focus({ preventScroll: true });
      }
    });

    giftBack.addEventListener("click", async () => {
      if (cardState !== "gift") return;
      cardState = "gift-closing";
      updateInteraction();
      giftDetails.value = "";
      giftPassword.value = "";
      giftStatus.textContent = "";
      giftResult.hidden = true;
      giftForm.hidden = false;
      giftContent.classList.remove("gift-unsealed");
      await animateGift(false);
      app.classList.remove("gift-mode");
      cardState = "closed";
      await setOpen(true);
      setMobilePage("candles");
    });

    function fromBase64(value) {
      return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
    }

    giftForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (cardState !== "gift" || unlockGift.disabled || !encryptedGift.ciphertext) return;
      if (!crypto.subtle) {
        giftStatus.textContent = "Open the card over HTTPS to unwrap your gift.";
        return;
      }
      unlockGift.disabled = true;
      giftStatus.textContent = "Unwrapping...";
      try {
        const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(giftPassword.value), "PBKDF2", false, ["deriveKey"]);
        const key = await crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: fromBase64(encryptedGift.salt), iterations: 310000, hash: "SHA-256" },
          material, { name: "AES-GCM", length: 256 }, false, ["decrypt"]
        );
        const bytes = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(encryptedGift.iv), tagLength: 128 }, key, fromBase64(encryptedGift.ciphertext));
        if (cardState !== "gift") return;
        giftDetails.value = new TextDecoder().decode(bytes);
        giftPassword.value = "";
        giftForm.hidden = true;
        giftResult.hidden = false;
        giftContent.classList.add("gift-unsealed");
        giftStatus.textContent = "Happy birthday, Ellen!";
        copyGift.focus({ preventScroll: true });
      } catch {
        if (cardState !== "gift") return;
        giftStatus.textContent = "Try again";
        giftContent.classList.remove("gift-shake");
        void giftContent.offsetWidth;
        giftContent.classList.add("gift-shake");
        giftPassword.select();
      } finally {
        unlockGift.disabled = false;
      }
    });

    copyGift.addEventListener("click", async () => {
      if (cardState !== "gift" || giftResult.hidden) return;
      try {
        await navigator.clipboard.writeText(giftDetails.value);
        giftStatus.textContent = "Copied!";
      } catch {
        giftDetails.focus({ preventScroll: true });
        giftDetails.select();
        giftStatus.textContent = "Select and copy your details.";
      }
    });

    function setMobilePage(page, force = false) {
      if (!force && cardState !== "open") return;
      const candleActive = page === "candles";
      mobilePage = page;
      app.classList.toggle("is-candles", candleActive);
      showLetters.disabled = !candleActive;
      showCandles.disabled = candleActive;
      pageName.textContent = candleActive ? "Candles" : "Letters";
      stopFallback();
      blowStart = 0;
      updateInteraction();
    }

    showLetters.addEventListener("click", () => setMobilePage("letters"));
    showCandles.addEventListener("click", () => setMobilePage("candles"));

    let touchX = null;
    document.getElementById("spread").addEventListener("touchstart", (event) => {
      if (cardState !== "open" || activeLetter !== null) return;
      touchX = event.changedTouches[0].clientX;
    }, { passive: true });
    document.getElementById("spread").addEventListener("touchend", (event) => {
      if (touchX === null) return;
      const dx = event.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 45 && window.matchMedia("(max-width: 760px)").matches) {
        setMobilePage(dx < 0 ? "candles" : "letters");
      }
    }, { passive: true });
    document.getElementById("spread").addEventListener("touchcancel", () => { touchX = null; }, { passive: true });

    document.querySelectorAll(".letter-peek").forEach((button) => {
      button.addEventListener("click", () => showLetter(Number(button.dataset.letter)));
    });

    function showLetter(index) {
      if (cardState !== "open" || lettersPage.inert) return;
      activeLetter = (index + letters.length) % letters.length;
      openLetterImg.src = letters[activeLetter].src;
      openLetterImg.alt = letters[activeLetter].name + "'s birthday letter";
      openLetter.classList.add("active");
    }

    function tuckLetter() {
      activeLetter = null;
      openLetter.classList.remove("active");
    }

    prevLetter.addEventListener("click", (event) => {
      event.stopPropagation();
      showLetter((activeLetter ?? 0) - 1);
    });
    nextLetter.addEventListener("click", (event) => {
      event.stopPropagation();
      showLetter((activeLetter ?? 0) + 1);
    });
    openLetter.addEventListener("click", tuckLetter);
    openLetterImg.addEventListener("click", tuckLetter);

    function buildCandles() {
      flamesRoot.innerHTML = "";
      smokeRoot.innerHTML = "";
      candlePoints.forEach(([x, y], index) => {
        const mask = document.createElement("span");
        mask.className = "flame-mask";
        mask.style.setProperty("--x", x);
        mask.style.setProperty("--y", y);
        // Sample adjacent photo texture to cover the printed flame.
        mask.style.backgroundPosition = ((parseFloat(x) + 1.1) / 98.2 * 100) + "% " + ((parseFloat(y) - 1.9) / 98.1 * 100) + "%";
        flamesRoot.append(mask);

        const flame = document.createElement("span");
        flame.className = "candle-flame";
        flame.dataset.index = String(index);
        flame.style.setProperty("--x", x);
        flame.style.setProperty("--y", y);
        flame.style.animationDelay = (index * -0.09) + "s";
        flamesRoot.append(flame);

        const smoke = document.createElement("span");
        smoke.className = "smoke";
        smoke.style.setProperty("--x", x);
        smoke.style.setProperty("--y", y);
        smokeRoot.append(smoke);
      });
    }

    function resetCandles() {
      blown = false;
      blowStart = 0;
      fallbackLevel = 0;
      buildCandles();
      wish.classList.add("show");
      relight.hidden = true;
      moreThing.hidden = true;
      enableMic.hidden = false;
      holdBlow.hidden = false;
      confetti.innerHTML = "";
      prompt.textContent = "blow out the candles!";
      setMeter(0);
    }

    function setMeter(value) {
      meterBar.style.width = Math.max(0, Math.min(100, value * 100)) + "%";
    }

    function applyBlow(level) {
      if (blown || cardState !== "open" || candlesPage.inert) return;
      setMeter(level);
      document.querySelectorAll(".candle-flame:not(.out)").forEach((flame, index) => {
        const bend = Math.min(34, level * 42) * (index % 2 ? 1 : .75);
        flame.style.setProperty("--bend", bend + "deg");
      });
      if (level > .56) {
        blowStart ||= performance.now();
        if (performance.now() - blowStart > 500) blowOut();
      } else {
        blowStart = 0;
      }
    }

    function blowOut() {
      if (blown || cardState !== "open" || candlesPage.inert) return;
      blown = true;
      wish.classList.remove("show");
      prompt.textContent = "the candles are out!";
      const flames = [...document.querySelectorAll(".candle-flame")];
      const smokes = [...document.querySelectorAll(".smoke")];
      flames.forEach((flame, index) => {
        setTimeout(() => {
          flame.classList.add("out");
          smokes[index].classList.remove("puff");
          void smokes[index].offsetWidth;
          smokes[index].classList.add("puff");
          if (index === flames.length - 1) {
            setTimeout(celebrate, 260);
          }
        }, index * 115);
      });
    }

    function celebrate() {
      relight.hidden = false;
      moreThing.hidden = false;
      enableMic.hidden = true;
      holdBlow.hidden = true;
      const colors = ["#ef759b", "#ffc1a6", "#a7eccf", "#9eeaf6", "#b54c78", "#f8d758"];
      confetti.innerHTML = "";
      for (let i = 0; i < 72; i++) {
        const piece = document.createElement("i");
        piece.style.setProperty("--x", (Math.random() * 100) + "%");
        piece.style.setProperty("--r", (Math.random() * 180) + "deg");
        piece.style.setProperty("--d", (1.9 + Math.random() * 1.6) + "s");
        piece.style.setProperty("--c", colors[i % colors.length]);
        piece.style.animationDelay = (Math.random() * .45) + "s";
        confetti.append(piece);
      }
    }

    async function enableMicrophone() {
      if (cardState !== "open" || candlePanel.inert) return;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(micStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = .72;
        source.connect(analyser);
        enableMic.textContent = "Mic on";
        enableMic.disabled = true;
        prompt.textContent = "blow toward the mic!";
        listen();
      } catch (error) {
        prompt.textContent = "mic unavailable - hold to blow";
        console.warn(error);
      }
    }

    function listen() {
      const data = new Uint8Array(analyser.fftSize);
      const loop = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) {
          const centered = (value - 128) / 128;
          sum += centered * centered;
        }
        const rms = Math.sqrt(sum / data.length);
        const level = Math.max(0, Math.min(1, (rms - .025) * 8.5));
        applyBlow(level);
        rafId = requestAnimationFrame(loop);
      };
      loop();
    }

    enableMic.addEventListener("click", enableMicrophone);
    relight.addEventListener("click", () => {
      if (cardState === "open" && !candlePanel.inert) resetCandles();
    });

    function startFallback() {
      if (cardState !== "open" || candlePanel.inert || activeLetter !== null) return;
      clearInterval(fallbackTimer);
      fallbackTimer = setInterval(() => {
        fallbackLevel = Math.min(1, fallbackLevel + .08);
        applyBlow(fallbackLevel);
      }, 55);
    }

    function stopFallback() {
      clearInterval(fallbackTimer);
      fallbackTimer = null;
      if (!blown) {
        const fade = setInterval(() => {
          fallbackLevel = Math.max(0, fallbackLevel - .08);
          applyBlow(fallbackLevel);
          if (fallbackLevel <= 0 || blown) clearInterval(fade);
        }, 70);
      }
    }

    holdBlow.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      holdBlow.setPointerCapture(event.pointerId);
      startFallback();
    });
    holdBlow.addEventListener("pointerup", stopFallback);
    holdBlow.addEventListener("pointercancel", stopFallback);
    window.addEventListener("keydown", (event) => {
      if (event.code === "Escape" && activeLetter !== null) tuckLetter();
      if (event.code === "Space" && !event.repeat && cardState === "open" && !candlePanel.inert && activeLetter === null) {
        event.preventDefault();
        startFallback();
      }
    });
    window.addEventListener("keyup", (event) => {
      if (event.code === "Space") stopFallback();
    });

    window.addEventListener("beforeunload", () => {
      cancelAnimationFrame(rafId);
      micStream?.getTracks().forEach((track) => track.stop());
      audioContext?.close();
    });

    window.matchMedia("(max-width: 760px)").addEventListener("change", updateInteraction);
    setMobilePage("letters", true);
    resetCandles();
  </script>
</body>
</html>
`;

writeFileSync(new URL("./index.html", import.meta.url), html);

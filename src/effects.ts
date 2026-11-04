/**
 * The badge's effects, lifted from floramaxwell.de (scripts/confetti.ts, scripts/pride.ts; Flo's
 * tuning from 2026-10-28/29): a throw of pride flags with gravity and air drag, sampled into keyframes
 * for the Web Animations API, a little plop, and a short rainbow trail. All of it flies in one fixed
 * layer on <body> that never catches clicks, shared by every badge and removed with the last one.
 * Styles are set through the CSSOM, which a strict Content-Security-Policy allows.
 */

const BASE_PX = 20;
const MAX_ALIVE = 40;
const STEPS = 24;

/** floramaxwell.de's throw for the badge: bigger and higher than the hearts. */
export const THROW = {
  count: 12, duration: 900, angle: 0, spread: 184, speedMin: 160, speedMax: 420, gravity: 420, drag: 1.75,
  sizeMin: 0.9, sizeMax: 1.5, scaleStart: 0.4, growMs: 225, fadeStart: 0.6, rotate: 30, spawn: 20,
};
export type Tune = typeof THROW;
export const FLAGS = ['🏳️‍🌈', '🏳️‍⚧️'];
/** px around the badge where the mouse leaves the trail (Flo: 40 → 60). */
export const NEAR = 60;
export const RAINBOW = ['#e40303', '#ff8c00', '#ffed00', '#008026', '#004dff', '#750787'];

let layer: HTMLElement | null = null;
let users = 0;

export function acquireLayer(): void { users++; }

export function releaseLayer(): void {
  users = Math.max(0, users - 1);
  if (!users) { layer?.remove(); layer = null; }
}

function host(): HTMLElement {
  if (layer?.isConnected) return layer;
  layer = document.createElement('div');
  layer.dataset.prideLayer = '';
  layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '2147483000', overflow: 'hidden' });
  document.body.append(layer);
  return layer;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function burst(origin: HTMLElement, emojis: string[] = FLAGS, tune: Partial<Tune> = {}): void {
  const box = origin.getBoundingClientRect();
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  const t = { ...THROW, ...tune };
  const into = host();
  for (let i = 0; i < t.count; i++) {
    const a = ((t.angle + rand(-t.spread / 2, t.spread / 2)) * Math.PI) / 180;
    const speed = rand(t.speedMin, t.speedMax);
    let vx = Math.sin(a) * speed;
    let vy = -Math.cos(a) * speed;
    let x = rand(-t.spawn, t.spawn);
    let y = rand(-t.spawn, t.spawn);
    const rot = rand(-t.rotate, t.rotate);
    const size = BASE_PX * rand(t.sizeMin, t.sizeMax);

    // Step the throw and keep a keyframe per step.
    const dt = t.duration / 1000 / STEPS;
    const frames: Keyframe[] = [];
    for (let s = 0; s <= STEPS; s++) {
      const p = s / STEPS;
      const grow = t.growMs ? Math.min(1, (s * dt * 1000) / t.growMs) : 1;
      const scale = t.scaleStart + (1 - t.scaleStart) * (1 - (1 - grow) ** 3);
      const fade = p < t.fadeStart ? 1 : 1 - (p - t.fadeStart) / (1 - t.fadeStart);
      frames.push({ transform: `translate(${x}px, ${y}px) rotate(${rot * p}deg) scale(${scale})`, opacity: Math.max(0, fade) ** 1.3 });
      vx -= vx * t.drag * dt;
      vy += t.gravity * dt - vy * t.drag * dt;
      x += vx * dt;
      y += vy * dt;
    }

    const el = document.createElement('span');
    el.dataset.prideFlag = '';
    el.textContent = emojis[i % emojis.length];
    Object.assign(el.style, { position: 'absolute', left: `${cx}px`, top: `${cy}px`, fontSize: `${size}px`, lineHeight: '1', translate: '-50% -50%' });
    into.append(el);
    el.animate(frames, { duration: t.duration, easing: 'linear' }).onfinish = () => el.remove();
  }
  // Keep it bubbling but bounded: drop the oldest flags.
  const alive = into.querySelectorAll('[data-pride-flag]');
  for (let i = 0; i < alive.length - MAX_ALIVE; i++) alive[i].remove();
}

/** The badge hops briefly. */
export function plop(el: HTMLElement): void {
  el.animate([{ scale: 1 }, { scale: 1.35 }, { scale: 1 }], { duration: 250, easing: 'ease-out' });
}

/** One bit of rainbow at x, y (window pixels) that fades away. */
export function trail(x: number, y: number): void {
  const into = host();
  RAINBOW.forEach((colour, i) => {
    const stripe = document.createElement('span');
    stripe.dataset.prideTrail = '';
    Object.assign(stripe.style, { position: 'absolute', left: `${x}px`, top: `${y + (i - 2.5) * 3}px`, width: '10px', height: '3px', background: colour, borderRadius: '2px', translate: '-50% -50%' });
    into.append(stripe);
    stripe.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px) scaleX(0.4)' }], { duration: 700, easing: 'ease-out' }).onfinish = () => stripe.remove();
  });
}

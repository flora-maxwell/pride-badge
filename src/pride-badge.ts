/**
 * <pride-badge>: floramaxwell.de's "Stronger together." badge for any website
 * (spec: floramaxwell.de docs/superpowers/specs/2026-11-02-pride-badge-package-design.md).
 * Attributes: texts, lang, effects="off", trail="off", trail-reach="60", touch-trail="off", shadow="off".
 */
import { NEAR, acquireLayer, parseReach, burst, plop, releaseLayer, trail } from './effects';
import { flag } from './flag';
import { LABELS, TEXTS, nextKey, parseTexts, resolveLang, type Key, type Lang } from './messages';
import { CSS } from './styles';

const REDUCED = typeof matchMedia === 'undefined' ? null : matchMedia('(prefers-reduced-motion: reduce)');
const FINE = typeof matchMedia === 'undefined' ? null : matchMedia('(hover: hover) and (pointer: fine)');

/** Flo's "Rollen" from the prototype (2026-11-03): the old sentence rolls up and out, the new one in from below. */
const ROLL = { ease: 'cubic-bezier(.22,.61,.36,1)', out: 220, inDelay: 120, in: 240, width: 360, shift: '70%' };

let sheet: CSSStyleSheet | null = null;
/** One shared constructed stylesheet (works under a strict CSP); a <style> where that's missing. */
function adoptStyles(root: ShadowRoot): void {
  if ('adoptedStyleSheets' in root && typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
    sheet ??= new CSSStyleSheet();
    if (!sheet.cssRules.length) sheet.replaceSync(CSS);
    root.adoptedStyleSheets = [sheet];
  } else {
    const style = document.createElement('style');
    style.textContent = CSS;
    root.append(style);
  }
}

// On the server (no DOM) the class extends a stand-in, so importing the module doesn't throw.
const Base = (typeof HTMLElement === 'undefined' ? class {} : HTMLElement) as typeof HTMLElement;

export class PrideBadge extends Base {
  static observedAttributes = ['texts', 'lang', 'effects', 'trail', 'trail-reach', 'touch-trail', 'shadow'];

  #root: ShadowRoot;
  #button: HTMLButtonElement;
  #flag: HTMLElement;
  #text: HTMLElement;
  #now: HTMLElement;
  #width: Animation | null = null;
  #sr: HTMLElement;
  #live: HTMLElement;
  #key: Key = 'stronger-together';
  #last = 0;
  #reach = NEAR;
  #held = false;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    adoptStyles(this.#root);
    this.#button = document.createElement('button');
    this.#button.type = 'button';
    this.#flag = Object.assign(document.createElement('span'), { className: 'flag' });
    this.#flag.append(flag());
    this.#flag.setAttribute('role', 'img');
    this.#text = Object.assign(document.createElement('span'), { className: 'text' });
    this.#now = document.createElement('span');
    this.#text.append(this.#now);
    this.#sr = Object.assign(document.createElement('span'), { className: 'sr' });
    this.#live = Object.assign(document.createElement('span'), { className: 'live' });
    this.#live.setAttribute('aria-live', 'polite');
    this.#button.append(this.#flag, this.#text, this.#sr);
    this.#root.append(this.#button, this.#live);
    this.#button.addEventListener('click', () => this.#clicked());
    this.addEventListener('pointerdown', (e) => this.#down(e));
    this.addEventListener('pointermove', (e) => this.#move(e));
    this.addEventListener('pointerup', () => { this.#held = false; });
    this.addEventListener('pointercancel', () => { this.#held = false; });
  }

  get key(): Key { return this.#key; }

  get #language(): Lang { return resolveLang(this.getAttribute('lang'), document.documentElement.getAttribute('lang')); }

  connectedCallback(): void {
    this.#render(true);
    REDUCED?.addEventListener('change', this.#motionChanged);
    acquireLayer();
    document.addEventListener('pointermove', this.#near, { passive: true });
  }

  disconnectedCallback(): void {
    document.removeEventListener('pointermove', this.#near);
    REDUCED?.removeEventListener('change', this.#motionChanged);
    this.#held = false;
    releaseLayer();
  }

  #motionChanged = (): void => this.#render(false);

  /** Effects run unless switched off or the visitor asks for reduced motion. */
  get #moving(): boolean { return this.getAttribute('effects') !== 'off' && !REDUCED?.matches; }

  #clicked(): void {
    if (this.getAttribute('effects') === 'off') return;
    if (this.#moving) {
      burst(this.#button);
      plop(this.#button);
    }
    const list = parseTexts(this.getAttribute('texts'));
    if (list.length < 2) return;
    this.#key = nextKey(list, this.#key);
    this.#swap();
  }

  /** Show the new sentence, rolled in unless the visitor asks for reduced motion; announce it. */
  #swap(): void {
    const sentence = TEXTS[this.#key][this.#language];
    this.dataset.key = this.#key;
    this.#live.textContent = sentence;
    // A click mid-glide carries on from the width on screen (computed style ignores the plop's scale).
    const from = parseFloat(getComputedStyle(this.#button).width);
    this.#width?.cancel();
    this.#text.querySelectorAll('[data-leaving]').forEach((el) => el.remove());
    const shown = parseFloat(getComputedStyle(this.#now).opacity);
    this.#now.getAnimations().forEach((a) => a.cancel());
    if (REDUCED?.matches) {
      this.#now.textContent = sentence;
      return;
    }
    const leaving = this.#now.cloneNode(true) as HTMLElement;
    leaving.dataset.leaving = '';
    leaving.setAttribute('aria-hidden', 'true');
    leaving.style.position = 'absolute';
    leaving.style.left = '0';
    leaving.style.top = '0';
    this.#now.textContent = sentence;
    const to = parseFloat(getComputedStyle(this.#button).width);
    this.#text.append(leaving);
    leaving.animate([{ opacity: shown, transform: 'none' }, { opacity: 0, transform: `translateY(-${ROLL.shift})` }],
      { duration: ROLL.out, easing: ROLL.ease, fill: 'forwards' }).onfinish = () => leaving.remove();
    this.#now.animate([{ opacity: 0, transform: `translateY(${ROLL.shift})` }, { opacity: 1, transform: 'none' }],
      { duration: ROLL.in, delay: ROLL.inDelay, easing: ROLL.ease, fill: 'backwards' });
    this.#width = this.#button.animate([{ width: `${from}px` }, { width: `${to}px` }], { duration: ROLL.width, easing: ROLL.ease });
  }

  /** The mouse leaves the trail within `trail-reach` px of the badge (NEAR by default). */
  #near = (e: PointerEvent): void => {
    if (e.pointerType !== 'mouse' || !FINE?.matches || !this.#moving || this.getAttribute('trail') === 'off' || e.timeStamp - this.#last < 16) return;
    const r = this.#button.getBoundingClientRect();
    const d = this.#reach;
    if (e.clientX < r.left - d || e.clientX > r.right + d || e.clientY < r.top - d || e.clientY > r.bottom + d) return;
    this.#last = e.timeStamp;
    trail(e.clientX, e.clientY);
  };

  /** A finger that starts on the badge draws the trail wherever it goes (touch-action: none holds the page). */
  #down(e: PointerEvent): void {
    if (e.pointerType === 'mouse' || !this.#moving || this.getAttribute('trail') === 'off' || this.getAttribute('touch-trail') === 'off') return;
    this.#held = true;
    try { this.setPointerCapture(e.pointerId); } catch { /* synthetic events have no capture */ }
  }

  #move(e: PointerEvent): void {
    if (!this.#held || e.pointerType === 'mouse' || e.timeStamp - this.#last < 16) return;
    this.#last = e.timeStamp;
    trail(e.clientX, e.clientY);
  }

  attributeChangedCallback(name: string): void {
    if (name === 'trail-reach') this.#reach = parseReach(this.getAttribute('trail-reach'));
    if (name === 'texts' || name === 'lang' || name === 'effects') this.#render(name === 'texts');
  }

  /** Show the current sentence; `restart` goes back to the first of `texts`. */
  #render(restart: boolean): void {
    const list = parseTexts(this.getAttribute('texts'));
    if (restart || !list.includes(this.#key)) this.#key = list[0];
    const lang = this.#language;
    this.dataset.key = this.#key;
    this.#width?.cancel();
    this.#text.querySelectorAll('[data-leaving]').forEach((el) => el.remove());
    this.#now.textContent = TEXTS[this.#key][lang];
    // Screen readers only hear about flags when flags fly; the sentence is read in its own language.
    this.#sr.textContent = this.#moving ? LABELS[lang].action : '';
    this.#button.lang = lang;
    this.#live.lang = lang;
    this.#flag.setAttribute('aria-label', LABELS[lang].flag);
  }
}
